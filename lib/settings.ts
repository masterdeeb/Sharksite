import {
  Unsubscribe,
  ensureLocalDbSeeded,
  getKv,
  setKv,
  onCollectionChange,
  SITE_CONTACT_DEFAULTS,
} from './local-db'

export type SocialLinks = {
  facebook?: string
  twitter?: string
  instagram?: string
  linkedin?: string
  github?: string
  youtube?: string
}

export type SiteSettings = {
  siteNameEn: string
  siteNameAr: string
  faviconUrl: string
  contactEmail: string
  officeAddressEn: string
  officeAddressAr: string
  socialLinks: SocialLinks
}

export const defaultSettings: SiteSettings = {
  siteNameEn: 'SharkSite',
  siteNameAr: 'شارك سايت',
  faviconUrl: '/favicon.ico',
  contactEmail: SITE_CONTACT_DEFAULTS.contactEmail,
  officeAddressEn: SITE_CONTACT_DEFAULTS.officeAddressEn,
  officeAddressAr: SITE_CONTACT_DEFAULTS.officeAddressAr,
  socialLinks: {
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
  },
}

const SETTINGS_KV_KEY = 'settings'

function mapSettingsDoc(data: Partial<SiteSettings> | null | undefined): SiteSettings {
  if (!data) return defaultSettings
  return {
    siteNameEn:
      typeof data.siteNameEn === 'string' && data.siteNameEn
        ? data.siteNameEn
        : defaultSettings.siteNameEn,
    siteNameAr:
      typeof data.siteNameAr === 'string' && data.siteNameAr
        ? data.siteNameAr
        : defaultSettings.siteNameAr,
    faviconUrl:
      typeof data.faviconUrl === 'string' ? data.faviconUrl : defaultSettings.faviconUrl,
    contactEmail:
      typeof data.contactEmail === 'string' && data.contactEmail
        ? data.contactEmail
        : defaultSettings.contactEmail,
    officeAddressEn:
      typeof data.officeAddressEn === 'string'
        ? data.officeAddressEn
        : defaultSettings.officeAddressEn,
    officeAddressAr:
      typeof data.officeAddressAr === 'string'
        ? data.officeAddressAr
        : defaultSettings.officeAddressAr,
    socialLinks: (data.socialLinks as SocialLinks) || defaultSettings.socialLinks,
  }
}

export async function getSettings(): Promise<SiteSettings> {
  if (typeof window === 'undefined') return defaultSettings
  await ensureLocalDbSeeded()
  const stored = await getKv<Partial<SiteSettings>>(SETTINGS_KV_KEY)
  return mapSettingsDoc(stored)
}

export function subscribeToSettings(
  onData: (settings: SiteSettings) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  if (typeof window === 'undefined') return () => {}

  let active = true
  const load = async () => {
    try {
      const next = await getSettings()
      if (active) onData(next)
    } catch (err) {
      if (active && onError) onError(err)
    }
  }

  load()
  const unsub = onCollectionChange('settings', load)

  return () => {
    active = false
    unsub()
  }
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  await ensureLocalDbSeeded()
  const cleanSocials: SocialLinks = {}
  const allowedKeys: (keyof SocialLinks)[] = [
    'facebook',
    'twitter',
    'instagram',
    'linkedin',
    'github',
    'youtube',
  ]
  for (const key of allowedKeys) {
    const val = settings.socialLinks?.[key]
    if (typeof val === 'string' && val.trim()) {
      cleanSocials[key] = val.trim().slice(0, 500)
    }
  }

  const saved: SiteSettings = {
    siteNameEn: (settings.siteNameEn || defaultSettings.siteNameEn).trim().slice(0, 120),
    siteNameAr: (settings.siteNameAr || defaultSettings.siteNameAr).trim().slice(0, 120),
    faviconUrl: (settings.faviconUrl || '/favicon.ico').trim().slice(0, 10000),
    contactEmail: (settings.contactEmail || defaultSettings.contactEmail).trim().slice(0, 160),
    officeAddressEn: (settings.officeAddressEn || '').trim().slice(0, 500),
    officeAddressAr: (settings.officeAddressAr || '').trim().slice(0, 500),
    socialLinks: cleanSocials,
  }

  await setKv(SETTINGS_KV_KEY, saved, 'settings')
}
