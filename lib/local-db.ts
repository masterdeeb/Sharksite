'use client'

export type Unsubscribe = () => void

export const PUBLIC_SEED_PATH = '/sharksite-full-backup-2026-11-21.json'

const DB_NAME = 'sharksite_local_db'
const DB_VERSION = 1

export type StoreName =
  | 'projects'
  | 'categories'
  | 'blog_posts'
  | 'messages'
  | 'kv'

export type LogicalCollection =
  | 'projects'
  | 'categories'
  | 'blog_posts'
  | 'messages'
  | 'settings'
  | 'analytics'
  | 'admin_config'

const CHANNEL_NAME = 'sharksite_local_db_sync'
const EVENT_NAME = 'sharksite_local_db_change'

let dbPromise: Promise<IDBDatabase> | null = null
let seedPromise: Promise<void> | null = null
let broadcastChannel: BroadcastChannel | null = null

const storeListeners = new Map<LogicalCollection, Set<() => void>>()

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return null
  if (!broadcastChannel) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME)
    broadcastChannel.onmessage = (event) => {
      const target = event?.data?.collection as LogicalCollection | 'all' | undefined
      if (!target) return
      if (target === 'all') {
        storeListeners.forEach((set) => set.forEach((cb) => cb()))
      } else {
        storeListeners.get(target)?.forEach((cb) => cb())
      }
    }
  }
  return broadcastChannel
}

export function notifyCollectionChange(collection: LogicalCollection | 'all'): void {
  if (typeof window === 'undefined') return

  if (collection === 'all') {
    storeListeners.forEach((set) => set.forEach((cb) => cb()))
  } else {
    storeListeners.get(collection)?.forEach((cb) => cb())
  }

  try {
    getBroadcastChannel()?.postMessage({ collection })
  } catch {
    // Ignore BroadcastChannel errors
  }

  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { collection } }))
  } catch {
    // Ignore CustomEvent errors
  }
}

export function onCollectionChange(
  collection: LogicalCollection,
  callback: () => void
): Unsubscribe {
  if (typeof window === 'undefined') return () => {}

  let set = storeListeners.get(collection)
  if (!set) {
    set = new Set()
    storeListeners.set(collection, set)
  }
  set.add(callback)
  getBroadcastChannel()

  return () => {
    set?.delete(callback)
  }
}

export function openLocalDb(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is only available in the browser.'))
  }

  if (dbPromise) return dbPromise

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('blog_posts')) {
        db.createObjectStore('blog_posts', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('messages')) {
        db.createObjectStore('messages', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('kv')) {
        db.createObjectStore('kv', { keyPath: 'key' })
      }
    }

    request.onsuccess = () => {
      const db = request.result
      db.onversionchange = () => {
        db.close()
        dbPromise = null
      }
      resolve(db)
    }

    request.onerror = () => {
      dbPromise = null
      reject(request.error || new Error('Failed to open local IndexedDB database.'))
    }
  })

  return dbPromise
}

export async function getAllRecords<T>(storeName: Exclude<StoreName, 'kv'>): Promise<T[]> {
  if (typeof window === 'undefined') return []
  const db = await openLocalDb()
  return new Promise<T[]>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const req = store.getAll()
    req.onsuccess = () => resolve((req.result as T[]) || [])
    req.onerror = () => reject(req.error)
  })
}

export async function getRecordById<T>(
  storeName: Exclude<StoreName, 'kv'>,
  id: string
): Promise<T | null> {
  if (typeof window === 'undefined') return null
  const db = await openLocalDb()
  return new Promise<T | null>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const req = store.get(id)
    req.onsuccess = () => resolve((req.result as T) ?? null)
    req.onerror = () => reject(req.error)
  })
}

export async function putRecord<T extends { id: string }>(
  storeName: Exclude<StoreName, 'kv'>,
  record: T,
  collectionEvent?: LogicalCollection
): Promise<void> {
  if (typeof window === 'undefined') return
  const db = await openLocalDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).put(record)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  notifyCollectionChange(collectionEvent || storeName)
}

