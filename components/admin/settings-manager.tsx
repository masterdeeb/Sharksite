'use client'

import { useState, useEffect } from 'react'
import { Save, UploadCloud, Link as LinkIcon, Lock } from 'lucide-react'
import { SiteSettings, getSettings, saveSettings } from '@/lib/settings'

import { updatePassword } from '@/app/actions/auth'

export function SettingsManager() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

  useEffect(() => {
    const loadSettings = async () => {
      const s = await getSettings();
      setSettings(s);
    };
    loadSettings();
  }, [])

  const handleSave = async () => {
    if (!settings) return
    setIsSaving(true)
    await saveSettings(settings)
    setTimeout(() => setIsSaving(false), 800)
  }

  const handlePasswordUpdate = async () => {
    if (!password) return
    try {
      const res = await updatePassword(password)
      if (res.success) {
        setPasswordMessage('Password updated successfully')
        setPassword('')
      } else {
        setPasswordMessage(res.error || 'Failed to update password')
      }
    } catch (e) {
      setPasswordMessage('Error updating password')
    }
    setTimeout(() => setPasswordMessage(''), 3000)
  }

  if (!settings) return null

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Site Settings</h2>
          <p className="text-sm text-slate-500">Manage your website&apos;s global configuration</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors disabled:opacity-70"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving...' : 'Save Changes'}
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
              onChange={e => setSettings({...settings, siteNameEn: e.target.value})}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Site Name (Arabic)</label>
            <input 
              type="text" 
              value={settings.siteNameAr}
              onChange={e => setSettings({...settings, siteNameAr: e.target.value})}
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
                onChange={e => setSettings({...settings, faviconUrl: e.target.value})}
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
              onChange={e => setSettings({...settings, contactEmail: e.target.value})}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Office Address (English)</label>
            <textarea 
              value={settings.officeAddressEn}
              onChange={e => setSettings({...settings, officeAddressEn: e.target.value})}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Office Address (Arabic)</label>
            <textarea 
              value={settings.officeAddressAr}
              onChange={e => setSettings({...settings, officeAddressAr: e.target.value})}
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
                onChange={e => setSettings({
                  ...settings, 
                  socialLinks: { ...settings.socialLinks, [network]: e.target.value }
                })}
                placeholder={`https://${network}.com/...`}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-sm"
              />
            </div>
          ))}
        </div>

        {/* Security */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 h-fit">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" /> Security
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Change Admin Password</label>
            <div className="flex gap-3">
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="New password"
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
              <button 
                onClick={handlePasswordUpdate}
                disabled={!password}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Update
              </button>
            </div>
            {passwordMessage && (
              <p className={`text-sm mt-2 ${passwordMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {passwordMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
