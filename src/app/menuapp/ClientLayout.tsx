'use client'

import { CompanyAuthProvider } from '@/app/lib/contexts/CompanyAuthContext'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CompanyAuthProvider>
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </CompanyAuthProvider>
  )
} 