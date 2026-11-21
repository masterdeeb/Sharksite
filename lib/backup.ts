import {
  ensureLocalDbSeeded,
  getAllRecords,
  getKv,
  setKv,
  putManyRecords,
  notifyCollectionChange,
  applyPublicSeedFile,
} from './local-db'
import { Project, CategoryDoc, CustomLink } from './projects'
import { BlogPost } from './blog'
import { Message } from './messages'
import { SiteSettings, defaultSettings, SocialLinks } from './settings'

export interface LocalPreferencesBackup {
  language?: string | null
  theme?: string | null
  notificationsEnabled?: boolean
}

export interface SiteBackupData {
  projects: Project[]
  categories: CategoryDoc[]
  blog_posts: BlogPost[]
  messages: Message[]
  settings: SiteSettings
  analytics: {
    pageViews: number
  }
  localPreferences?: LocalPreferencesBackup
}

export interface SiteBackupPayload {
  version: string
  app: string
  exportedAt: string
  database: string
  data: SiteBackupData
}

export interface BackupSummary {
  projectsCount: number
  categoriesCount: number
  blogPostsCount: number
  messagesCount: number
  hasSettings: boolean
  pageViews: number
  hasLocalPreferences: boolean
}

export interface ImportBackupOptions {
  excludeContact?: boolean
}

function normalizeTimestamp(val: unknown): number {
  if (typeof val === 'number' && Number.isFinite(val)) return val
  if (typeof val === 'string') {
    const parsed = Date.parse(val)
    if (!Number.isNaN(parsed)) return parsed
  }
  return Date.now()
}

function sanitizeId(raw: unknown, prefix: string, index: number): string {
  const str = typeof raw === 'string' ? raw.trim() : ''
  const cleaned = str.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128)
  return cleaned || `${prefix}_${Date.now()}_${index}`
}

function sanitizeSlug(raw: unknown, fallback: string): string {
  const str = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  const cleaned = str
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)
  return cleaned || fallback
}

function normalizeExternalProject(raw: Record<string, unknown>, index: number): Project {
  const id = sanitizeId(raw.id, 'proj', index)
  const rawCategories = Array.isArray(raw.categories)
    ? raw.categories.map(String)
    : raw.category
      ? [String(raw.category)]
      : ['Web Design']
  const primaryCat = String(raw.category || rawCategories[0] || 'Web Design').trim() || 'Web Design'
  const customLinks: CustomLink[] = Array.isArray(raw.customLinks)
    ? raw.customLinks.map((l: Record<string, unknown>) => ({
        url: String(l?.url || '#').trim(),
        labelEn: String(l?.labelEn || 'Visit Project').trim(),
        labelAr: String(l?.labelAr || 'زيارة المشروع').trim(),
      }))
    : []

  const descEn =
    typeof raw.descEn === 'string'
      ? raw.descEn
      : typeof raw.descriptionEn === 'string'
        ? raw.descriptionEn
        : undefined
  const descAr =
    typeof raw.descAr === 'string'
      ? raw.descAr
      : typeof raw.descriptionAr === 'string'
        ? raw.descriptionAr
        : undefined

  return {
    id,
    nameEn: String(raw.nameEn || raw.name || 'Untitled Project').trim(),
    ...(typeof raw.nameAr === 'string' ? { nameAr: raw.nameAr.trim() } : {}),
    ...(descEn !== undefined ? { descEn: descEn.trim() } : {}),
    ...(descAr !== undefined ? { descAr: descAr.trim() } : {}),
    technologies: Array.isArray(raw.technologies) ? raw.technologies.map(String) : [],
    category: primaryCat,
    categories: rawCategories.length > 0 ? rawCategories : [primaryCat],
    link: String(raw.link || customLinks[0]?.url || '#').trim(),
    customLinks,
    mainImage: String(raw.mainImage || '').trim(),
    gallery: Array.isArray(raw.gallery) ? raw.gallery.map(String) : [],
    showOnHome: raw.showOnHome !== undefined ? Boolean(raw.showOnHome) : true,
    createdAt: normalizeTimestamp(raw.createdAt),
  }
}

