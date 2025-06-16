'use client'

import { useState, useEffect, useCallback } from 'react'
import { db } from '@/app/lib/firebase/firebase'
import { collection, query, where, getDocs, addDoc, Timestamp, updateDoc, doc } from 'firebase/firestore'
import { format, startOfWeek, addDays } from 'date-fns'
import { sl } from 'date-fns/locale'

interface MenuOption {
  description: string
}

interface Menu {
  id: string
  date: string
  options: MenuOption[]
  companyId: string
}

export default function AdminMenusPage() {
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date())
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get the start of the week (Monday)
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 })
  
  // Generate array of weekdays (Monday to Friday)
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i))

  // Form data for the current week
  const [formData, setFormData] = useState<Record<string, MenuOption[]>>({})

  const fetchMenus = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const menusRef = collection(db, 'menus')
      const weekStartStr = format(weekStart, 'yyyy-MM-dd')
      const weekEndStr = format(addDays(weekStart, 4), 'yyyy-MM-dd')
      
      console.log('Fetching menus for week:', {
        start: weekStartStr,
        end: weekEndStr
      })

      const q = query(
        menusRef,
        where('date', '>=', weekStartStr),
        where('date', '<=', weekEndStr)
      )
      
      const querySnapshot = await getDocs(q)
      console.log('Found menus:', querySnapshot.size)
      
      const menuData = querySnapshot.docs.map(doc => {
        const data = doc.data()
        console.log('Menu data:', {
          id: doc.id,
          date: data.date,
          options: data.options
        })
        return {
          id: doc.id,
          ...data
        }
      }) as Menu[]

      // Initialize form data with existing menus
      const initialFormData: Record<string, MenuOption[]> = {}
      weekDays.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const existingMenu = menuData.find(menu => menu.date === dateStr)
        initialFormData[dateStr] = existingMenu?.options || [{
          description: ''
        }]
      })
      setFormData(initialFormData)
      setMenus(menuData)
    } catch (error: any) {
      console.error('Error fetching menus:', error)
      if (error.code === 'failed-precondition') {
        setError('Napaka pri pridobivanju menijev: Potreben je indeks za poizvedbo. Prosimo, počakajte trenutek in poskusite znova.')
      } else {
        setError('Napaka pri pridobivanju menijev. Prosimo, poskusite kasneje.')
      }
    } finally {
      setLoading(false)
    }
  }, [weekStart, weekDays])

  useEffect(() => {
    fetchMenus()
  }, [selectedWeek, fetchMenus])

  const handleInputChange = (date: string, optionIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [date]: prev[date].map((option, index) => 
        index === optionIndex 
          ? { ...option, description: value }
          : option
      )
    }))
  }

  const addMenuOption = (date: string) => {
    setFormData(prev => ({
      ...prev,
      [date]: [
        ...prev[date],
        {
          description: ''
        }
      ]
    }))
  }

  const removeMenuOption = (date: string, optionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      [date]: prev[date].filter((_, index) => index !== optionIndex)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create or update menus for each day of the week
      for (const [date, options] of Object.entries(formData)) {
        // Check if menu already exists for this date
        const existingMenu = menus.find(menu => menu.date === date)
        if (existingMenu) {
          console.log('Updating menu for date:', date, options)
          // Update existing menu
          const menuDocRef = doc(db, 'menus', existingMenu.id)
          await updateDoc(menuDocRef, { options })
        } else {
          console.log('Creating new menu for date:', date, options)
          // Create new menu
          const docRef = await addDoc(collection(db, 'menus'), {
            date,
            options,
            companyId: 'all' // For now, we'll use 'all' as companyId
          })
          console.log('Created menu with ID:', docRef.id)
        }
      }
      // Refresh menus after saving
      await fetchMenus()
    } catch (error: any) {
      console.error('Error saving menus:', error)
      setError('Napaka pri shranjevanju menijev. Prosimo, poskusite kasneje.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upravljanje menijev</h1>
        <p className="mt-1 text-gray-600">Dodajte in uredite tedenske menije</p>
      </div>

      {/* Week Selection */}
      <div className="mb-6">
        <button
          onClick={() => setSelectedWeek(prev => addDays(prev, -7))}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Prejšnji teden
        </button>
        <span className="mx-4 text-gray-700">
          {format(weekStart, 'd. MMMM yyyy', { locale: sl })} - {format(addDays(weekStart, 4), 'd. MMMM yyyy', { locale: sl })}
        </span>
        <button
          onClick={() => setSelectedWeek(prev => addDays(prev, 7))}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Naslednji teden
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {weekDays.map((day, index) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayName = format(day, 'EEEE', { locale: sl })
          const dayNumber = format(day, 'd. MMMM', { locale: sl })
          
          return (
            <div key={dateStr} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {dayName.charAt(0).toUpperCase() + dayName.slice(1)}, {dayNumber}
                </h3>
                <button
                  type="button"
                  onClick={() => addMenuOption(dateStr)}
                  className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                >
                  + Dodaj možnost
                </button>
              </div>
              
              {formData[dateStr]?.map((option, optionIndex) => (
                <div key={optionIndex} className="mb-6 p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-700">
                      Možnost {optionIndex + 1}
                    </h4>
                    {formData[dateStr].length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMenuOption(dateStr, optionIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Odstrani
                      </button>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Opis menija
                    </label>
                    <textarea
                      value={option.description}
                      onChange={(e) => handleInputChange(dateStr, optionIndex, e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                      rows={3}
                      placeholder="Vnesite opis menija (glavna jed, priloga, solata, sladica...)"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          )
        })}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Shranjevanje...' : 'Shrani menije'}
          </button>
        </div>
      </form>
    </div>
  )
} 