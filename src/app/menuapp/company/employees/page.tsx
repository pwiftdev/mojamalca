'use client'

import { useEffect, useState } from 'react'
import { db } from '@/app/lib/firebase/firebase'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore'
import { useCompanyAuth } from '@/app/lib/contexts/CompanyAuthContext'
import Image from 'next/image'

interface Employee {
  id: string
  name: string
  email: string
  pin: string
  status: string
}

export default function CompanyEmployeesPage() {
  const { company } = useCompanyAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', pin: '' })
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (company) fetchEmployees()
    // eslint-disable-next-line
  }, [company])

  if (!company) return null;

  const fetchEmployees = async () => {
    setLoading(true)
    setError('')
    try {
      const q = query(
        collection(db, 'employees'),
        where('companyId', '==', company.id),
        orderBy('name', 'asc')
      )
      const snapshot = await getDocs(q)
      console.log('Fetched employees snapshot:', snapshot.docs.map(doc => doc.data()))
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)))
    } catch (err) {
      console.error('Error fetching employees:', err)
      setError('Napaka pri nalaganju zaposlenih.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)
    setError('')
    try {
      if (!newEmployee.name || !newEmployee.email || !/^[0-9]{4}$/.test(newEmployee.pin)) {
        setError('Vsa polja so obvezna, PIN mora biti 4-mestna številka.')
        setAdding(false)
        return
      }
      const employeeData = {
        companyId: company.id,
        name: newEmployee.name,
        email: newEmployee.email,
        pin: newEmployee.pin,
        status: 'active'
      }
      console.log('Adding employee:', employeeData)
      await addDoc(collection(db, 'employees'), employeeData)
      setShowModal(false)
      setNewEmployee({ name: '', email: '', pin: '' })
      fetchEmployees()
    } catch (err) {
      console.error('Error adding employee:', err)
      setError('Napaka pri dodajanju zaposlenega.')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteDoc(doc(db, 'employees', id))
      setEmployees(prev => prev.filter(emp => emp.id !== id))
    } catch (err) {
      alert('Napaka pri brisanju zaposlenega.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: 'rgb(35,31,32)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400 drop-shadow">
              Upravljanje zaposlenih
            </h1>
            <p className="mt-1 text-white">
              Dodajte in upravljajte račune zaposlenih v vašem podjetju
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-md shadow transition border border-yellow-500"
          >
            + Dodaj zaposlenega
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          {loading ? (
            <div className="text-center text-gray-500">Nalaganje...</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : employees.length === 0 ? (
            <div className="text-center text-gray-500">Ni zaposlenih.</div>
          ) : (
            <div className="overflow-x-auto rounded-lg">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-800">Ime</th>
                    <th className="px-4 py-2 text-left text-gray-800">E-pošta</th>
                    <th className="px-4 py-2 text-left text-gray-800">PIN</th>
                    <th className="px-4 py-2 text-left text-gray-800">Status</th>
                    <th className="px-4 py-2 text-left text-gray-800">Dejanja</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id} className="border-t hover:bg-yellow-50 transition">
                      <td className="px-4 py-2 text-gray-900">{emp.name}</td>
                      <td className="px-4 py-2 text-gray-900">{emp.email}</td>
                      <td className="px-4 py-2 font-mono text-gray-900">{emp.pin}</td>
                      <td className="px-4 py-2 text-gray-900">{emp.status === 'active' ? 'Aktiven' : 'Neaktiven'}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleDelete(emp.id)}
                          disabled={deletingId === emp.id}
                          className="px-3 py-1 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded disabled:opacity-50 transition"
                        >
                          {deletingId === emp.id ? 'Brišem...' : 'Izbriši'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative border border-gray-200">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                onClick={() => { setShowModal(false); setError(''); setNewEmployee({ name: '', email: '', pin: '' }) }}
                aria-label="Zapri"
                style={{ lineHeight: 1 }}
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-6 text-yellow-400 text-center">Dodaj zaposlenega</h2>
              {error && <div className="mb-2 text-red-600 text-center">{error}</div>}
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800">Ime</label>
                  <input
                    type="text"
                    value={newEmployee.name}
                    onChange={e => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-400 focus:ring-yellow-400 text-gray-900 placeholder-gray-500"
                    placeholder="Vnesite ime zaposlenega"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800">E-pošta</label>
                  <input
                    type="email"
                    value={newEmployee.email}
                    onChange={e => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-400 focus:ring-yellow-400 text-gray-900 placeholder-gray-500"
                    placeholder="Vnesite e-pošto"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800">PIN (4-mestna številka)</label>
                  <input
                    type="text"
                    value={newEmployee.pin}
                    onChange={e => setNewEmployee(prev => ({ ...prev, pin: e.target.value.replace(/[^0-9]/g, '').slice(0, 4) }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-400 focus:ring-yellow-400 text-gray-900 placeholder-gray-500"
                    placeholder="Npr. 1234"
                    required
                    maxLength={4}
                    pattern="[0-9]{4}"
                  />
                </div>
                <div className="flex justify-end space-x-4 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setError(''); setNewEmployee({ name: '', email: '', pin: '' }) }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Prekliči
                  </button>
                  <button
                    type="submit"
                    disabled={adding}
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 border border-transparent rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50"
                  >
                    {adding ? 'Dodajam...' : 'Dodaj'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 