export async function exportAllSiteData(): Promise<SiteBackupPayload> {
  await ensureLocalDbSeeded()

  const [projects, categoriesRaw, blog_posts, messages, settingsRaw, analyticsRaw] =
    await Promise.all([
      getAllRecords<Project>('projects'),
      getAllRecords<CategoryDoc>('categories'),
      getAllRecords<BlogPost>('blog_posts'),
      getAllRecords<Message>('messages'),
      getKv<SiteSettings>('settings'),
      getKv<{ count?: number }>('analytics'),
    ])

  const categories = [...categoriesRaw].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const settings: SiteSettings = settingsRaw
    ? {
        siteNameEn: settingsRaw.siteNameEn || defaultSettings.siteNameEn,
        siteNameAr: settingsRaw.siteNameAr || defaultSettings.siteNameAr,
        faviconUrl: settingsRaw.faviconUrl || defaultSettings.faviconUrl,
        contactEmail: settingsRaw.contactEmail || defaultSettings.contactEmail,
        officeAddressEn: settingsRaw.officeAddressEn ?? defaultSettings.officeAddressEn,
        officeAddressAr: settingsRaw.officeAddressAr ?? defaultSettings.officeAddressAr,
        socialLinks: settingsRaw.socialLinks || defaultSettings.socialLinks,
      }
    : defaultSettings

  const pageViews = Math.max(0, Math.floor(Number(analyticsRaw?.count ?? 0) || 0))

  let localPreferences: LocalPreferencesBackup | undefined
  if (typeof window !== 'undefined') {
    localPreferences = {
      language: localStorage.getItem('language'),
      theme: localStorage.getItem('theme'),
      notificationsEnabled: localStorage.getItem('sharksite_notifications_enabled') === 'true',
    }
  }

  return {
    version: '1.0.0',
    app: 'SharkSite',
    exportedAt: new Date().toISOString(),
    database: 'indexeddb-local',
    data: {
      projects,
      categories,
      blog_posts,
      messages,
      settings,
      analytics: { pageViews },
      ...(localPreferences ? { localPreferences } : {}),
    },
  }
}

