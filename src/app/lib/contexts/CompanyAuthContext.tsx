'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/app/lib/firebase/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

interface Company {
  id: string
  name: string
  email: string
  address: string
  phone: string
  contactPerson: string
  status: string
}

interface CompanyAuthContextType {
  company: Company | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const CompanyAuthContext = createContext<CompanyAuthContextType | undefined>(undefined)

export function CompanyAuthProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if company data exists in session storage
    const storedCompany = sessionStorage.getItem('company')
    if (storedCompany) {
      setCompany(JSON.parse(storedCompany))
    }
    setLoading(false)
  }, [])

  // Add effect to handle navigation when company state changes
  useEffect(() => {
    if (company && !loading) {
      console.log('Company state updated, navigating to dashboard...')
      router.replace('/menuapp/company/dashboard')
    }
  }, [company, loading, router])

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting to login with email:', email)
      
      // Query Firestore for company with matching email
      const companiesRef = collection(db, 'companies')
      console.log('Querying companies collection...')
      
      const q = query(companiesRef, where('email', '==', email))
      console.log('Executing query...')
      
      const querySnapshot = await getDocs(q)
      console.log('Query completed. Empty?', querySnapshot.empty)

      if (querySnapshot.empty) {
        console.log('No company found with email:', email)
        throw new Error('No company found with this email address')
      }

      const companyDoc = querySnapshot.docs[0]
      const companyData = companyDoc.data()
      console.log('Found company:', companyData.name)

      // In a real app, you should hash the password and compare hashes
      if (companyData.password !== password) {
        console.log('Invalid password for company:', email)
        throw new Error('Invalid password')
      }

      const company = {
        id: companyDoc.id,
        ...companyData
      } as Company

      console.log('Login successful for company:', company.name)

      // Store company data in session storage
      sessionStorage.setItem('company', JSON.stringify(company))
      setCompany(company)
      
      // Navigation will be handled by the useEffect
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.message || 'Failed to login. Please try again.')
    }
  }

  const logout = () => {
    sessionStorage.removeItem('company')
    setCompany(null)
    router.replace('/menuapp')
  }

  return (
    <CompanyAuthContext.Provider value={{ company, loading, login, logout }}>
      {children}
    </CompanyAuthContext.Provider>
  )
}

export function useCompanyAuth() {
  const context = useContext(CompanyAuthContext)
  if (context === undefined) {
    throw new Error('useCompanyAuth must be used within a CompanyAuthProvider')
  }
  return context
} 