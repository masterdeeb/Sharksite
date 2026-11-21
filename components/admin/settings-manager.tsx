'use client'

import { useState, useEffect } from 'react'
import { Save, Link as LinkIcon, ShieldCheck, Check, KeyRound } from 'lucide-react'
import { SiteSettings, defaultSettings, subscribeToSettings, saveSettings } from '@/lib/settings'
import { useLocalAuth, updateLocalAdminPassword } from '@/lib/local-auth'

export function SettingsManager() {
  const { adminLabel } = useLocalAuth()
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeToSettings(
      (s) => setSettings(s),
      (error) => console.error('SettingsManager subscription error:', error)
    )
    return () => unsubscribe()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setSavedSuccess(false)
    try {
      await saveSettings(settings)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2000)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordStatus(null)
    const res = await updateLocalAdminPassword(currentPassword, newPassword)
    if (res.ok) {
      setCurrentPassword('')
      setNewPassword('')
      setPasswordStatus({ ok: true, text: 'Admin password updated in local database.' })
    } else {
      setPasswordStatus({ ok: false, text: res.error || 'Could not update password.' })
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Site Settings</h2>
          <p className="text-sm text-slate-500">Manage your website&apos;s global configuration in real time</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors disabled:opacity-70"
        >
          {savedSuccess ? <Check className="w-5 h-5 text-green-400" /> : <Save className="w-5 h-5" />}
          {isSaving ? 'Saving...' : savedSuccess ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">General Info</h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Site Name (English)</label>
            <input
              type="text"
              value={settings.siteNameEn}
              onChange={(e) => setSettings({ ...settings, siteNameEn: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Site Name (Arabic)</label>
            <input
              type="text"
              value={settings.siteNameAr}
              onChange={(e) => setSettings({ ...settings, siteNameAr: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-right"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Favicon URL</label>
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden">
                {settings.faviconUrl ? (
                  <img src={settings.faviconUrl} alt="Favicon" className="w-8 h-8 object-contain" />
                ) : (
                  <LinkIcon className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <input
                type="url"
                value={settings.faviconUrl}
                onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                placeholder="https://... or /favicon.ico"
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">Enter a direct URL to an image (.ico, .png, .svg)</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Contact Information</h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Contact Email</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Office Address (English)</label>
            <textarea
              value={settings.officeAddressEn}
              onChange={(e) => setSettings({ ...settings, officeAddressEn: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Office Address (Arabic)</label>
            <textarea
              value={settings.officeAddressAr}
              onChange={(e) => setSettings({ ...settings, officeAddressAr: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none h-20 text-right"
              dir="rtl"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Social Media Links</h3>

          {['facebook', 'twitter', 'instagram', 'linkedin', 'github', 'youtube'].map((network) => (
            <div key={network}>
              <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">{network}</label>
              <input
                type="url"
                value={settings.socialLinks[network as keyof typeof settings.socialLinks] || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, [network]: e.target.value },
                  })
                }
                placeholder={`https://${network}.com/...`}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-sm"
              />
            </div>
          ))}
        </div>

        {/* Local Security */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600" /> Local Admin Security
          </h3>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Session Mode</p>
            <p className="text-sm font-bold text-slate-900">{adminLabel}</p>
            <p className="text-xs text-green-600 font-medium">100% Local IndexedDB Storage (No external server)</p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-3 pt-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" /> Change Admin Password
            </p>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none text-sm"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 4 chars)"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 outline-none text-sm"
            />
            {passwordStatus && (
              <p className={`text-xs font-medium ${passwordStatus.ok ? 'text-green-600' : 'text-red-600'}`}>
                {passwordStatus.text}
              </p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-purple-600 transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
