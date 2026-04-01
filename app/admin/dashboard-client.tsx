'use client'

import { useState, useEffect } from 'react'
import { logout } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Users, LayoutDashboard, Settings, FileText, BarChart3, Briefcase, Mail, Bell } from 'lucide-react'
import { ProjectsManager } from '@/components/admin/projects-manager'
import { MessagesManager } from '@/components/admin/messages-manager'
import { SettingsManager } from '@/components/admin/settings-manager'
import { Message, getMessages } from '@/lib/messages'
import { Project, getProjects, initialProjects } from '@/lib/projects'

type Activity = {
  id: string;
  type: 'message' | 'project';
  title: string;
  date: number;
};

export function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'messages' | 'settings'>('dashboard')
  const [messageCount, setMessageCount] = useState(0)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [projectCount, setProjectCount] = useState(0)
  const [pageViews, setPageViews] = useState(0)
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [now, setNow] = useState(0)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(timer)
  }, [])

  const loadDashboardData = async () => {
    // Load Messages
    const msgs = await getMessages()
    setMessageCount(msgs.length)
    setUnreadMessageCount(msgs.filter(m => !m.read).length)

    // Load Projects
    const projs = await getProjects()
    setProjectCount(projs.length)

    // Load Page Views
    const { getPageViews } = await import('@/lib/analytics')
    const views = await getPageViews()
    setPageViews(views)

    // Combine Activity
    const activities: Activity[] = [
      ...msgs.map(m => ({ id: `msg-${m.id}`, type: 'message' as const, title: `New message from ${m.name}`, date: m.createdAt })),
      ...projs.map((p, index) => ({ id: `proj-${p.id}`, type: 'project' as const, title: `Project added: ${p.nameEn}`, date: p.createdAt || (Date.now() - (index * 86400000)) }))
    ].sort((a, b) => b.date - a.date).slice(0, 5)

    setRecentActivity(activities)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboardData()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sharksite_messages') {
        loadDashboardData()
        
        // Check if a new message was added
        if (e.newValue) {
          try {
            const newMsgs: Message[] = JSON.parse(e.newValue)
            const oldMsgs: Message[] = e.oldValue ? JSON.parse(e.oldValue) : []
            if (newMsgs.length > oldMsgs.length) {
              const latestMsg = newMsgs[0] // Assuming newest is first
              const notificationsEnabled = localStorage.getItem('sharksite_notifications_enabled') === 'true';
              if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
                new Notification('New Message Received', {
                  body: `From: ${latestMsg.name}\n${latestMsg.subject || 'No Subject'}`,
                  icon: '/favicon.ico',
                  tag: 'new-message'
                });
              }
            }
          } catch (err) {}
        }
      } else if (e.key === 'sharksite_projects' || e.key === 'sharksite_page_views') {
        loadDashboardData()
      }
    }

    const handleNewMessage = (e: Event) => {
      const customEvent = e as CustomEvent<Message>;
      loadDashboardData();
      
      const notificationsEnabled = localStorage.getItem('sharksite_notifications_enabled') === 'true';
      if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('New Message Received', {
          body: `From: ${customEvent.detail.name}\n${customEvent.detail.subject || 'No Subject'}`,
          icon: '/favicon.ico',
          tag: 'new-message'
        });
      }
    }

    const handleMessagesRead = () => {
      loadDashboardData();
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('sharksite_new_message', handleNewMessage)
    window.addEventListener('sharksite_messages_read', handleMessagesRead)

    // Check for unread messages on load for notifications
    const notificationsEnabled = localStorage.getItem('sharksite_notifications_enabled') === 'true';
    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      const stored = localStorage.getItem('sharksite_messages')
      if (stored) {
        try {
          const parsed: Message[] = JSON.parse(stored)
          const unread = parsed.filter(m => !m.read)
          if (unread.length > 0) {
            // Only notify once per session about unread messages to avoid spam
            if (!sessionStorage.getItem('notified_unread')) {
              new Notification('Unread Messages', {
                body: `You have ${unread.length} unread message(s) waiting.`,
                icon: '/favicon.ico',
                tag: 'unread-messages'
              });
              sessionStorage.setItem('notified_unread', 'true');
            }
          }
        } catch (e) {}
      }
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('sharksite_new_message', handleNewMessage)
      window.removeEventListener('sharksite_messages_read', handleMessagesRead)
    }
  }, [activeTab])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
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
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'messages' ? 'bg-purple-600/20 text-purple-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5" />
              Messages
            </div>
            {unreadMessageCount > 0 && (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'settings' ? 'bg-purple-600/20 text-purple-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl font-medium transition-colors mt-auto w-full">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            {activeTab === 'dashboard' ? 'Dashboard Overview' : activeTab === 'projects' ? 'Projects Management' : activeTab === 'messages' ? 'Messages' : 'Site Settings'}
          </h1>
          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="md:hidden p-2 text-slate-600 hover:bg-slate-200 rounded-lg">
              <LogOut className="w-5 h-5" />
            </button>
            <Link href="/" className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors">
              View Site
            </Link>
          </div>
        </div>

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
                <p className="text-sm text-green-600 font-medium">All time views</p>
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
                    "All caught up"
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
                    <div key={activity.id} className="p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        activity.type === 'message' ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'
                      }`}>
                        {activity.type === 'message' ? <Mail className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
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
        ) : activeTab === 'messages' ? (
          <MessagesManager />
        ) : (
          <SettingsManager />
        )}
      </main>
    </div>
  )
}
