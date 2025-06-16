"use client"

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase/firebase";
import { collection, query, where, getDocs, addDoc, orderBy, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { format, addDays, startOfWeek, isBefore, setHours, setMinutes, setSeconds, nextMonday } from "date-fns";
import { sl } from "date-fns/locale";

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
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Stylish Top Section */}
        {employee && (
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-400 text-white text-2xl font-extrabold shadow">
                {employee.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-yellow-400">Pozdravljeni,</div>
                <div className="text-2xl font-extrabold text-white tracking-tight" style={{ letterSpacing: '-0.01em' }}>{employee.name}</div>
              </div>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem('employee');
                router.replace('/sistem/zaposleni/login');
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow transition text-base"
            >
              Odjava
            </button>
          </div>
        )}
        {/* Week Navigation */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedWeek(prev => {
                const base = prev || initialWeek;
                // Prevent going before the initial week
                const prevWeek = addDays(base, -7);
                if (prevWeek < initialWeek) return initialWeek;
                return prevWeek;
              })}
              className="px-5 py-2 text-sm font-semibold rounded-full border-2 border-yellow-400 text-yellow-400 bg-transparent hover:bg-yellow-50 hover:text-yellow-600 transition disabled:opacity-40 shadow-sm"
              disabled={weekStart.getTime() === initialWeek.getTime()}
            >
              ← Prejšnji teden
            </button>
            <span className="text-base font-semibold text-white px-2 bg-yellow-500 rounded-full py-1 px-4 shadow">
              {format(weekStart, 'd. MMMM yyyy', { locale: sl })} – {format(addDays(weekStart, 6), 'd. MMMM yyyy', { locale: sl })}
            </span>
            <button
              onClick={() => setSelectedWeek(prev => {
                const base = prev || initialWeek;
                return addDays(base, 7);
              })}
              className="px-5 py-2 text-sm font-semibold rounded-full border-2 border-yellow-400 text-yellow-400 bg-transparent hover:bg-yellow-50 hover:text-yellow-600 transition shadow-sm"
            >
              Naslednji teden →
            </button>
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-yellow-400 mb-2 text-center tracking-tight" style={{ letterSpacing: '-0.01em' }}>
          Naročilo malic
        </h1>
        <p className="text-gray-300 text-center mb-10 text-base font-normal">
          Izberite obrok za vsak dan v tednu ali izberite, da hrane ne potrebujete.
        </p>
        {loading ? (
          <div className="space-y-6">
            {weekDays.map((_, idx) => <MenuSkeleton key={idx} />)}
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : showConfirmationAnimation ? (
          <div className="flex flex-col items-center justify-center py-16 relative">
            {/* Confetti animation */}
            <ConfettiAnimation />
            {/* Animated checkmark SVG */}
            <svg className="w-24 h-24 text-green-500 animate-bounce z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 13l3 3 7-7" />
            </svg>
            <div className="mt-4 text-green-600 text-xl font-bold animate-fade-in z-10">Naročilo oddano!</div>
          </div>
        ) : orderForWeek && !editMode ? (
          <div>
            <div className="text-center text-green-500 font-semibold text-lg py-8">
              Naročilo uspešno oddano! Hvala.
            </div>
            <div className="space-y-6 mt-6">
              {weekDays.map((day, idx) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const menu = menus[idx];
                const selection = orderForWeek.selections?.[dateStr];
                const isMenuSelection = (sel: MenuSelection | undefined): sel is { menuId: string; optionIndex: number } => !!sel && 'menuId' in sel && 'optionIndex' in sel;
                const isNoneSelection = (sel: MenuSelection | undefined): sel is { none: true } => !!sel && 'none' in sel;
                return (
                  <div key={dateStr} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3 border border-gray-100 opacity-90">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-yellow-500">
                        {day.toLocaleDateString('sl-SI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    {!menu ? (
                      <div className="text-gray-400 text-sm italic">
                        Za ta dan ni naloženih menijev.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {menu.options.map((option, optIdx) => (
                          <button
                            key={optIdx}
                            type="button"
                            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border-2 font-semibold text-base shadow-sm focus:outline-none
                              ${isMenuSelection(selection) && selection.optionIndex === optIdx
                                ? 'bg-yellow-500 border-yellow-500 text-white opacity-100'
                                : 'bg-white border-yellow-300 text-yellow-700 opacity-60'}
                            `}
                            disabled
                          >
                            <span>{option.description}</span>
                            {isMenuSelection(selection) && selection.optionIndex === optIdx && (
                              <span className="ml-2 text-white bg-yellow-600 rounded-full px-2 py-0.5 text-xs font-bold">Oddano</span>
                            )}
                          </button>
                        ))}
                        <button
                          type="button"
                          className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border-2 font-semibold text-base shadow-sm focus:outline-none mt-2
                            ${isNoneSelection(selection)
                              ? 'bg-gray-300 border-gray-400 text-white opacity-100'
                              : 'bg-white border-gray-200 text-gray-500 opacity-60'}
                          `}
                          disabled
                        >
                          <span>Ne potrebujem hrane za ta dan</span>
                          {isNoneSelection(selection) && (
                            <span className="ml-2 text-white bg-gray-500 rounded-full px-2 py-0.5 text-xs font-bold">Oddano</span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center mt-8">
              <button
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow-lg text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  setEditMode(true);
                  setSelections(orderForWeek.selections || {});
                }}
                disabled={hasEdited}
              >
                Uredi naročilo
              </button>
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
                const isMenuSelection = (sel: MenuSelection | undefined): sel is { menuId: string; optionIndex: number } => !!sel && 'menuId' in sel && 'optionIndex' in sel;
                const isNoneSelection = (sel: MenuSelection | undefined): sel is { none: true } => !!sel && 'none' in sel;
                return (
                  <div key={dateStr} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-yellow-500">
                        {day.toLocaleDateString('sl-SI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    {!menu ? (
                      <div className="text-gray-400 text-sm italic">
                        Za ta dan ni naloženih menijev.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {menu.options.map((option, optIdx) => (
                          <button
                            key={optIdx}
                            type="button"
                            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border-2 transition font-semibold text-base shadow-sm focus:outline-none
                              ${isMenuSelection(selected) && selected.optionIndex === optIdx
                                ? 'bg-yellow-500 border-yellow-500 text-white'
                                : 'bg-white border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400'}
                            `}
                            onClick={() => handleSelect(dateStr, menu.id, optIdx)}
                          >
                            <span>{option.description}</span>
                            {isMenuSelection(selected) && selected.optionIndex === optIdx && (
                              <span className="ml-2 text-white bg-yellow-600 rounded-full px-2 py-0.5 text-xs font-bold">Izbrano</span>
                            )}
                          </button>
                        ))}
                        <button
                          type="button"
                          className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border-2 transition font-semibold text-base shadow-sm focus:outline-none mt-2
                            ${isNoneSelection(selected)
                              ? 'bg-gray-300 border-gray-400 text-white'
                              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-400'}
                          `}
                          onClick={() => setSelections(prev => ({ ...prev, [dateStr]: { none: true } }))}
                        >
                          <span>Ne potrebujem hrane za ta dan</span>
                          {isNoneSelection(selected) && (
                            <span className="ml-2 text-white bg-gray-500 rounded-full px-2 py-0.5 text-xs font-bold">Izbrano</span>
                          )}
                        </button>
                      </div>
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
          <div className="space-y-6">
            {weekDays.map((day, idx) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const menu = menus[idx];
              const selected = selections[dateStr];
              // Helper type guards
              const isMenuSelection = (sel: MenuSelection | undefined): sel is { menuId: string; optionIndex: number } => !!sel && 'menuId' in sel && 'optionIndex' in sel;
              const isNoneSelection = (sel: MenuSelection | undefined): sel is { none: true } => !!sel && 'none' in sel;
              return (
                <div key={dateStr} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-yellow-500">
                      {day.toLocaleDateString('sl-SI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  {!menu ? (
                    <div className="text-gray-400 text-sm italic">
                      Za ta dan ni naloženih menijev. Če potrebujete pomoč, pokličite{' '}
                      <a href="tel:069846626" className="underline text-yellow-600 hover:text-yellow-700">069846626</a>.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {menu.options.map((option, optIdx) => (
                        <button
                          key={optIdx}
                          type="button"
                          className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border-2 transition font-semibold text-base shadow-sm focus:outline-none
                            ${isMenuSelection(selected) && selected.optionIndex === optIdx
                              ? 'bg-yellow-500 border-yellow-500 text-white'
                              : 'bg-white border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400'}
                          `}
                          onClick={() => handleSelect(dateStr, menu.id, optIdx)}
                        >
                          <span>{option.description}</span>
                          {isMenuSelection(selected) && selected.optionIndex === optIdx && (
                            <span className="ml-2 text-white bg-yellow-600 rounded-full px-2 py-0.5 text-xs font-bold">Izbrano</span>
                          )}
                        </button>
                      ))}
                      {/* No food option */}
                      <button
                        type="button"
                        className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border-2 transition font-semibold text-base shadow-sm focus:outline-none mt-2
                          ${isNoneSelection(selected)
                            ? 'bg-gray-300 border-gray-400 text-white'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-400'}
                        `}
                        onClick={() => setSelections(prev => ({ ...prev, [dateStr]: { none: true } }))}
                      >
                        <span>Ne potrebujem hrane za ta dan</span>
                        {isNoneSelection(selected) && (
                          <span className="ml-2 text-white bg-gray-500 rounded-full px-2 py-0.5 text-xs font-bold">Izbrano</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            <div className="flex justify-center mt-8">
              <button
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg transition"
                disabled={!allDaysSelected || orderLoading || !!orderForWeek}
                onClick={handleSubmitOrder}
              >
                {orderLoading ? 'Oddajam naročilo...' : 'Potrdi naročilo'}
              </button>
            </div>
            {orderError && <div className="text-center text-red-500 mt-2">{orderError}</div>}
          </div>
        )}
      </div>
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