export function parseAndValidateBackup(rawJson: string): {
  payload: SiteBackupPayload
  summary: BackupSummary
} {
  let parsed: unknown
  try {
    parsed = JSON.parse(rawJson)
  } catch {
    throw new Error('Invalid JSON file. Please select a valid JSON backup file.')
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid backup format: root must be a JSON object.')
  }

  const root = parsed as Record<string, unknown>
  const dataObj =
    root.data && typeof root.data === 'object' && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root

  const hasAnyKey = ['projects', 'categories', 'blog_posts', 'messages', 'settings', 'analytics'].some(
    (k) => k in dataObj
  )
  if (!hasAnyKey) {
    throw new Error('The JSON file does not contain recognized SharkSite backup collections.')
  }

  const arrayKeys = ['projects', 'categories', 'blog_posts', 'messages'] as const
  for (const key of arrayKeys) {
    if (key in dataObj && !Array.isArray(dataObj[key])) {
      throw new Error(`Invalid backup format: "${key}" must be an array.`)
    }
  }

  const projects: Project[] = Array.isArray(dataObj.projects)
    ? (dataObj.projects as Record<string, unknown>[]).map((p, idx) => normalizeExternalProject(p, idx))
    : []

  const rawCategories = Array.isArray(dataObj.categories) ? dataObj.categories : []
  const categories: CategoryDoc[] = rawCategories.map((c, idx) => {
    if (typeof c === 'string') {
      return { id: sanitizeId(`cat_${c.toLowerCase()}`, 'cat', idx), name: c, order: idx }
    }
    const obj = (c as Record<string, unknown>) || {}
    return {
      id: sanitizeId(obj.id, 'cat', idx),
      name: String(obj.name ?? `Category ${idx + 1}`),
      order: typeof obj.order === 'number' ? obj.order : idx,
    }
  })

  const blog_posts = Array.isArray(dataObj.blog_posts) ? (dataObj.blog_posts as BlogPost[]) : []
  const messages = Array.isArray(dataObj.messages) ? (dataObj.messages as Message[]) : []

  const rawSettings =
    dataObj.settings && typeof dataObj.settings === 'object' && !Array.isArray(dataObj.settings)
      ? (dataObj.settings as Partial<SiteSettings>)
      : null

  const settings: SiteSettings = rawSettings
    ? {
        siteNameEn: rawSettings.siteNameEn || defaultSettings.siteNameEn,
        siteNameAr: rawSettings.siteNameAr || defaultSettings.siteNameAr,
        faviconUrl: rawSettings.faviconUrl ?? defaultSettings.faviconUrl,
        contactEmail: rawSettings.contactEmail || defaultSettings.contactEmail,
        officeAddressEn: rawSettings.officeAddressEn ?? defaultSettings.officeAddressEn,
        officeAddressAr: rawSettings.officeAddressAr ?? defaultSettings.officeAddressAr,
        socialLinks: rawSettings.socialLinks || defaultSettings.socialLinks,
      }
    : defaultSettings

  const rawAnalytics =
    dataObj.analytics && typeof dataObj.analytics === 'object' && !Array.isArray(dataObj.analytics)
      ? (dataObj.analytics as Record<string, unknown>)
      : {}
  const pageViews = Math.max(
    0,
    Math.floor(Number(rawAnalytics.pageViews ?? rawAnalytics.count ?? 0) || 0)
  )

  const localPreferences =
    dataObj.localPreferences && typeof dataObj.localPreferences === 'object'
      ? (dataObj.localPreferences as LocalPreferencesBackup)
      : undefined

  const payload: SiteBackupPayload = {
    version: typeof root.version === 'string' ? root.version : '1.0.0',
    app: typeof root.app === 'string' ? root.app : 'SharkSite',
    exportedAt: typeof root.exportedAt === 'string' ? root.exportedAt : new Date().toISOString(),
    database: 'indexeddb-local',
    data: {
      projects,
      categories,
      blog_posts,
      messages,
      settings,
      analytics: { pageViews },
      ...(localPreferences ? { localPreferences } : {}),
    },
  }

  return {
    payload,
    summary: {
      projectsCount: projects.length,
      categoriesCount: categories.length,
      blogPostsCount: blog_posts.length,
      messagesCount: messages.length,
      hasSettings: Boolean(rawSettings),
      pageViews,
      hasLocalPreferences: Boolean(localPreferences),
    },
  }
}

