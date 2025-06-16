'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { db } from '@/app/lib/firebase/firebase'
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore'

interface Company {
  id: string
  name: string
  email: string
  address: string
  phone: string
  contactPerson: string
  status: string
  createdAt: string
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Company>>({})

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companiesQuery = query(collection(db, 'companies'), orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(companiesQuery)
        const companiesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Company[]
        setCompanies(companiesData)
      } catch (err) {
        console.error('Error fetching companies:', err)
        setError('Failed to load companies')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  const handleView = (company: Company) => {
    setSelectedCompany(company)
    setShowModal(true)
  }

  const handleDelete = async () => {
    if (!selectedCompany) return
    setDeleting(true)
    try {
      await deleteDoc(doc(db, 'companies', selectedCompany.id))
      setCompanies(prev => prev.filter(c => c.id !== selectedCompany.id))
      setShowModal(false)
      setSelectedCompany(null)
    } catch (err) {
      alert('Napaka pri brisanju podjetja.')
    } finally {
      setDeleting(false)
    }
  }

  const handleEdit = () => {
    if (!selectedCompany) return
    setEditForm({ ...selectedCompany })
    setEditMode(true)
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
  }

  const handleEditSave = async () => {
    if (!selectedCompany) return
    try {
      await updateDoc(doc(db, 'companies', selectedCompany.id), {
        name: editForm.name,
        email: editForm.email,
        address: editForm.address,
        phone: editForm.phone,
        contactPerson: editForm.contactPerson,
        // status and createdAt are not editable here
      })
      setCompanies(prev => prev.map(c => c.id === selectedCompany.id ? { ...c, ...editForm } as Company : c))
      setSelectedCompany(prev => prev ? { ...prev, ...editForm } as Company : prev)
      setEditMode(false)
    } catch (err) {
      alert('Napaka pri shranjevanju sprememb.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Napaka!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Podjetja</h1>
          <p className="mt-2 text-sm text-gray-700">
            Seznam vseh podjetij v sistemu, vključno z imenom, e-pošto in statusom.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/admin/companies/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            Dodaj podjetje
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Ime podjetja
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      E-pošta
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Kontaktna oseba
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Dejanja</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {companies.map((company) => (
                    <tr key={company.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {company.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{company.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{company.contactPerson}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          company.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {company.status === 'active' ? 'Aktivno' : 'Neaktivno'}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          href="#"
                          className="text-blue-600 hover:text-blue-900"
                          onClick={e => { e.preventDefault(); handleView(company); }}
                        >
                          Ogled<span className="sr-only">, {company.name}</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative border border-gray-200">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              onClick={() => { setShowModal(false); setEditMode(false); }}
              aria-label="Zapri"
              style={{ lineHeight: 1 }}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">Podrobnosti podjetja</h2>
            {editMode ? (
              <div className="space-y-4 mb-8">
                <div>
                  <label className="font-semibold block mb-1 text-gray-800">Ime podjetja:</label>
                  <input type="text" name="name" value={editForm.name || ''} onChange={handleEditChange} className="w-full rounded border-gray-300 px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-gray-800">E-pošta:</label>
                  <input type="email" name="email" value={editForm.email || ''} onChange={handleEditChange} className="w-full rounded border-gray-300 px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-gray-800">Naslov:</label>
                  <input type="text" name="address" value={editForm.address || ''} onChange={handleEditChange} className="w-full rounded border-gray-300 px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-gray-800">Telefon:</label>
                  <input type="text" name="phone" value={editForm.phone || ''} onChange={handleEditChange} className="w-full rounded border-gray-300 px-2 py-1 text-gray-900" />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-gray-800">Kontaktna oseba:</label>
                  <input type="text" name="contactPerson" value={editForm.contactPerson || ''} onChange={handleEditChange} className="w-full rounded border-gray-300 px-2 py-1 text-gray-900" />
                </div>
              </div>
            ) : (
              <div className="space-y-3 mb-8">
                <div className="flex justify-between"><span className="font-semibold text-gray-800">Ime podjetja:</span> <span className="text-gray-900">{selectedCompany.name}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-gray-800">E-pošta:</span> <span className="text-gray-900">{selectedCompany.email}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-gray-800">Status:</span> <span className="text-gray-900">{selectedCompany.status === 'active' ? 'Aktivno' : 'Neaktivno'}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-gray-800">Naslov:</span> <span className="text-gray-900">{selectedCompany.address}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-gray-800">Telefon:</span> <span className="text-gray-900">{selectedCompany.phone}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-gray-800">Kontaktna oseba:</span> <span className="text-gray-900">{selectedCompany.contactPerson}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-gray-800">Ustvarjeno:</span> <span className="text-gray-900">{selectedCompany.createdAt ? new Date(selectedCompany.createdAt).toLocaleString('sl-SI') : '-'}</span></div>
              </div>
            )}
            <div className="flex justify-end space-x-4 pt-2">
              <button
                onClick={() => { setShowModal(false); setEditMode(false); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Zapri
              </button>
              {editMode ? (
                <button
                  onClick={handleEditSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Shrani
                </button>
              ) : (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 border border-transparent rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Uredi
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {deleting ? 'Brišem...' : 'Izbriši podjetje'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 