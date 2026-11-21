'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, ArrowLeft, Eye, EyeOff, KeyRound } from 'lucide-react'
import Link from 'next/link'
import { useLocalAuth, signInLocalAdmin } from '@/lib/local-auth'

export default function LoginPage() {
  const router = useRouter()
  const { authReady, isAdmin } = useLocalAuth()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (authReady && isAdmin) {
      router.replace('/admin')
    }
  }, [authReady, isAdmin, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('Please enter the admin password.')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const ok = await signInLocalAdmin(password)
      if (ok) {
        router.replace('/admin')
      } else {
        setError('Incorrect password. Default password is "admin123" unless changed in Settings.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please try again.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-100/60 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-100/60 rounded-full blur-[100px] pointer-events-none" />

      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-purple-100/50 max-w-md w-full border border-slate-200 relative z-10">
        <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Lock className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">Admin Login</h1>
        <p className="text-slate-500 text-center mb-8 text-sm">
          Enter your local admin password to manage site content, JSON backups, and settings.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-xl text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Admin Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (default: admin123)"
                className="w-full pl-10 pr-11 py-3.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-sm"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 text-white py-4 px-6 rounded-xl font-bold hover:bg-purple-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
          >
            <span>{isLoading ? 'Signing in...' : 'Sign In to Dashboard'}</span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-purple-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Website
          </Link>
        </div>
      </div>
    </div>
  )
}
