import { useState, useEffect } from 'react'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/firebase'

interface CompanyUser extends User {
  companyId?: string
  companyName?: string
}

export function useCompanyAuth() {
  const [user, setUser] = useState<CompanyUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get additional company data from Firestore
        const companyDoc = await getDoc(doc(db, 'companies', user.uid))
        if (companyDoc.exists()) {
          const companyData = companyDoc.data()
          setUser({
            ...user,
            companyId: user.uid,
            companyName: companyData.name
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const registerCompany = async (email: string, password: string, companyName: string) => {
    try {
      setError(null)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create company document in Firestore
      await setDoc(doc(db, 'companies', userCredential.user.uid), {
        name: companyName,
        email,
        createdAt: new Date().toISOString()
      })

      return userCredential.user
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const loginCompany = async (email: string, password: string) => {
    try {
      setError(null)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await signOut(auth)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  return {
    user,
    loading,
    error,
    registerCompany,
    loginCompany,
    logout
  }
} 