'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/app/actions/auth'
import { Lock, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const result = await login(password)
      if (result.success) {
        window.location.href = '/admin'
      } else {
        setError(result.error || 'Login failed')
        setIsLoading(false)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
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
        <p className="text-slate-500 text-center mb-8">Enter your password to access the dashboard</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
              disabled={isLoading}
            />
            {error && <p className="text-red-500 text-sm mt-2 ml-2 font-medium">{error}</p>}
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-purple-600 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
          >
            <span>{isLoading ? 'Logging in...' : 'Login'}</span>
            {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
      </div>
    </div>
  )
}
