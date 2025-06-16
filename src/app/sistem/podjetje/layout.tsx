"use client"

import { CompanyAuthProvider } from '@/app/lib/contexts/CompanyAuthContext'

export default function PodjetjeLayout({ children }: { children: React.ReactNode }) {
  return <CompanyAuthProvider>{children}</CompanyAuthProvider>
} 