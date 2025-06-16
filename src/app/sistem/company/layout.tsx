'use client'

import { CompanyAuthProvider } from '@/app/lib/contexts/CompanyAuthContext'

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return <CompanyAuthProvider>{children}</CompanyAuthProvider>
} 