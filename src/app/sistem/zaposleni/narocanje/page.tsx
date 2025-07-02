"use client"

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase/firebase";
import { collection, query, where, getDocs, addDoc, orderBy, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { format, addDays, startOfWeek, isBefore, setHours, setMinutes, setSeconds, nextMonday } from "date-fns";
import { sl } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MenuOption {
  description: string;
}

interface Menu {
  id: string;
  date: string;
  options: MenuOption[];
  companyId: string;
}

type MenuSelection = { menuId: string; optionIndex: number } | { none: true };

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const [menus, setMenus] = useState<(Menu | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selections, setSelections] = useState<{ [date: string]: MenuSelection }>({});
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [selectedWeek, setSelectedWeek] = useState<Date | null>(null);
  const [orderForWeek, setOrderForWeek] = useState<any>(null);
  const [showConfirmationAnimation, setShowConfirmationAnimation] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [hasEdited, setHasEdited] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Always show the closest upcoming Monday as the initial week
  const today = new Date();
  let targetMonday = startOfWeek(addDays(today, 1), { weekStartsOn: 1 });
  if (today.getDay() === 1) targetMonday = today; // If today is Monday, show this week
  const initialWeek = targetMonday;
  const weekStart = selectedWeek || initialWeek;
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekStartStr = format(weekStart, "yyyy-MM-dd");

  useEffect(() => {
    const stored = sessionStorage.getItem('employee');
    if (!stored) {
      router.replace("/sistem/zaposleni/login");
      return;
    }
    setEmployee(JSON.parse(stored));
  }, [router]);

  useEffect(() => {
    if (employee) {
      fetchMenus();
      checkOrderForWeek();
    }
    // eslint-disable-next-line
  }, [employee, weekStartStr]);

  useEffect(() => {
    if (orderForWeek && orderForWeek.id) {
      const editedKey = `order-edited-${orderForWeek.id}`;
      setHasEdited(!!sessionStorage.getItem(editedKey));
    }
  }, [orderForWeek]);

  // Show toast when order is submitted
  useEffect(() => {
    if (orderForWeek && !editMode) {
      setShowSuccessToast(true);
      const timer = setTimeout(() => setShowSuccessToast(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [orderForWeek, editMode]);

  const fetchMenus = async () => {
    setLoading(true);
    setError(null);
    try {
      const menusRef = collection(db, "menus");
      const q = query(
        menusRef,
        where("companyId", "in", [employee?.companyId, "all"]),
        where("date", ">=", format(weekDays[0], "yyyy-MM-dd")),
        where("date", "<=", format(weekDays[6], "yyyy-MM-dd")),
        orderBy("date", "asc")
      );
      const querySnapshot = await getDocs(q);
      const menuMap: { [date: string]: Menu } = {};
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data() as Menu;
        const { id: _id, ...rest } = data;
        menuMap[data.date] = { id: doc.id, ...rest };
      });
      setMenus(weekDays.map((day) => menuMap[format(day, "yyyy-MM-dd")] || null));
    } catch (err) {
      setError("Napaka pri nalaganju menijev.");
    } finally {
      setLoading(false);
    }
  };

  const checkOrderForWeek = async () => {
    setOrderForWeek(null);
    if (!employee) return;
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("employeeId", "==", employee.id),
      where("weekStart", "==", weekStartStr)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      setOrderForWeek({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
    }
  };

  const handleSelect = (date: string, menuId: string, optionIndex: number) => {
    setSelections((prev) => ({ ...prev, [date]: { menuId, optionIndex } }));
  };

  const handleSubmitOrder = async () => {
    setOrderLoading(true);
    setOrderError(null);
    try {
      const docRef = await addDoc(collection(db, "orders"), {
        employeeId: employee.id,
        employeeName: employee.name,
        companyId: employee.companyId,
        weekStart: weekStartStr,
        selections,
        createdAt: Timestamp.now(),
      });
      setShowConfirmationAnimation(true);
      setTimeout(() => {
        setShowConfirmationAnimation(false);
        setOrderForWeek({
          id: docRef.id,
          employeeId: employee.id,
          employeeName: employee.name,
          companyId: employee.companyId,
          weekStart: weekStartStr,
          selections,
          createdAt: new Date(),
        });
      }, 1800);
    } catch (err) {
      setOrderError("Napaka pri oddaji naročila. Poskusite znova.");
    } finally {
      setOrderLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!orderForWeek?.id) return;
    setUpdateLoading(true);
    setUpdateError(null);
    try {
      const orderRef = collection(db, "orders");
      await import("firebase/firestore").then(({ doc, updateDoc }) =>
        updateDoc(doc(orderRef, orderForWeek.id), { selections })
      );
      setEditMode(false);
      setOrderForWeek({ ...orderForWeek, selections });
      setHasEdited(true);
      sessionStorage.setItem(`order-edited-${orderForWeek.id}`, "1");
    } catch (err) {
      setUpdateError("Napaka pri shranjevanju sprememb. Poskusite znova.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setPendingSubmit(true);
    await handleSubmitOrder();
    setPendingSubmit(false);
  };

  // Check if at least one day has a selection
  const anySelected = Object.keys(selections).length > 0;

  // Check if all workdays (Mon-Fri) have a selection
  const workWeekDays = weekDays.filter(day => {
    const d = day.getDay();
    return d >= 1 && d <= 5; // Monday (1) to Friday (5)
  });
  const allDaysSelected = workWeekDays.every(day => {
    const dateStr = format(day, "yyyy-MM-dd");
    return selections[dateStr] !== undefined;
  });

  // --- Skeleton loader for menu cards ---
  const MenuSkeleton = () => (
    <div className="bg-white rounded-2xl shadow p-6 animate-pulse flex flex-col gap-4">
      <div className="h-6 w-1/3 bg-gray-200 rounded" />
      <div className="h-4 w-2/3 bg-gray-100 rounded" />
      <div className="h-4 w-1/2 bg-gray-100 rounded" />
      <div className="h-10 w-full bg-gray-100 rounded mt-2" />
    </div>
  );

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: 'rgb(35,31,32)' }}>
      {/* Success Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg text-base font-semibold animate-fade-in max-w-md w-[90vw]">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 13l3 3 7-7" /></svg>
          Vaše naročilo za ta teden uspešno oddano! Hvala.
          <button onClick={() => setShowSuccessToast(false)} className="ml-2 text-white hover:text-green-100 focus:outline-none">✕</button>
        </div>
      )}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Dashboard Header Card */}
        {employee && (
          <div className="mb-8 w-full bg-white rounded-2xl shadow flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:gap-4 md:px-6 md:py-4">
            {/* Welcome */}
            <div className="flex flex-col items-center md:flex-row md:items-center gap-2 md:gap-3 min-w-0">
              <div className="flex items-center justify-center w-11 h-11 rounded-full bg-yellow-400 text-[#231F20] text-xl font-extrabold shadow-md">
                {employee.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex flex-col min-w-0 items-center md:items-start">
                <span className="text-base font-bold text-yellow-700 truncate">Dobrodošel, {employee.name}!</span>
                {employee.companyName && (
                  <span className="text-xs text-yellow-500 font-medium truncate">{employee.companyName}</span>
                )}
              </div>
            </div>
            {/* Week Navigation */}
            <div className="flex items-center justify-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setSelectedWeek(w => addDays((w || initialWeek), -7))}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-300 text-yellow-900 font-bold shadow hover:bg-yellow-400 transition text-lg"
                aria-label="Prejšnji teden"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span className="text-lg md:text-xl font-bold text-yellow-900 px-2 md:px-4 whitespace-nowrap">
                {format(weekStart, 'd. MMMM', { locale: sl })} - {format(addDays(weekStart, 4), 'd. MMMM', { locale: sl })}
              </span>
              <button
                onClick={() => setSelectedWeek(w => addDays((w || initialWeek), 7))}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-300 text-yellow-900 font-bold shadow hover:bg-yellow-400 transition text-lg"
                aria-label="Naslednji teden"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            {/* Logout - only on desktop */}
            <div className="hidden md:flex w-full md:w-auto justify-center md:justify-end">
              <button
                onClick={() => {
                  sessionStorage.removeItem('employee');
                  router.replace('/sistem/zaposleni/login');
                }}
                className="w-full md:w-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow transition text-base mt-2 md:mt-0"
              >
                Odjava
              </button>
            </div>
          </div>
        )}
        {/* Info Card below header */}
        <div className="mb-8 w-full bg-yellow-50 border border-yellow-200 rounded-2xl shadow-sm px-6 py-4 text-yellow-900 text-base font-medium">
          Preprosto naročilo malic. Izberi med naloženimi meniji, in oddaj svoje naročilo. Vedno dvakrat preverite vaše izbire, saj naročila ni možno urejati. Dober tek!
        </div>
        {showConfirmationAnimation ? (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{background: 'rgba(255, 214, 0, 0.8)'}}>
            <div className="relative flex flex-col items-center justify-center">
              <ConfettiAnimation />
              <div className="text-4xl md:text-5xl mb-4">🎉</div>
              <div className="text-2xl md:text-3xl font-extrabold text-yellow-900 mb-2 text-center drop-shadow">Naročilo uspešno oddano!</div>
              <div className="text-yellow-900 text-lg font-medium text-center">Vaše naročilo je bilo uspešno oddano.</div>
            </div>
          </div>
        ) : orderForWeek && !editMode ? (
          <div>
            {/* Success card/banner removed, only toast remains */}
            <div className="space-y-6 mt-6">
              {weekDays.map((day, idx) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const menu = menus[idx];
                const selection = orderForWeek.selections?.[dateStr];
                const isLocked = true; // Cards are always locked in submitted state
                const isMenuSelection = (sel: MenuSelection | undefined): sel is { menuId: string; optionIndex: number } => !!sel && 'menuId' in sel && 'optionIndex' in sel;
                const isNoneSelection = (sel: MenuSelection | undefined): sel is { none: true } => !!sel && 'none' in sel;
                return (
                  <div key={dateStr} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4 mb-8 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-lg md:text-2xl font-extrabold text-yellow-700 uppercase tracking-wide">
                        {day.toLocaleDateString('sl-SI', { weekday: 'long' })}, {format(day, 'd. MMMM', { locale: sl })}
                      </div>
                    </div>
                    {menu ? (
                      <div className="flex flex-col gap-2">
                        {menu.options.map((option, optionIdx) => {
                          const isSelected = selection && 'menuId' in selection && selection.menuId === menu.id && selection.optionIndex === optionIdx;
                          return (
                            <button
                              key={optionIdx}
                              onClick={() => !isLocked && handleSelect(dateStr, menu.id, optionIdx)}
                              disabled={isLocked}
                              className={`w-full text-left px-5 py-4 rounded-lg border font-medium text-base md:text-lg transition-all focus:outline-none
                                ${isSelected ? 'border-yellow-500 bg-yellow-100 text-yellow-900 font-bold shadow-yellow-200' : 'border-gray-200 bg-white text-gray-900 hover:border-yellow-300 hover:bg-yellow-50'}
                                ${isLocked && !isSelected ? 'opacity-40 pointer-events-none' : ''}`}
                            >
                              <span>{option.description}</span>
                              {isSelected && <span className="ml-3 text-yellow-500 font-bold text-xl align-middle">✓</span>}
                            </button>
                          );
                        })}
                        {/* No meal option */}
                        {(!isLocked || (isLocked && selection && 'none' in selection)) && (
                          <button
                            onClick={() => !isLocked && setSelections(prev => ({ ...prev, [dateStr]: { none: true } }))}
                            disabled={isLocked}
                            className={`w-full text-left px-5 py-4 rounded-lg border font-medium text-base md:text-lg transition-all focus:outline-none mt-1
                              ${selection && 'none' in selection ? 'border-yellow-400 bg-yellow-50 text-yellow-400 font-bold' : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-yellow-200 hover:bg-yellow-50'}
                              ${isLocked && !(selection && 'none' in selection) ? 'opacity-40 pointer-events-none' : ''}`}
                          >
                            Ne potrebujem hrane za ta dan
                            {selection && 'none' in selection && <span className="ml-3 text-yellow-400 font-bold text-xl align-middle">✓</span>}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-300 italic text-base">Za ta dan ni menija.</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : orderForWeek && editMode ? (
          <div>
            <div className="text-center text-yellow-500 font-semibold text-lg py-8">
              Urejate naročilo za ta teden
            </div>
            <div className="space-y-6">
              {weekDays.map((day, idx) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const menu = menus[idx];
                const selected = selections[dateStr];
                const isLocked = false; // Cards are always editable in edit mode
                const isMenuSelection = (sel: MenuSelection | undefined): sel is { menuId: string; optionIndex: number } => !!sel && 'menuId' in sel && 'optionIndex' in sel;
                const isNoneSelection = (sel: MenuSelection | undefined): sel is { none: true } => !!sel && 'none' in sel;
                return (
                  <div key={dateStr} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4 mb-8 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-lg md:text-2xl font-extrabold text-yellow-700 uppercase tracking-wide">
                        {day.toLocaleDateString('sl-SI', { weekday: 'long' })}, {format(day, 'd. MMMM', { locale: sl })}
                      </div>
                    </div>
                    {menu ? (
                      <div className="flex flex-col gap-2">
                        {menu.options.map((option, optionIdx) => {
                          const isSelected = selected && 'menuId' in selected && selected.menuId === menu.id && selected.optionIndex === optionIdx;
                          return (
                            <button
                              key={optionIdx}
                              onClick={() => !isLocked && handleSelect(dateStr, menu.id, optionIdx)}
                              disabled={isLocked}
                              className={`w-full text-left px-5 py-4 rounded-lg border font-medium text-base md:text-lg transition-all focus:outline-none
                                ${isSelected ? 'border-yellow-500 bg-yellow-100 text-yellow-900 font-bold shadow-yellow-200' : 'border-gray-200 bg-white text-gray-900 hover:border-yellow-300 hover:bg-yellow-50'}
                                ${isLocked && !isSelected ? 'opacity-40 pointer-events-none' : ''}`}
                            >
                              <span>{option.description}</span>
                              {isSelected && <span className="ml-3 text-yellow-500 font-bold text-xl align-middle">✓</span>}
                            </button>
                          );
                        })}
                        {/* No meal option */}
                        {(!isLocked || (isLocked && selected && 'none' in selected)) && (
                          <button
                            onClick={() => !isLocked && setSelections(prev => ({ ...prev, [dateStr]: { none: true } }))}
                            disabled={isLocked}
                            className={`w-full text-left px-5 py-4 rounded-lg border font-medium text-base md:text-lg transition-all focus:outline-none mt-1
                              ${selected && 'none' in selected ? 'border-yellow-400 bg-yellow-50 text-yellow-400 font-bold' : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-yellow-200 hover:bg-yellow-50'}
                              ${isLocked && !(selected && 'none' in selected) ? 'opacity-40 pointer-events-none' : ''}`}
                          >
                            Ne potrebujem hrane za ta dan
                            {selected && 'none' in selected && <span className="ml-3 text-yellow-400 font-bold text-xl align-middle">✓</span>}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-300 italic text-base">Za ta dan ni menija.</div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center mt-8 gap-4">
              <button
                className="px-8 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-xl shadow-lg text-lg transition"
                onClick={() => setEditMode(false)}
                disabled={updateLoading}
              >
                Prekliči
              </button>
              <button
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow-lg text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!allDaysSelected || updateLoading}
                onClick={handleUpdateOrder}
              >
                {updateLoading ? 'Shranjujem...' : 'Shrani spremembe'}
              </button>
            </div>
            {updateError && <div className="text-center text-red-500 mt-2">{updateError}</div>}
          </div>
        ) : (
          <div className="space-y-6 mb-32">
            {weekDays.map((day, idx) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const menu = menus[idx];
              const selected = selections[dateStr];
              const isLocked = !!orderForWeek && (!editMode && hasEdited || (!editMode && !hasEdited && !showConfirmationAnimation));
              // Helper type guards
              const isMenuSelection = (sel: MenuSelection | undefined): sel is { menuId: string; optionIndex: number } => !!sel && 'menuId' in sel && 'optionIndex' in sel;
              const isNoneSelection = (sel: MenuSelection | undefined): sel is { none: true } => !!sel && 'none' in sel;
              return (
                <div key={dateStr} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4 mb-8 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-lg md:text-2xl font-extrabold text-yellow-700 uppercase tracking-wide">
                      {day.toLocaleDateString('sl-SI', { weekday: 'long' })}, {format(day, 'd. MMMM', { locale: sl })}
                    </div>
                  </div>
                  {menu ? (
                    <div className="flex flex-col gap-2">
                      {menu.options.map((option, optionIdx) => {
                        const isSelected = selected && 'menuId' in selected && selected.menuId === menu.id && selected.optionIndex === optionIdx;
                        return (
                          <button
                            key={optionIdx}
                            onClick={() => !isLocked && handleSelect(dateStr, menu.id, optionIdx)}
                            disabled={isLocked}
                            className={`w-full text-left px-5 py-4 rounded-lg border font-medium text-base md:text-lg transition-all focus:outline-none
                              ${isSelected ? 'border-yellow-500 bg-yellow-100 text-yellow-900 font-bold shadow-yellow-200' : 'border-gray-200 bg-white text-gray-900 hover:border-yellow-300 hover:bg-yellow-50'}
                              ${isLocked && !isSelected ? 'opacity-40 pointer-events-none' : ''}`}
                          >
                            <span>{option.description}</span>
                            {isSelected && <span className="ml-3 text-yellow-500 font-bold text-xl align-middle">✓</span>}
                          </button>
                        );
                      })}
                      {/* No meal option */}
                      {(!isLocked || (isLocked && selected && 'none' in selected)) && (
                        <button
                          onClick={() => !isLocked && setSelections(prev => ({ ...prev, [dateStr]: { none: true } }))}
                          disabled={isLocked}
                          className={`w-full text-left px-5 py-4 rounded-lg border font-medium text-base md:text-lg transition-all focus:outline-none mt-1
                            ${selected && 'none' in selected ? 'border-yellow-400 bg-yellow-50 text-yellow-400 font-bold' : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-yellow-200 hover:bg-yellow-50'}
                            ${isLocked && !(selected && 'none' in selected) ? 'opacity-40 pointer-events-none' : ''}`}
                        >
                          Ne potrebujem hrane za ta dan
                          {selected && 'none' in selected && <span className="ml-3 text-yellow-400 font-bold text-xl align-middle">✓</span>}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-300 italic text-base">Za ta dan ni menija.</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Sticky Footer: Progress, Potrdi naročilo, Logout */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-gray-200 shadow-lg flex flex-col md:flex-row items-center md:justify-between gap-3 px-4 py-3" style={{maxWidth: '100vw'}}>
        {/* Progress Bar */}
        <div className="flex flex-col w-full md:w-1/3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">Izbranih dni</span>
            <span className="text-xs font-bold text-yellow-700">{workWeekDays.filter(day => selections[format(day, 'yyyy-MM-dd')]).length}/{workWeekDays.length}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400 transition-all" style={{width: `${Math.round((workWeekDays.filter(day => selections[format(day, 'yyyy-MM-dd')]).length / workWeekDays.length) * 100)}%`}}></div>
          </div>
        </div>
        {/* Main Action Button: Only allow submit, no edit */}
        <button
          className="w-full md:w-auto px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow transition text-base disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!allDaysSelected || orderLoading || !!orderForWeek || pendingSubmit}
          onClick={() => setShowConfirmModal(true)}
        >
          {orderLoading || pendingSubmit ? 'Oddajam naročilo...' : 'Potrdi naročilo'}
        </button>
        {/* Logout Button - only on mobile */}
        <button
          onClick={() => {
            sessionStorage.removeItem('employee');
            router.replace('/sistem/zaposleni/login');
          }}
          className="w-full md:hidden px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow transition text-base"
        >
          Odjava
        </button>
      </div>
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full flex flex-col items-center">
            <div className="text-2xl font-bold text-yellow-700 mb-4 text-center">Ste prepričani?</div>
            <div className="text-gray-700 text-center mb-6">Preverite svoje izbire. Naročila po oddaji ne bo mogoče več spreminjati.</div>
            <div className="flex gap-4 w-full">
              <button
                className="flex-1 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold transition"
                onClick={() => setShowConfirmModal(false)}
                disabled={pendingSubmit}
              >
                Prekliči
              </button>
              <button
                className="flex-1 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-bold transition"
                onClick={handleConfirmSubmit}
                disabled={pendingSubmit}
              >
                Potrdi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfettiAnimation() {
  // Simple confetti: 20 colored circles with random positions and animations
  const colors = ["#FFD600", "#FF4081", "#536DFE", "#00E676", "#FF9100", "#00B8D4"];
  const confetti = Array.from({ length: 20 }, (_, i) => ({
    left: Math.random() * 90 + "%",
    delay: Math.random() * 0.5,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 16 + 12,
    duration: Math.random() * 0.7 + 1.2,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 w-full h-full z-0">
      {confetti.map((c, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: c.left,
            top: 0,
            width: c.size,
            height: c.size,
            backgroundColor: c.color,
            borderRadius: "50%",
            opacity: 0.85,
            animation: `confetti-fall ${c.duration}s cubic-bezier(0.23,1,0.32,1) ${c.delay}s both`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-40px) scale(1) rotate(0deg); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(420px) scale(0.85) rotate(360deg); opacity: 0; }
        }
        .animate-fade-in {
          animation: fadeIn 0.7s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
} 