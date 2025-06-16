'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCompanyAuth } from '@/lib/hooks/useCompanyAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useCompanyAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/menuapp/company/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
} 