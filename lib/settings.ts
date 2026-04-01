import { supabase, isSupabaseConfigured } from './supabase'

export type SocialLinks = {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  github?: string;
  youtube?: string;
};

export type SiteSettings = {
  siteNameEn: string;
  siteNameAr: string;
  faviconUrl: string;
  contactEmail: string;
  officeAddressEn: string;
  officeAddressAr: string;
  socialLinks: SocialLinks;
};

export const defaultSettings: SiteSettings = {
  siteNameEn: 'SharkSite',
  siteNameAr: 'شارك سايت',
  faviconUrl: '/favicon.ico',
  contactEmail: 'hello@sharksite.com',
  officeAddressEn: '123 Innovation Drive, Tech District, Riyadh, KSA',
  officeAddressAr: '123 شارع الابتكار، حي التقنية، الرياض، المملكة العربية السعودية',
  socialLinks: {
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
    github: 'https://github.com',
  }
};

export async function getSettings(): Promise<SiteSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 'default').single()
      if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"
      if (data) {
        return {
          siteNameEn: data.siteNameEn || defaultSettings.siteNameEn,
          siteNameAr: data.siteNameAr || defaultSettings.siteNameAr,
          faviconUrl: data.faviconUrl || defaultSettings.faviconUrl,
          contactEmail: data.contactEmail || defaultSettings.contactEmail,
          officeAddressEn: data.officeAddressEn || defaultSettings.officeAddressEn,
          officeAddressAr: data.officeAddressAr || defaultSettings.officeAddressAr,
          socialLinks: data.socialLinks || defaultSettings.socialLinks,
        }
      }
    } catch (error) {
      console.error('Error fetching settings from Supabase:', error)
    }
  }

  if (typeof window === 'undefined') return defaultSettings;
  const stored = localStorage.getItem('sharksite_settings');
  if (stored) {
    try {
      return { ...defaultSettings, ...JSON.parse(stored) };
    } catch (e) {
      return defaultSettings;
    }
  }
  return defaultSettings;
}

export async function saveSettings(settings: SiteSettings) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('settings').upsert({
        id: 'default',
        ...settings
      })
      if (error) throw error
    } catch (error) {
      console.error('Error saving settings to Supabase:', error)
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('sharksite_settings', JSON.stringify(settings));
    // Dispatch event to update other components
    window.dispatchEvent(new Event('settingsUpdated'));
  }
}
