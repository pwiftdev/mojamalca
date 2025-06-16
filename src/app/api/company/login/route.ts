import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Query the companies collection for the provided email
    const companiesRef = collection(db, 'companies')
    const q = query(companiesRef, where('email', '==', email))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const companyDoc = querySnapshot.docs[0]
    const companyData = companyDoc.data()

    // In a real application, you would hash the password and compare hashes
    // For now, we'll do a simple comparison
    if (companyData.password !== password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Don't send the password back to the client
    const { password: _, ...companyWithoutPassword } = companyData

    return NextResponse.json({
      id: companyDoc.id,
      ...companyWithoutPassword
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 