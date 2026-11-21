'use client'

import { useEffect } from 'react'
import { subscribeToSettings } from '@/lib/settings'
import { useLanguage } from '@/lib/i18n'

export function ClientSettings() {
  const { language } = useLanguage()

  useEffect(() => {
    const unsubscribe = subscribeToSettings(
      (settings) => {
        document.title = language === 'ar' ? settings.siteNameAr : settings.siteNameEn

        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null
        if (!link) {
          link = document.createElement('link')
          link.rel = 'icon'
          document.head.appendChild(link)
        }
        link.href = settings.faviconUrl
      },
      (error) => {
        console.error('Error subscribing to settings:', error)
      }
    )

    return () => unsubscribe()
  }, [language])

  return null
}
