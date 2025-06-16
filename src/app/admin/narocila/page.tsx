"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { format, addDays, startOfWeek } from "date-fns";
import { sl } from "date-fns/locale";

export default function AdminNarocilaPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);

  const today = new Date();
  let targetMonday = startOfWeek(addDays(today, 1), { weekStartsOn: 1 });
  if (today.getDay() === 1) targetMonday = today;
  const weekStart = targetMonday;
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const selectedDay = weekDays[selectedDayIdx];
  const selectedDayStr = format(selectedDay, "yyyy-MM-dd");
  const weekStartStr = format(weekStart, "yyyy-MM-dd");

  // Fetch companies, menus, and orders for the selected week
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getDocs(collection(db, "companies")),
      getDocs(query(collection(db, "menus"), where("date", ">=", selectedDayStr), where("date", "<=", selectedDayStr))),
      getDocs(query(collection(db, "orders"), where("weekStart", "==", weekStartStr)))
    ]).then(([companiesSnap, menusSnap, ordersSnap]) => {
      setCompanies(companiesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setMenus(menusSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setOrders(ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    // eslint-disable-next-line
  }, [selectedDayStr, weekStartStr]);

  // For each company, get their menu for the selected day
  const getMenuForCompanyAndDay = (companyId: string) => {
    return menus.find((menu: any) => menu.companyId === companyId && menu.date === selectedDayStr)
      || menus.find((menu: any) => menu.companyId === 'all' && menu.date === selectedDayStr);
  };

  // For each company, build rows: { description, count }
  const getRowsForCompany = (company: any) => {
    const menu = getMenuForCompanyAndDay(company.id);
    if (!menu) {
      console.log(`[DEBUG] No menu found for company ${company.name} (${company.id}) on ${selectedDayStr}`);
      return [];
    }
    const options = menu.options || [];
    console.log(`[DEBUG] Menu for company ${company.name} (${company.id}) on ${selectedDayStr}:`, menu);
    // Count how many employees ordered each option for this day
    const counts = options.map((_opt: any, idx: number) => {
      let count = 0;
      orders.filter((o: any) => o.companyId === company.id).forEach((order: any) => {
        const sel = order.selections?.[selectedDayStr];
        if (sel) {
          console.log(`[DEBUG] Order selection for ${company.name} on ${selectedDayStr}:`, sel, 'optionIndex:', sel.optionIndex, 'menuId:', sel.menuId);
        }
        if (sel && sel.menuId === menu.id && sel.optionIndex === idx) count++;
      });
      return count;
    });
    return options.map((opt: any, idx: number) => ({ description: opt.description, count: counts[idx] }));
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Naročila po podjetjih</h1>
        {/* Day Selector only */}
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDayIdx(idx => Math.max(0, idx - 1))}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition"
              disabled={selectedDayIdx === 0}
            >
              Prejšnji dan
            </button>
            <span className="text-base font-semibold text-gray-800">
              {selectedDay.toLocaleDateString('sl-SI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => setSelectedDayIdx(idx => Math.min(6, idx + 1))}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition"
              disabled={selectedDayIdx === 6}
            >
              Naslednji dan
            </button>
          </div>
        </div>
        {loading ? (
          <div className="text-center text-gray-500">Nalaganje...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {companies.map(company => {
              const rows = getRowsForCompany(company);
              const total = rows.reduce((sum: number, row: { description: string; count: number }) => sum + row.count, 0);
              return (
                <div key={company.id} className="bg-white rounded-xl shadow p-6">
                  <div className="mb-4">
                    <div className="text-xl font-bold text-yellow-600">{company.name}</div>
                    <div className="text-gray-700 text-sm">{company.address || 'Naslov ni vnešen'}</div>
                    <div className="text-gray-700 text-sm">{company.phone || 'Telefon ni vnešen'}</div>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Meni</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Skupaj</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rows.map((row: { description: string; count: number }, idx: number) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-gray-900 whitespace-nowrap">{row.description}</td>
                          <td className="px-4 py-2 text-gray-900 whitespace-nowrap text-center">{row.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 text-right text-base font-bold text-yellow-700">
                    Skupaj naročil: {total}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 