export async function putManyRecords<T extends { id: string }>(
  storeName: Exclude<StoreName, 'kv'>,
  records: T[],
  clearFirst = false,
  collectionEvent?: LogicalCollection
): Promise<void> {
  if (typeof window === 'undefined') return
  const db = await openLocalDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    if (clearFirst) {
      store.clear()
    }
    for (const rec of records) {
      store.put(rec)
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  notifyCollectionChange(collectionEvent || storeName)
}

export async function deleteRecord(
  storeName: Exclude<StoreName, 'kv'>,
  id: string,
  collectionEvent?: LogicalCollection
): Promise<void> {
  if (typeof window === 'undefined') return
  const db = await openLocalDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  notifyCollectionChange(collectionEvent || storeName)
}

export async function clearStore(
  storeName: Exclude<StoreName, 'kv'>,
  collectionEvent?: LogicalCollection
): Promise<void> {
  if (typeof window === 'undefined') return
  const db = await openLocalDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  notifyCollectionChange(collectionEvent || storeName)
}

export async function getKv<T>(key: string): Promise<T | null> {
  if (typeof window === 'undefined') return null
  const db = await openLocalDb()
  return new Promise<T | null>((resolve, reject) => {
    const tx = db.transaction('kv', 'readonly')
    const req = tx.objectStore('kv').get(key)
    req.onsuccess = () => {
      const row = req.result as { key: string; value: T } | undefined
      resolve(row ? row.value : null)
    }
    req.onerror = () => reject(req.error)
  })
}

export async function setKv<T>(
  key: string,
  value: T,
  collectionEvent?: LogicalCollection
): Promise<void> {
  if (typeof window === 'undefined') return
  const db = await openLocalDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('kv', 'readwrite')
    tx.objectStore('kv').put({ key, value })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  if (collectionEvent) {
    notifyCollectionChange(collectionEvent)
  }
}

export const SITE_CONTACT_DEFAULTS = {
  contactEmail: 'ahmedbeby2002@gmail.com',
  officeAddressEn: '123 Innovation Drive, Tech City, TC 90210',
  officeAddressAr: '123 شارع الابتكار، مدينة التقنية، TC 90210',
}

function normalizeSeedProject(raw: Record<string, unknown>, index: number) {
  const id = String(raw.id || `proj_${Date.now()}_${index}`)
  const category = String(raw.category || (Array.isArray(raw.categories) && raw.categories[0]) || 'Web Design')
  const categories = Array.isArray(raw.categories) && raw.categories.length > 0
    ? raw.categories.map(String)
    : [category]
  const customLinks = Array.isArray(raw.customLinks)
    ? raw.customLinks.map((l: Record<string, unknown>) => ({
        url: String(l?.url || '#'),
        labelEn: String(l?.labelEn || 'Visit Project'),
        labelAr: String(l?.labelAr || 'زيارة المشروع'),
      }))
    : []
  const descEn = typeof raw.descEn === 'string'
    ? raw.descEn
    : typeof raw.descriptionEn === 'string'
      ? raw.descriptionEn
      : ''
  const descAr = typeof raw.descAr === 'string'
    ? raw.descAr
    : typeof raw.descriptionAr === 'string'
      ? raw.descriptionAr
      : ''

  return {
    id,
    nameEn: String(raw.nameEn || raw.name || 'Untitled Project'),
    ...(typeof raw.nameAr === 'string' ? { nameAr: raw.nameAr } : {}),
    descEn,
    descAr,
    technologies: Array.isArray(raw.technologies) ? raw.technologies.map(String) : [],
    category,
    categories,
    link: String(raw.link || customLinks[0]?.url || '#'),
    customLinks,
    mainImage: String(raw.mainImage || ''),
    gallery: Array.isArray(raw.gallery) ? raw.gallery.map(String) : [],
    showOnHome: raw.showOnHome !== undefined ? Boolean(raw.showOnHome) : true,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now() - index * 1000,
  }
}

function normalizeSeedBlogPost(raw: Record<string, unknown>, index: number) {
  const id = String(raw.id || raw.slug || `post_${Date.now()}_${index}`)
  const slug = String(raw.slug || id)
  const authorObj = (raw.author as Record<string, unknown>) || {}
  return {
    id,
    slug,
    titleEn: String(raw.titleEn || ''),
    titleAr: String(raw.titleAr || raw.titleEn || ''),
    contentEn: String(raw.contentEn || ''),
    contentAr: String(raw.contentAr || raw.contentEn || ''),
    categoryEn: String(raw.categoryEn || 'General'),
    categoryAr: String(raw.categoryAr || raw.categoryEn || 'عام'),
    dateEn: String(raw.dateEn || ''),
    dateAr: String(raw.dateAr || raw.dateEn || ''),
    readTimeEn: String(raw.readTimeEn || '5'),
    readTimeAr: String(raw.readTimeAr || raw.readTimeEn || '5'),
    image: String(raw.image || ''),
    author: {
      nameEn: String(authorObj.nameEn || 'Admin'),
      nameAr: String(authorObj.nameAr || authorObj.nameEn || 'المسؤول'),
      roleEn: String(authorObj.roleEn || 'Author'),
      roleAr: String(authorObj.roleAr || authorObj.roleEn || 'كاتب'),
    },
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now() - index * 1000,
  }
}

export async function applyPublicSeedFile(excludeContact = true): Promise<boolean> {
  if (typeof window === 'undefined') return false

  try {
    const res = await fetch(PUBLIC_SEED_PATH, { cache: 'no-store' })
    if (!res.ok) return false

    const parsed = (await res.json()) as Record<string, unknown>
    const dataObj =
      parsed.data && typeof parsed.data === 'object' && !Array.isArray(parsed.data)
        ? (parsed.data as Record<string, unknown>)
        : parsed

    const rawProjects = Array.isArray(dataObj.projects) ? (dataObj.projects as Record<string, unknown>[]) : []
    const rawCategories = Array.isArray(dataObj.categories) ? (dataObj.categories as Record<string, unknown>[]) : []
    const rawBlogs = Array.isArray(dataObj.blog_posts) ? (dataObj.blog_posts as Record<string, unknown>[]) : []
    const rawMessages = Array.isArray(dataObj.messages) ? (dataObj.messages as Record<string, unknown>[]) : []
    const rawSettings =
      dataObj.settings && typeof dataObj.settings === 'object' && !Array.isArray(dataObj.settings)
        ? (dataObj.settings as Record<string, unknown>)
        : null
    const rawAnalytics =
      dataObj.analytics && typeof dataObj.analytics === 'object' && !Array.isArray(dataObj.analytics)
        ? (dataObj.analytics as Record<string, unknown>)
        : null

    const projects = rawProjects.map((p, idx) => normalizeSeedProject(p, idx))
    const categories = rawCategories.map((c, idx) => ({
      id: String(c.id || `cat_${idx}`),
      name: String(c.name || `Category ${idx + 1}`),
      order: typeof c.order === 'number' ? c.order : idx,
    }))
    const blogPosts = rawBlogs.map((b, idx) => normalizeSeedBlogPost(b, idx))

    const existingSettings = await getKv<Record<string, unknown>>('settings')

    const db = await openLocalDb()
    await new Promise<void>((resolve, reject) => {
      const storeNames: StoreName[] = excludeContact
        ? ['projects', 'categories', 'blog_posts', 'kv']
        : ['projects', 'categories', 'blog_posts', 'messages', 'kv']

      const tx = db.transaction(storeNames, 'readwrite')

      const projStore = tx.objectStore('projects')
      projStore.clear()
      for (const p of projects) projStore.put(p)

      const catStore = tx.objectStore('categories')
      catStore.clear()
      for (const c of categories) catStore.put(c)

      const blogStore = tx.objectStore('blog_posts')
      blogStore.clear()
      for (const b of blogPosts) blogStore.put(b)

      if (!excludeContact) {
        const msgStore = tx.objectStore('messages')
        msgStore.clear()
        for (let i = 0; i < rawMessages.length; i++) {
          const m = rawMessages[i]
          msgStore.put({
            id: String(m.id || `msg_${Date.now()}_${i}`),
            name: String(m.name || ''),
            email: String(m.email || ''),
            ...(typeof m.subject === 'string' ? { subject: m.subject } : {}),
            message: String(m.message || ''),
            createdAt: typeof m.createdAt === 'number' ? m.createdAt : Date.now(),
            read: Boolean(m.read),
          })
        }
      }

      const kvStore = tx.objectStore('kv')
      if (rawSettings) {
        const nextSettings = {
          siteNameEn: String(rawSettings.siteNameEn || 'SharkSite'),
          siteNameAr: String(rawSettings.siteNameAr || 'شارك سايت'),
          faviconUrl: String(rawSettings.faviconUrl || '/favicon.ico'),
          socialLinks:
            rawSettings.socialLinks && typeof rawSettings.socialLinks === 'object'
              ? rawSettings.socialLinks
              : {},
          contactEmail: excludeContact
            ? String(existingSettings?.contactEmail || SITE_CONTACT_DEFAULTS.contactEmail)
            : String(rawSettings.contactEmail || SITE_CONTACT_DEFAULTS.contactEmail),
          officeAddressEn: excludeContact
            ? String(existingSettings?.officeAddressEn || SITE_CONTACT_DEFAULTS.officeAddressEn)
            : String(rawSettings.officeAddressEn || SITE_CONTACT_DEFAULTS.officeAddressEn),
          officeAddressAr: excludeContact
            ? String(existingSettings?.officeAddressAr || SITE_CONTACT_DEFAULTS.officeAddressAr)
            : String(rawSettings.officeAddressAr || SITE_CONTACT_DEFAULTS.officeAddressAr),
        }
        kvStore.put({ key: 'settings', value: nextSettings })
      }

      if (rawAnalytics) {
        const pageViews = Math.max(0, Math.floor(Number(rawAnalytics.pageViews ?? rawAnalytics.count ?? 0) || 0))
        kvStore.put({ key: 'analytics', value: { count: pageViews } })
      }

      kvStore.put({
        key: 'seed_state',
        value: {
          seeded: true,
          seededAt: Date.now(),
          source: PUBLIC_SEED_PATH,
          excludedContact: excludeContact,
        },
      })

      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })

    notifyCollectionChange('all')
    return true
  } catch (err) {
    console.error('Failed to seed local database from public JSON:', err)
    return false
  }
}

export async function ensureLocalDbSeeded(): Promise<void> {
  if (typeof window === 'undefined') return
  if (seedPromise) return seedPromise

  seedPromise = (async () => {
    try {
      const seedState = await getKv<{ seeded?: boolean }>('seed_state')
      if (seedState?.seeded) return

      // Check if user already created local records before seed flag existed
      const [existingProjects, existingPosts] = await Promise.all([
        getAllRecords('projects'),
        getAllRecords('blog_posts'),
      ])
      if (existingProjects.length > 0 || existingPosts.length > 0) {
        await setKv('seed_state', { seeded: true, seededAt: Date.now(), source: 'existing' })
        return
      }

      await applyPublicSeedFile(true)
    } catch (err) {
      console.error('ensureLocalDbSeeded error:', err)
    }
  })()

  return seedPromise
}