export async function importAllSiteData(
  backup: SiteBackupPayload,
  mode: 'merge' | 'replace',
  onProgress?: (status: string) => void,
  options: ImportBackupOptions = { excludeContact: true }
): Promise<void> {
  await ensureLocalDbSeeded()

  const excludeContact = options.excludeContact !== false
  const { projects, categories, blog_posts, messages, settings, analytics, localPreferences } =
    backup.data

  const clearFirst = mode === 'replace'

  // 1. Categories
  onProgress?.(`Importing ${categories.length} categories...`)
  const cleanCategories: CategoryDoc[] = categories.map((cat, i) => ({
    id: sanitizeId(cat.id, 'cat', i),
    name: (cat.name || '').trim().slice(0, 100) || `Category ${i + 1}`,
    order: typeof cat.order === 'number' ? cat.order : i,
  }))
  await putManyRecords('categories', cleanCategories, clearFirst, 'categories')

  // 2. Projects
  onProgress?.(`Importing ${projects.length} projects...`)
  const cleanProjects: Project[] = projects.map((p, i) => {
    const id = sanitizeId(p.id, 'proj', i)
    const cleanTechs = (Array.isArray(p.technologies) ? p.technologies : [])
      .map((t) => String(t).trim().slice(0, 80))
      .filter(Boolean)
      .slice(0, 30)
    const cleanCats = (
      Array.isArray(p.categories) && p.categories.length
        ? p.categories
        : [p.category || 'Web Design']
    )
      .map((c) => String(c).trim().slice(0, 100))
      .filter(Boolean)
      .slice(0, 20)
    const primaryCat = (cleanCats[0] || String(p.category || '').trim() || 'Web Design').slice(
      0,
      100
    )
    const cleanLinks = (Array.isArray(p.customLinks) ? p.customLinks : [])
      .slice(0, 10)
      .map((l) => ({
        url: String(l?.url || '').trim().slice(0, 2048) || '#',
        labelEn: String(l?.labelEn || '').trim().slice(0, 120) || 'Visit Project',
        labelAr: String(l?.labelAr || '').trim().slice(0, 120) || 'زيارة المشروع',
      }))
    const cleanGallery = (Array.isArray(p.gallery) ? p.gallery : [])
      .map((g) => String(g).trim().slice(0, 1500000))
      .filter(Boolean)
      .slice(0, 12)

    return {
      id,
      nameEn: String(p.nameEn || '').trim().slice(0, 200) || 'Untitled Project',
      ...(typeof p.nameAr === 'string' ? { nameAr: p.nameAr.trim().slice(0, 200) } : {}),
      ...(typeof p.descEn === 'string' ? { descEn: p.descEn.trim().slice(0, 5000) } : {}),
      ...(typeof p.descAr === 'string' ? { descAr: p.descAr.trim().slice(0, 5000) } : {}),
      technologies: cleanTechs,
      category: primaryCat,
      categories: cleanCats.length > 0 ? cleanCats : [primaryCat],
      link: String(p.link || cleanLinks[0]?.url || '').trim().slice(0, 2048) || '#',
      customLinks: cleanLinks,
      mainImage:
        String(p.mainImage || '').trim().slice(0, 1500000) ||
        'https://picsum.photos/seed/project/800/600',
      gallery: cleanGallery,
      showOnHome: Boolean(p.showOnHome),
      createdAt: normalizeTimestamp(p.createdAt),
    }
  })
  await putManyRecords('projects', cleanProjects, clearFirst, 'projects')

  // 3. Blog Posts
  onProgress?.(`Importing ${blog_posts.length} blog posts...`)
  const cleanBlogs: BlogPost[] = blog_posts.map((post, i) => {
    const id = sanitizeId(post.id || post.slug, 'post', i)
    const slug = sanitizeSlug(post.slug || post.titleEn, id)
    const authorObj = post.author || {
      nameEn: 'Admin',
      nameAr: 'المسؤول',
      roleEn: 'Author',
      roleAr: 'كاتب',
    }
    const titleEn = String(post.titleEn || '').trim().slice(0, 250) || 'Untitled Post'
    const contentEn = String(post.contentEn || '').trim().slice(0, 100000) || '<p></p>'
    const categoryEn = String(post.categoryEn || '').trim().slice(0, 100) || 'General'
    const dateEn = String(post.dateEn || '').trim().slice(0, 60) || 'March 2026'
    const readTimeEn = String(post.readTimeEn || '').trim().slice(0, 30) || '5'

    return {
      id,
      slug,
      titleEn,
      titleAr: String(post.titleAr || '').trim().slice(0, 250) || titleEn,
      contentEn,
      contentAr: String(post.contentAr || '').trim().slice(0, 100000) || contentEn,
      categoryEn,
      categoryAr: String(post.categoryAr || '').trim().slice(0, 100) || categoryEn,
      dateEn,
      dateAr: String(post.dateAr || '').trim().slice(0, 60) || dateEn,
      readTimeEn,
      readTimeAr: String(post.readTimeAr || '').trim().slice(0, 30) || readTimeEn,
      image:
        String(post.image || '').trim().slice(0, 1500000) ||
        'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=800&auto=format&fit=crop',
      author: {
        nameEn: String(authorObj.nameEn || '').trim().slice(0, 120) || 'Admin',
        nameAr: String(authorObj.nameAr || authorObj.nameEn || '').trim().slice(0, 120) || 'المسؤول',
        roleEn: String(authorObj.roleEn || '').trim().slice(0, 120) || 'Author',
        roleAr: String(authorObj.roleAr || authorObj.roleEn || '').trim().slice(0, 120) || 'كاتب',
      },
      createdAt: normalizeTimestamp(post.createdAt),
    }
  })
  await putManyRecords('blog_posts', cleanBlogs, clearFirst, 'blog_posts')

  // 4. Messages (Skipped if excludeContact is enabled)
  if (!excludeContact) {
    onProgress?.(`Importing ${messages.length} messages...`)
    const cleanMessages: Message[] = messages.map((m, i) => {
      const id = sanitizeId(m.id, 'msg', i)
      const rawEmail = String(m.email || '').trim().slice(0, 160)
      return {
        id,
        name: String(m.name || '').trim().slice(0, 120) || 'Visitor',
        email: rawEmail.length >= 3 ? rawEmail : 'unknown@example.com',
        ...(typeof m.subject === 'string' && m.subject.trim()
          ? { subject: m.subject.trim().slice(0, 200) }
          : {}),
        message: String(m.message || '').trim().slice(0, 5000) || ' ',
        read: Boolean(m.read),
        createdAt: normalizeTimestamp(m.createdAt),
      }
    })
    await putManyRecords('messages', cleanMessages, clearFirst, 'messages')
  } else {
    onProgress?.('Preserving Contact section & messages...')
  }

  // 5. Settings (Preserve contactEmail & officeAddress when excludeContact is enabled)
  onProgress?.('Importing site settings...')
  const currentSettings = await getKv<SiteSettings>('settings')
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

  const rawContactEmail = (settings.contactEmail || '').trim().slice(0, 160)
  const mergedSettings: SiteSettings = {
    siteNameEn: (settings.siteNameEn || '').trim().slice(0, 120) || defaultSettings.siteNameEn,
    siteNameAr: (settings.siteNameAr || '').trim().slice(0, 120) || defaultSettings.siteNameAr,
    faviconUrl: (settings.faviconUrl || '/favicon.ico').trim().slice(0, 10000),
    socialLinks: cleanSocials,
    contactEmail: excludeContact
      ? currentSettings?.contactEmail || defaultSettings.contactEmail
      : rawContactEmail.length >= 3
        ? rawContactEmail
        : defaultSettings.contactEmail,
    officeAddressEn: excludeContact
      ? currentSettings?.officeAddressEn ?? defaultSettings.officeAddressEn
      : (settings.officeAddressEn || '').trim().slice(0, 500),
    officeAddressAr: excludeContact
      ? currentSettings?.officeAddressAr ?? defaultSettings.officeAddressAr
      : (settings.officeAddressAr || '').trim().slice(0, 500),
  }
  await setKv('settings', mergedSettings, 'settings')

  // 6. Analytics
  onProgress?.('Importing analytics...')
  const count = Math.max(0, Math.floor(Number(analytics?.pageViews) || 0))
  await setKv('analytics', { count }, 'analytics')

  // 7. Browser Preferences
  if (typeof window !== 'undefined' && localPreferences) {
    if (localPreferences.language === 'en' || localPreferences.language === 'ar') {
      localStorage.setItem('language', localPreferences.language)
    }
    if (
      localPreferences.theme === 'light' ||
      localPreferences.theme === 'dark' ||
      localPreferences.theme === 'system'
    ) {
      localStorage.setItem('theme', localPreferences.theme)
    }
    if (typeof localPreferences.notificationsEnabled === 'boolean') {
      localStorage.setItem(
        'sharksite_notifications_enabled',
        String(localPreferences.notificationsEnabled)
      )
    }
  }

  await setKv('seed_state', { seeded: true, seededAt: Date.now(), source: 'manual-import' })
  notifyCollectionChange('all')
  onProgress?.('Import complete!')
}

export async function reloadFromPublicBackup(excludeContact = true): Promise<boolean> {
  return applyPublicSeedFile(excludeContact)
}
