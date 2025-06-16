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
      router.replace("/menuapp/employee/login");
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
      await addDoc(collection(db, "orders"), {
        employeeId: employee.id,
        employeeName: employee.name,
        companyId: employee.companyId,
        weekStart: weekStartStr,
        selections,
        createdAt: Timestamp.now(),
      });
      setOrderForWeek({ submitted: true });
    } catch (err) {
      setOrderError("Napaka pri oddaji naročila. Poskusite znova.");
    } finally {
      setOrderLoading(false);
    }
  };

  // Check if at least one day has a selection
  const anySelected = Object.keys(selections).length > 0;

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: 'rgb(35,31,32)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {employee && (
          <div className="mb-6 text-2xl font-extrabold text-white text-center tracking-tight" style={{ letterSpacing: '-0.01em' }}>
            Zdravo, <span className="text-yellow-400">{employee.name}</span>
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
              className="px-5 py-2 text-sm font-semibold rounded-full border border-yellow-400 text-yellow-400 bg-transparent hover:bg-yellow-50 hover:text-yellow-600 transition disabled:opacity-40 shadow-sm"
              disabled={weekStart.getTime() === initialWeek.getTime()}
            >
              Prejšnji teden
            </button>
            <span className="text-base font-medium text-white px-2">
              {format(weekStart, 'd. MMMM yyyy', { locale: sl })} – {format(addDays(weekStart, 6), 'd. MMMM yyyy', { locale: sl })}
            </span>
            <button
              onClick={() => setSelectedWeek(prev => {
                const base = prev || initialWeek;
                return addDays(base, 7);
              })}
              className="px-5 py-2 text-sm font-semibold rounded-full border border-yellow-400 text-yellow-400 bg-transparent hover:bg-yellow-50 hover:text-yellow-600 transition shadow-sm"
            >
              Naslednji teden
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
          <div className="text-center text-gray-200">Nalaganje menijev...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : orderForWeek ? (
          <div className="text-center text-green-500 font-semibold text-lg py-8">
            Naročilo uspešno oddano! Hvala.
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
                <div key={dateStr} className="bg-white rounded-xl shadow p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold text-yellow-500">
                      {day.toLocaleDateString('sl-SI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  {!menu ? (
                    <div className="text-red-500 text-sm">
                      Za ta dan ni naloženih menijev. Če potrebujete pomoč, pokličite{' '}
                      <a href="tel:069846626" className="underline text-yellow-600 hover:text-yellow-700">069846626</a>.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {menu.options.map((option, optIdx) => (
                        <div key={optIdx} className="flex items-center justify-between border rounded p-2">
                          <span className="text-gray-900">{option.description}</span>
                          <button
                            type="button"
                            className={`px-4 py-1 rounded font-medium border transition ${isMenuSelection(selected) && selected.optionIndex === optIdx ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white text-yellow-500 border-yellow-400 hover:bg-yellow-50'}`}
                            onClick={() => handleSelect(dateStr, menu.id, optIdx)}
                          >
                            {isMenuSelection(selected) && selected.optionIndex === optIdx ? 'Izbrano' : 'Naroči'}
                          </button>
                        </div>
                      ))}
                      {/* No food option */}
                      <div className="flex items-center justify-between border rounded p-2 bg-gray-50">
                        <span className="text-gray-500">Ne potrebujem hrane za ta dan</span>
                        <button
                          type="button"
                          className={`px-4 py-1 rounded font-medium border transition ${isNoneSelection(selected) ? 'bg-gray-400 text-white border-gray-400' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100'}`}
                          onClick={() => setSelections(prev => ({ ...prev, [dateStr]: { none: true } }))}
                        >
                          {isNoneSelection(selected) ? 'Izbrano' : 'Izberi'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div className="flex justify-center mt-8">
              <button
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                disabled={!anySelected || orderLoading || !!orderForWeek}
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