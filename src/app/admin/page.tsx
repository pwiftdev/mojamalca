'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { db } from '@/app/lib/firebase/firebase'
import { collection, getDocs } from 'firebase/firestore'

export default function AdminDashboardPage() {
  const [companyCount, setCompanyCount] = useState(0)

  useEffect(() => {
    const fetchCompanies = async () => {
      const companiesSnapshot = await getDocs(collection(db, 'companies'))
      setCompanyCount(companiesSnapshot.size)
    }
    fetchCompanies()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nadzorna plošča</h1>
        <p className="mt-1 text-gray-600">Pregled sistema za upravljanje prehrane</p>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Skupno podjetij</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">{companyCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Nedavna aktivnost</h3>
          <div className="text-gray-600">
            Ni nedavne aktivnosti
          </div>
        </div>
      </div>

      {/* Hitri ukrepi */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Hitri ukrepi</h3>
          <div className="space-y-4">
            <Link
              href="/admin/podjetje/novo"
              className="block w-full px-4 py-2 text-sm font-medium text-center text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Dodaj novo podjetje
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 