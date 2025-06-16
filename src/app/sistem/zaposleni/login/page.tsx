'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/app/lib/firebase/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import Image from 'next/image'

export default function EmployeeLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', pin: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'pin' ? value.replace(/[^0-9]/g, '').slice(0, 4) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const q = query(
        collection(db, 'employees'),
        where('email', '==', formData.email),
        where('pin', '==', formData.pin),
        where('status', '==', 'active')
      )
      const snapshot = await getDocs(q)
      if (snapshot.empty) {
        setError('Napačen e-poštni naslov ali PIN.')
        setIsLoading(false)
        return
      }
      // Store employee info in sessionStorage for now
      const employee = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
      sessionStorage.setItem('employee', JSON.stringify(employee))
      router.replace('/sistem/zaposleni/narocanje')
    } catch (err) {
      setError('Napaka pri prijavi. Poskusite znova.')
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 min-h-screen w-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'rgb(35,31,32)' }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Image src="/mojamalcalogonobg.png" alt="Moja Mal'ca Logo" width={180} height={60} className="mb-4" priority />
        <h2 className="mt-2 text-center text-3xl font-extrabold text-yellow-400 drop-shadow">Prijava za zaposlene</h2>
        <p className="mt-2 text-center text-white">Vnesite e-pošto in PIN za dostop do portala</p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-pošta
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Vnesite e-pošto"
                />
              </div>
            </div>
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700">
                PIN (4-mestna številka)
              </label>
              <div className="mt-1">
                <input
                  id="pin"
                  name="pin"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  required
                  value={formData.pin}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed font-mono"
                  placeholder="Npr. 1234"
                  maxLength={4}
                  pattern="[0-9]{4}"
                />
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? 'Prijavljam...' : 'Prijava'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 