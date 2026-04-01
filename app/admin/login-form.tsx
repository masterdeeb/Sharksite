'use client'

import { useActionState } from 'react'
import { login } from './actions'
import { Lock, Loader2 } from 'lucide-react'

const initialState = {
  success: false,
  error: '',
}

export default function AdminLogin() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4" dir="rtl">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-purple-900/20"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700">
            <Lock className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-white text-center mb-2">لوحة التحكم</h1>
        <p className="text-slate-400 text-center mb-8 text-sm">أدخل كلمة المرور للمتابعة</p>

        <form action={formAction} className="space-y-4">
          <div>
            <input
              type="password"
              name="password"
              placeholder="كلمة المرور"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors text-center tracking-widest"
              autoFocus
            />
          </div>

          {state?.error && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded-lg border border-red-900/50">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري التحقق...
              </>
            ) : (
              'دخول'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
