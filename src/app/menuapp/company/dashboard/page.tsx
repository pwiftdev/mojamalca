'use client'

import { useCompanyAuth } from '@/app/lib/contexts/CompanyAuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { db } from '@/app/lib/firebase/firebase'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
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

  // Get the start of the week (Monday)
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 })
  // Generate array of weekdays (Monday to Friday)
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i))

  const fetchMenus = async () => {
    try {
      setLoading(true)
      setError(null)
      const menusRef = collection(db, 'menus')
      const weekStartStr = format(weekStart, 'yyyy-MM-dd')
      const weekEndStr = format(addDays(weekStart, 4), 'yyyy-MM-dd')
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
      router.replace('/menuapp/company/login')
    } else {
      fetchMenus()
    }
  }, [company, router, selectedWeek, fetchMenus])

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
            <Link href="/menuapp/company/employees" className="text-yellow-500 hover:text-yellow-600 font-medium">
              Upravljaj zaposlene &rarr;
            </Link>
          </div>
          {/* Reports Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">
              Poročila
            </h2>
            <p className="text-gray-700 mb-4">
              Pregledujte izbire obrokov in nastavitve zaposlenih
            </p>
            <button className="text-yellow-500 hover:text-yellow-600 font-medium">
              Preglej poročila &rarr;
            </button>
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
        {/* Menu Overview Section */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-yellow-400">
              Pregled menijev
            </h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                Nalaganje menijev...
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">
                {error}
              </div>
            ) : menus.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Trenutno ni na voljo noben meni. Meniji bodo dodani kmalu.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Možnosti menija
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {weekDays.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const menu = menus.find(m => m.date === dateStr)
                    return (
                      <tr key={dateStr}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {day.toLocaleDateString('sl-SI', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {menu && menu.options && menu.options.length > 0 ? (
                            <ul className="list-disc pl-5">
                              {menu.options.map((option, idx) => (
                                <li key={idx}>{option.description}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-500">Ni možnosti</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 