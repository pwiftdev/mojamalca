'use client'

import { CompanyAuthProvider } from '@/app/lib/contexts/CompanyAuthContext'
import ClientLayout from './ClientLayout'

export default function SistemLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CompanyAuthProvider>
      <ClientLayout>
        {children}
      </ClientLayout>
    </CompanyAuthProvider>
  )
} 