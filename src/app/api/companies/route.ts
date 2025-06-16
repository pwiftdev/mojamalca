import { NextResponse } from 'next/server'
import { db } from '@/app/lib/firebase/firebase'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'

export async function POST(request: Request) {
  try {
    const { name, email, password, address, phone, contactPerson } = await request.json()

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if company with email already exists
    const companiesRef = collection(db, 'companies')
    const q = query(companiesRef, where('email', '==', email))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Company with this email already exists' },
        { status: 400 }
      )
    }

    // Create new company document
    const companyData = {
      name,
      email,
      password, // In a real app, you should hash this password
      address: address || '',
      phone: phone || '',
      contactPerson: contactPerson || '',
      status: 'active',
      createdAt: new Date().toISOString()
    }

    try {
      const docRef = await addDoc(companiesRef, companyData)
      console.log('Company created successfully:', docRef.id)
      return NextResponse.json({
        id: docRef.id,
        ...companyData
      })
    } catch (firestoreError: any) {
      console.error('Firestore error:', firestoreError)
      return NextResponse.json(
        { error: `Database error: ${firestoreError.message}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    )
  }
} 