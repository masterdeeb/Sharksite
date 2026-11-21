'use client'

import { useState, useEffect } from 'react'
import { Trash2, Mail, Clock, User, MessageSquare, Bell, BellOff } from 'lucide-react'
import {
  Message,
  subscribeToMessages,
  updateMessageRead,
  deleteMessageFromFirestore,
} from '@/lib/messages'
import { useLocalAuth } from '@/lib/local-auth'

export function MessagesManager() {
  const { authReady, isAdmin } = useLocalAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [now, setNow] = useState(0)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      const enabled = localStorage.getItem('sharksite_notifications_enabled') === 'true'
      setNotificationsEnabled(enabled)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          setNotificationsEnabled(true)
          localStorage.setItem('sharksite_notifications_enabled', 'true')
        } else {
          alert('Please allow notifications in your browser settings to enable this feature.')
        }
      } else {
        alert('Your browser does not support desktop notifications.')
      }
    } else {
      setNotificationsEnabled(false)
      localStorage.setItem('sharksite_notifications_enabled', 'false')
    }
  }

  useEffect(() => {
    const updateNow = () => setNow(Date.now())
    updateNow()
    const timer = setInterval(updateNow, 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!authReady || !isAdmin) return

    const unsubscribe = subscribeToMessages(
      async (msgs) => {
        setMessages(msgs)
        const unreadMsgs = msgs.filter((m) => !m.read)
        if (unreadMsgs.length > 0) {
          for (const msg of unreadMsgs) {
            try {
              await updateMessageRead(msg.id, true)
            } catch (e) {
              console.error('Error marking message read:', e)
            }
          }
        }
      },
      (error) => console.error('Messages subscription error:', error)
    )

    return () => unsubscribe()
  }, [authReady, isAdmin])

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      await deleteMessageFromFirestore(id)
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    if (now === 0) return ''
    const seconds = Math.max(0, Math.floor((now - timestamp) / 1000))

    if (seconds < 60) {
      return `${seconds} seconds ago`
    }

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    }

    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    }

    const days = Math.floor(hours / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Mail className="w-5 h-5 text-purple-600" />
          Messages
          <span className="bg-purple-100 text-purple-600 text-xs py-0.5 px-2 rounded-full ml-2">
            {messages.length}
          </span>
        </h2>

        <button
          onClick={toggleNotifications}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            notificationsEnabled
              ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {notificationsEnabled ? (
            <>
              <Bell className="w-4 h-4" />
              Notifications On
            </>
          ) : (
            <>
              <BellOff className="w-4 h-4" />
              Notifications Off
            </>
          )}
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {messages.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-slate-300" />
            </div>
            No messages found.
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="p-6 hover:bg-slate-50 transition-colors group">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        {msg.name}
                      </h3>
                      <a
                        href={`mailto:${msg.email}`}
                        className="text-sm text-purple-600 hover:underline flex items-center gap-2 mt-1"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {msg.email}
                      </a>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-500 flex items-center gap-1.5 justify-end">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTimeAgo(msg.createdAt)}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {formatDate(msg.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    {msg.subject && (
                      <div className="text-sm font-bold text-slate-900 mb-2 pb-2 border-b border-slate-100">
                        Subject: {msg.subject}
                      </div>
                    )}
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed flex gap-3">
                      <MessageSquare className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                      {msg.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-start justify-end opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="md:hidden text-sm font-medium">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
