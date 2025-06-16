'use client'

import { useCompanyAuth } from '@/app/lib/contexts/CompanyAuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { db } from '@/app/lib/firebase/firebase'
import { collection, query, where, orderBy, getDocs, onSnapshot } from 'firebase/firestore'
import { format, startOfWeek, addDays } from 'date-fns'
import { sl } from 'date-fns/locale'
import Link from 'next/link'
import Image from 'next/image'

interface MenuOption {
  description: string
}

interface Menu {
  id: string
  date: string
  options: MenuOption[]
  companyId: string
}

export default function CompanyDashboardPage() {
  const { company, logout } = useCompanyAuth()
  const router = useRouter()
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date())
  const [employeeCount, setEmployeeCount] = useState<number>(0)
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const ordersListenerRef = useRef<any>(null)

  // Get the start of the week (Monday)
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 })
  // Generate array of weekdays (Monday to Friday)
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i))
  const weekStartStr = format(weekStart, 'yyyy-MM-dd')
  const weekEndStr = format(addDays(weekStart, 4), 'yyyy-MM-dd')

  const fetchMenus = async () => {
    try {
      setLoading(true)
      setError(null)
      const menusRef = collection(db, 'menus')
      const q = query(
        menusRef,
        where('companyId', 'in', [company?.id, 'all']),
        where('date', '>=', weekStartStr),
        where('date', '<=', weekEndStr),
        orderBy('date', 'asc')
      )
      const querySnapshot = await getDocs(q)
      const menuData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Menu[]
      console.log('Fetched menus:', menuData)
      setMenus(menuData)
    } catch (error: any) {
      console.error('Error fetching menus:', error)
      setError('Napaka pri pridobivanju menijev. Prosimo, poskusite kasneje.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!company) {
      router.replace('/sistem/podjetje/login')
    } else {
      fetchMenus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company, router, selectedWeek])

  useEffect(() => {
    if (!company) return
    const fetchEmployees = async () => {
      const employeesRef = collection(db, 'employees')
      const q = query(employeesRef, where('companyId', '==', company.id))
      const snapshot = await getDocs(q)
      setEmployeeCount(snapshot.size)
    }
    fetchEmployees()
  }, [company])

  useEffect(() => {
    if (!company) return
    setOrdersLoading(true)
    setOrdersError(null)
    // Clean up previous listener
    if (ordersListenerRef.current) {
      ordersListenerRef.current()
    }
    const ordersRef = collection(db, 'orders')
    const q = query(
      ordersRef,
      where('companyId', '==', company.id),
      where('weekStart', '==', weekStartStr)
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setOrdersLoading(false)
    }, (err) => {
      setOrdersError('Napaka pri nalaganju naročil.')
      setOrdersLoading(false)
    })
    ordersListenerRef.current = unsubscribe
    return () => {
      unsubscribe()
    }
  }, [company, weekStartStr])

  const handleManualRefresh = async () => {
    if (!company) return
    setOrdersLoading(true)
    setOrdersError(null)
    try {
      const ordersRef = collection(db, 'orders')
      const q = query(
        ordersRef,
        where('companyId', '==', company.id),
        where('weekStart', '==', weekStartStr)
      )
      const snapshot = await getDocs(q)
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    } catch (err) {
      setOrdersError('Napaka pri ročnem osveževanju.')
    } finally {
      setOrdersLoading(false)
    }
  }

  const ordersPerDay: { [date: string]: number } = {}
  weekDays.forEach(day => {
    const dateStr = format(day, 'yyyy-MM-dd')
    let count = 0
    orders.forEach(order => {
      if (order.selections && order.selections[dateStr] && order.selections[dateStr].menuId) {
        count++
      }
    })
    ordersPerDay[dateStr] = count
  })

  const liveOrderRows: { name: string, date: string, menu: string, time: string }[] = []
  orders.forEach(order => {
    const employeeName = order.employeeName || '—'
    if (order.selections) {
      Object.entries(order.selections).forEach(([date, sel]: any) => {
        if (sel.menuId !== undefined) {
          const menu = menus.find(m => m.id === sel.menuId)
          const optionDesc = menu && menu.options[sel.optionIndex]?.description
          const createdAt = order.createdAt && order.createdAt.seconds ? new Date(order.createdAt.seconds * 1000) : null
          liveOrderRows.push({
            name: employeeName,
            date,
            menu: optionDesc || '—',
            time: createdAt ? createdAt.toLocaleString('sl-SI') : '—'
          })
        }
      })
    }
  })

  if (!company) {
    return null
  }

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: 'rgb(35,31,32)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center mb-8">
          <Image src="/mojamalcalogonobg.png" alt="Moja Mal'ca Logo" width={180} height={60} className="mb-4" priority />
          <h1 className="text-3xl font-bold text-yellow-400 text-center drop-shadow mb-2">
            Dobrodošli, {company.name}
          </h1>
          <p className="mt-2 text-white text-center">
            Upravljajte z zaposlenimi in pregledujte poročila
          </p>
        </div>
        <div className="flex justify-end mb-8">
          <button
            onClick={() => logout()}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Odjava
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Employee Management Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">
              Upravljanje zaposlenih
            </h2>
            <p className="text-gray-700 mb-4">
              Dodajte in upravljajte račune zaposlenih
            </p>
            <Link href="/sistem/podjetje/zaposleni" className="text-yellow-500 hover:text-yellow-600 font-medium">
              Upravljaj zaposlene &rarr;
            </Link>
          </div>
        </div>
        {/* Week Selection */}
        <div className="mb-6 flex items-center">
          <button
            onClick={() => setSelectedWeek(prev => addDays(prev, -7))}
            className="px-4 py-2 text-sm font-medium text-gray-100 bg-yellow-500 border border-yellow-500 rounded-md hover:bg-yellow-600 hover:border-yellow-600 transition"
          >
            Prejšnji teden
          </button>
          <span className="mx-4 text-yellow-200">
            {format(weekStart, 'd. MMMM yyyy', { locale: sl })} - {format(addDays(weekStart, 4), 'd. MMMM yyyy', { locale: sl })}
          </span>
          <button
            onClick={() => setSelectedWeek(prev => addDays(prev, 7))}
            className="px-4 py-2 text-sm font-medium text-gray-100 bg-yellow-500 border border-yellow-500 rounded-md hover:bg-yellow-600 hover:border-yellow-600 transition"
          >
            Naslednji teden
          </button>
        </div>
        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <span className="text-3xl font-bold text-yellow-500">{employeeCount}</span>
            <span className="text-gray-700 mt-2">Skupno zaposlenih</span>
          </div>
          {weekDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            return (
              <div key={dateStr} className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
                <span className="text-3xl font-bold text-yellow-500">{ordersPerDay[dateStr]}</span>
                <span className="text-gray-700 mt-2 text-center">Naročila za<br />{day.toLocaleDateString('sl-SI', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              </div>
            )
          })}
        </div>
        {/* Live Orders Table */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-yellow-400">Živa tabela naročil</h2>
            <button
              onClick={handleManualRefresh}
              className="ml-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg shadow text-sm transition disabled:opacity-50"
              disabled={ordersLoading}
            >
              Osveži tabelo
            </button>
          </div>
          <div className="overflow-x-auto p-6">
            {ordersLoading ? (
              <div className="text-center text-gray-400">Nalaganje naročil...</div>
            ) : ordersError ? (
              <div className="text-center text-red-500">{ordersError}</div>
            ) : liveOrderRows.length === 0 ? (
              <div className="text-center text-gray-400">Trenutno ni naročil za ta teden.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Zaposleni</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Meni</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Čas naročila</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {liveOrderRows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.date}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.menu}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {/* Menu Overview Section */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-yellow-400">
              Pregled menijev
            </h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {weekDays.map((_, idx) => (
                  <div key={idx} className="bg-gray-100 rounded-2xl p-6 animate-pulse flex flex-col gap-4 shadow">
                    <div className="h-6 w-1/3 bg-gray-200 rounded" />
                    <div className="h-4 w-2/3 bg-gray-300 rounded" />
                    <div className="h-4 w-1/2 bg-gray-300 rounded" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : menus.length === 0 ? (
              <div className="text-center text-gray-500">
                Trenutno ni na voljo noben meni. Meniji bodo dodani kmalu.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {weekDays.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const menu = menus.find(m => m.date === dateStr)
                  return (
                    <div key={dateStr} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3 border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-yellow-500">
                          {day.toLocaleDateString('sl-SI', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      {menu && menu.options && menu.options.length > 0 ? (
                        <ul className="flex flex-col gap-2 mt-2">
                          {menu.options.map((option, idx) => (
                            <li key={idx} className="px-4 py-2 rounded-xl bg-yellow-50 text-yellow-900 border border-yellow-100 font-medium">
                              {option.description}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400 italic">Ni možnosti za ta dan</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="w-full bg-[#231F20] text-gray-300 py-8 border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:justify-between items-center gap-4 text-center">
          <div>
            <div className="font-semibold text-white">Ručigajeva cesta 5, 4000 Kranj</div>
            <div className="mt-1">prodaja@mojamalca.si</div>
            <div className="mt-1">069 846 626 &nbsp;|&nbsp; 070 451 777</div>
          </div>
          <div className="mt-4 md:mt-0 text-sm text-gray-400">
            © 2025 mojamalca.si — Klik. Dostava. Mal&apos;ca.
          </div>
        </div>
      </footer>
    </div>
  )
} 