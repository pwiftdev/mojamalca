'use client'

import { useState } from 'react'
import { useCompanyAuth } from '@/app/lib/contexts/CompanyAuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function CompanyLoginPage() {
  const { login } = useCompanyAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return // Prevent multiple submissions
    
    setError('')
    setIsLoading(true)

    try {
      console.log('Attempting login with:', formData.email)
      await login(formData.email, formData.password)
      // The router.replace in the context will handle the navigation
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to login. Please check your credentials.')
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 min-h-screen w-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'rgb(35,31,32)' }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Image src="/mojamalcalogonobg.png" alt="Moja Mal'ca Logo" width={180} height={60} className="mb-4" priority />
        <h2 className="mt-2 text-center text-3xl font-extrabold text-yellow-400 drop-shadow">Prijava za podjetja</h2>
        <p className="mt-2 text-center text-white">Vnesite podatke za dostop do portala</p>
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Geslo
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Vnesite geslo"
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