'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, LayoutDashboard, Settings, FileText, BarChart3, Briefcase, Mail, BookOpen, Database } from 'lucide-react'
import { ProjectsManager } from '@/components/admin/projects-manager'
import { MessagesManager } from '@/components/admin/messages-manager'
import { SettingsManager } from '@/components/admin/settings-manager'
import { BlogManager } from '@/components/admin/blog-manager'
import { BackupManager } from '@/components/admin/backup-manager'
import { Message, subscribeToMessages } from '@/lib/messages'
import { Project, subscribeToProjects } from '@/lib/projects'
import { subscribeToPageViews } from '@/lib/analytics'
import { useLocalAuth } from '@/lib/local-auth'

type Activity = {
  id: string
  type: 'message' | 'project'
  title: string
  date: number
}

export function AdminDashboard() {
  const router = useRouter()
  const { authReady, isAdmin, signOutUser } = useLocalAuth()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'blog' | 'messages' | 'settings' | 'backup'>('dashboard')
  const [messages, setMessages] = useState<Message[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [pageViews, setPageViews] = useState(0)
  const [dbError, setDbError] = useState<string | null>(null)
  const [now, setNow] = useState(0)
  const prevMsgCountRef = useRef<number | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!authReady || !isAdmin) return

    const reportError = (label: string, error: unknown) => {
      const msg = error instanceof Error ? error.message : String(error)
      console.error(`${label}:`, error)
      setDbError(`${label}: ${msg}`)
    }

    const unsubMessages = subscribeToMessages(
      (msgs) => {
        if (prevMsgCountRef.current !== null && msgs.length > prevMsgCountRef.current) {
          const latestMsg = msgs[0]
          const notificationsEnabled = localStorage.getItem('sharksite_notifications_enabled') === 'true'
          if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('New Message Received', {
              body: `From: ${latestMsg.name}\n${latestMsg.subject || 'No Subject'}`,
              icon: '/favicon.ico',
              tag: 'new-message',
            })
          }
        }
        prevMsgCountRef.current = msgs.length
        setMessages(msgs)
      },
      (error) => reportError('Messages sync error', error)
    )

    const unsubProjects = subscribeToProjects(
      (projs) => setProjects(projs),
      (error) => reportError('Projects sync error', error)
    )

    const unsubViews = subscribeToPageViews(
      (views) => setPageViews(views),
      (error) => reportError('Analytics sync error', error)
    )

    return () => {
      unsubMessages()
      unsubProjects()
      unsubViews()
    }
  }, [authReady, isAdmin])

  const messageCount = messages.length
  const unreadMessageCount = messages.filter((m) => !m.read).length
  const projectCount = projects.length

  const recentActivity: Activity[] = [
    ...messages.map((m) => ({
      id: `msg-${m.id}`,
      type: 'message' as const,
      title: `New message from ${m.name}`,
      date: m.createdAt,
    })),
    ...projects.map((p, index) => ({
      id: `proj-${p.id}`,
      type: 'project' as const,
      title: `Project: ${p.nameEn}`,
      date: p.createdAt || now - index * 86400000,
    })),
  ]
    .sort((a, b) => b.date - a.date)
    .slice(0, 5)

  const handleLogout = async () => {
    await signOutUser()
    router.push('/')
  }

  const formatTimeAgo = (timestamp: number) => {
    if (now === 0) return ''
    const seconds = Math.max(0, Math.floor((now - timestamp) / 1000))
    if (seconds < 60) return `${seconds} seconds ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    const days = Math.floor(hours / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col hidden md:flex shrink-0">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tighter">Admin Panel</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-purple-600/20 text-purple-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'projects' ? 'bg-purple-600/20 text-purple-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Briefcase className="w-5 h-5" />
            Projects
          </button>
          <button
            onClick={() => setActiveTab('blog')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'blog' ? 'bg-purple-600/20 text-purple-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <BookOpen className="w-5 h-5" />
            Blog
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'messages' ? 'bg-purple-600/20 text-purple-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5" />
              Messages
            </div>
            {unreadMessageCount > 0 && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'settings' ? 'bg-purple-600/20 text-purple-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'backup' ? 'bg-purple-600/20 text-purple-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Database className="w-5 h-5" />
            Backup (JSON)
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl font-medium transition-colors mt-auto w-full"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            {activeTab === 'dashboard'
              ? 'Dashboard Overview'
              : activeTab === 'projects'
                ? 'Projects Management'
                : activeTab === 'blog'
                  ? 'Blog Management'
                  : activeTab === 'messages'
                    ? 'Messages'
                    : activeTab === 'backup'
                      ? 'Export & Import (JSON)'
                      : 'Site Settings'}
          </h1>
          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="md:hidden p-2 text-slate-600 hover:bg-slate-200 rounded-lg">
              <LogOut className="w-5 h-5" />
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              View Site
            </Link>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="flex md:hidden gap-2 overflow-x-auto pb-4 mb-4">
          {(['dashboard', 'projects', 'blog', 'messages', 'settings', 'backup'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize shrink-0 ${
                activeTab === tab ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {dbError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium break-words">
            {dbError}
          </div>
        )}

        {activeTab === 'dashboard' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Views</p>
                    <h3 className="text-3xl font-bold text-slate-900">
                      {pageViews > 1000 ? `${(pageViews / 1000).toFixed(1)}K` : pageViews}
                    </h3>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-sm text-green-600 font-medium">Local IndexedDB count</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Active Projects</p>
                    <h3 className="text-3xl font-bold text-slate-900">{projectCount}</h3>
                  </div>
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-sm text-slate-500 font-medium">Total portfolio items</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Messages</p>
                    <h3 className="text-3xl font-bold text-slate-900">{messageCount}</h3>
                  </div>
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 relative">
                    <Mail className="w-5 h-5" />
                    {unreadMessageCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  {unreadMessageCount > 0 ? (
                    <span className="text-red-500 font-bold">{unreadMessageCount} unread</span>
                  ) : (
                    'All caught up'
                  )}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {recentActivity.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No recent activity found.</div>
                ) : (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          activity.type === 'message'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-purple-50 text-purple-600'
                        }`}
                      >
                        {activity.type === 'message' ? (
                          <Mail className="w-5 h-5" />
                        ) : (
                          <Briefcase className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                        <p className="text-xs text-slate-500">{formatTimeAgo(activity.date)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : activeTab === 'projects' ? (
          <ProjectsManager />
        ) : activeTab === 'blog' ? (
          <BlogManager />
        ) : activeTab === 'messages' ? (
          <MessagesManager />
        ) : activeTab === 'backup' ? (
          <BackupManager />
        ) : (
          <SettingsManager />
        )}
      </main>
    </div>
  )
}
