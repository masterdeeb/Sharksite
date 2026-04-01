'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminDashboard } from './dashboard-client'
import { checkAuth } from '@/app/actions/auth'

export default function AdminPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuth = await checkAuth()
      if (!isAuth) {
        router.push('/admin/login')
      } else {
        setIsAuthorized(true)
      }
    }
    verifyAuth()
  }, [router])

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin" />
      </div>
    )
  }

  return <AdminDashboard />
}
