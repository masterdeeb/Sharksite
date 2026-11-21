'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminDashboard } from './dashboard-client'
import { useLocalAuth } from '@/lib/local-auth'

export default function AdminPage() {
  const router = useRouter()
  const { authReady, isAdmin } = useLocalAuth()

  useEffect(() => {
    if (authReady && !isAdmin) {
      router.replace('/admin/login')
    }
  }, [authReady, isAdmin, router])

  if (!authReady || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin" />
      </div>
    )
  }

  return <AdminDashboard />
}
