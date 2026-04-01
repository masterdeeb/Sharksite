'use client'

import { useEffect } from 'react'
import { getSettings } from '@/lib/settings'
import { useLanguage } from '@/lib/i18n'

export function ClientSettings() {
  const { language } = useLanguage()

  useEffect(() => {
    const applySettings = async () => {
      const settings = await getSettings()
      
      // Update title
      document.title = language === 'ar' ? settings.siteNameAr : settings.siteNameEn
      
      // Update favicon
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = settings.faviconUrl
    }

    applySettings()

    // Listen for settings updates
    window.addEventListener('settingsUpdated', applySettings)
    return () => window.removeEventListener('settingsUpdated', applySettings)
  }, [language])

  return null
}
