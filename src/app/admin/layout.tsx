'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { AdminAuthProvider } from '@/app/lib/contexts/AdminAuthContext'
import ProtectedAdminRoute from './ProtectedAdminRoute'

const navigation = [
  { name: 'Nadzorna plošča', href: '/admin' },
  { name: 'Podjetja', href: '/admin/podjetje' },
  { name: 'Meniji', href: '/admin/meniji' },
  { name: 'Naročila', href: '/admin/narocila' },
  { name: 'Baza menijev', href: '/admin/baza-menijev' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  if (isLoginPage) {
    // No sidebar, no provider, just render the login page
    return <>{children}</>
  }

  return (
    <AdminAuthProvider>
      <ProtectedAdminRoute>
        <div className="min-h-screen bg-gray-100">
          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-sm min-h-screen">
              <div className="p-4">
                <h1 className="text-xl font-bold text-gray-900">Administratorska plošča</h1>
              </div>
              <nav className="mt-4">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`block px-4 py-2 text-sm ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 p-8">
              {children}
            </div>
          </div>
        </div>
      </ProtectedAdminRoute>
    </AdminAuthProvider>
  )
} 