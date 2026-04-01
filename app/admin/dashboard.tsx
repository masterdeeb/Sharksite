'use client'

import { logout } from './actions'
import { LogOut, LayoutDashboard, FileText, Briefcase } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <LayoutDashboard className="w-5 h-5 text-purple-500" />
            <span>لوحة التحكم</span>
          </div>
          <button 
            onClick={() => logout()}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            تسجيل خروج
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Blog Management Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-purple-500/50 transition-colors group cursor-pointer">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
              <FileText className="w-6 h-6 text-slate-400 group-hover:text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">إدارة المدونة</h2>
            <p className="text-slate-400 text-sm">إضافة وتعديل وحذف المقالات</p>
          </div>

          {/* Portfolio Management Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-purple-500/50 transition-colors group cursor-pointer">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
              <Briefcase className="w-6 h-6 text-slate-400 group-hover:text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">إدارة الأعمال</h2>
            <p className="text-slate-400 text-sm">إضافة وتعديل وحذف المشاريع</p>
          </div>
        </div>
      </main>
    </div>
  )
}
