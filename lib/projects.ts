import {
  Unsubscribe,
  ensureLocalDbSeeded,
  getAllRecords,
  putRecord,
  putManyRecords,
  deleteRecord,
  onCollectionChange,
} from './local-db'

export type CustomLink = {
  url: string
  labelEn: string
  labelAr?: string
}

export type Project = {
  id: string
  nameEn: string
  nameAr?: string
  descEn?: string
  descAr?: string
  technologies: string[]
  category: string
  categories?: string[]
  link: string
  customLinks?: CustomLink[]
  mainImage: string
  gallery: string[]
  showOnHome?: boolean
  createdAt?: number
}

export type CategoryDoc = {
  id: string
  name: string
  order: number
}

export const defaultCategories = [
  'SaaS Product',
  'Web Design',
  'Marketing Site',
  'Mobile App',
  'Brand Identity',
  'Web Application',
]

function sanitizeId(raw: string, prefix: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120)
  return cleaned || `${prefix}_${Date.now()}`
}

function mapProjectRecord(data: Project): Project {
  return {
    id: data.id,
    nameEn: String(data.nameEn ?? ''),
    ...(typeof data.nameAr === 'string' ? { nameAr: data.nameAr } : {}),
    ...(typeof data.descEn === 'string' ? { descEn: data.descEn } : {}),
    ...(typeof data.descAr === 'string' ? { descAr: data.descAr } : {}),
    technologies: Array.isArray(data.technologies) ? data.technologies.map(String) : [],
    category: String(data.category ?? ''),
    ...(Array.isArray(data.categories) ? { categories: data.categories.map(String) } : {}),
    link: String(data.link ?? '#'),
    ...(Array.isArray(data.customLinks) ? { customLinks: data.customLinks } : {}),
    mainImage: String(data.mainImage ?? ''),
    gallery: Array.isArray(data.gallery) ? data.gallery.map(String) : [],
    showOnHome: Boolean(data.showOnHome),
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
  }
}

export async function getProjects(): Promise<Project[]> {
  if (typeof window === 'undefined') return []
  await ensureLocalDbSeeded()
  const items = await getAllRecords<Project>('projects')
  return items
    .map(mapProjectRecord)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export function subscribeToProjects(
  onData: (projects: Project[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  if (typeof window === 'undefined') return () => {}

  let active = true
  const load = async () => {
    try {
      const items = await getProjects()
      if (active) onData(items)
    } catch (err) {
      if (active && onError) onError(err)
    }
  }

  load()
  const unsub = onCollectionChange('projects', load)

  return () => {
    active = false
    unsub()
  }
}

export async function saveProject(
  project: Omit<Project, 'id'> & { id?: string },
  isUpdate: boolean
): Promise<string> {
  await ensureLocalDbSeeded()
  const id = project.id
    ? sanitizeId(project.id, 'proj')
    : `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

  const cleanTechnologies = (project.technologies || [])
    .map((t) => t.trim().slice(0, 80))
    .filter(Boolean)
    .slice(0, 30)
  const cleanCategories = (project.categories?.length ? project.categories : [project.category])
    .map((c) => c.trim().slice(0, 100))
    .filter(Boolean)
    .slice(0, 20)
  const primaryCategory = (cleanCategories[0] || project.category || 'Web Design').slice(0, 100)
  const cleanCustomLinks = (project.customLinks || []).slice(0, 10).map((l) => ({
    url: String(l.url || '').slice(0, 2048),
    labelEn: String(l.labelEn || 'Visit Project').slice(0, 120),
    labelAr: String(l.labelAr || 'زيارة المشروع').slice(0, 120),
  }))
  const cleanGallery = (project.gallery || [])
    .map((g) => g.slice(0, 1500000))
    .filter(Boolean)
    .slice(0, 12)

  const record: Project = {
    id,
    nameEn: (project.nameEn || '').trim().slice(0, 200),
    ...(project.nameAr !== undefined ? { nameAr: project.nameAr.trim().slice(0, 200) } : {}),
    ...(project.descEn !== undefined ? { descEn: project.descEn.trim().slice(0, 5000) } : {}),
    ...(project.descAr !== undefined ? { descAr: project.descAr.trim().slice(0, 5000) } : {}),
    technologies: cleanTechnologies,
    category: primaryCategory,
    categories: cleanCategories,
    link: (project.link || cleanCustomLinks[0]?.url || '#').trim().slice(0, 2048),
    customLinks: cleanCustomLinks,
    mainImage: (project.mainImage || '').slice(0, 1500000),
    gallery: cleanGallery,
    showOnHome: Boolean(project.showOnHome),
    createdAt: isUpdate && typeof project.createdAt === 'number' ? project.createdAt : Date.now(),
  }

  await putRecord('projects', record, 'projects')
  return id
}

export async function deleteProject(id: string): Promise<void> {
  await deleteRecord('projects', id, 'projects')
}

export async function getCategoryDocs(): Promise<CategoryDoc[]> {
  if (typeof window === 'undefined') return []
  await ensureLocalDbSeeded()
  const items = await getAllRecords<CategoryDoc>('categories')
  return items
    .map((c, idx) => ({
      id: c.id,
      name: String(c.name ?? ''),
      order: typeof c.order === 'number' ? c.order : idx,
    }))
    .sort((a, b) => a.order - b.order)
}

export function subscribeToCategories(
  onData: (categories: CategoryDoc[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  if (typeof window === 'undefined') return () => {}

  let active = true
  const load = async () => {
    try {
      const items = await getCategoryDocs()
      if (active) onData(items)
    } catch (err) {
      if (active && onError) onError(err)
    }
  }

  load()
  const unsub = onCollectionChange('categories', load)

  return () => {
    active = false
    unsub()
  }
}

export async function getCategories(): Promise<string[]> {
  const docs = await getCategoryDocs()
  return docs.length > 0 ? docs.map((c) => c.name) : defaultCategories
}

export async function addCategory(name: string, order: number): Promise<void> {
  await ensureLocalDbSeeded()
  const cleanName = name.trim().slice(0, 100)
  const id = sanitizeId(`cat_${cleanName.toLowerCase()}_${Date.now()}`, 'cat')
  await putRecord('categories', { id, name: cleanName, order }, 'categories')
}

export async function updateCategory(id: string, name: string): Promise<void> {
  const existing = await getCategoryDocs()
  const target = existing.find((c) => c.id === id)
  await putRecord(
    'categories',
    {
      id,
      name: name.trim().slice(0, 100),
      order: target?.order ?? 0,
    },
    'categories'
  )
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteRecord('categories', id, 'categories')
}

export async function seedDefaultCategories(): Promise<void> {
  const docs: CategoryDoc[] = defaultCategories.map((name, idx) => ({
    id: sanitizeId(`cat_${name.toLowerCase()}`, 'cat'),
    name,
    order: idx,
  }))
  await putManyRecords('categories', docs, false, 'categories')
}

export async function seedInitialProjects(): Promise<void> {
  const docs: Project[] = initialProjects.map((proj) => ({
    ...proj,
    id: sanitizeId(`proj_${proj.id}`, 'proj'),
    categories: proj.categories || [proj.category],
    customLinks: proj.customLinks || [
      { url: proj.link, labelEn: 'Visit Project', labelAr: 'زيارة المشروع' },
    ],
    showOnHome: true,
    createdAt: Date.now(),
  }))
  await putManyRecords('projects', docs, false, 'projects')
}

// Legacy aliases kept for compatibility
export const saveProjectToFirestore = saveProject
export const deleteProjectFromFirestore = deleteProject
export const addCategoryToFirestore = addCategory
export const updateCategoryInFirestore = updateCategory
export const deleteCategoryFromFirestore = deleteCategory

export const initialProjects: Project[] = [
  {
    id: '1',
    nameEn: 'Fintech Dashboard',
    nameAr: 'لوحة تحكم مالية',
    category: 'SaaS Product',
    descEn:
      'A comprehensive financial analytics platform with real-time data visualization and AI-driven insights. Designed to help users track their investments, analyze market trends, and make informed financial decisions with ease.',
    descAr:
      'منصة تحليلات مالية شاملة مع تصور للبيانات في الوقت الفعلي ورؤى مدعومة بالذكاء الاصطناعي. مصممة لمساعدة المستخدمين على تتبع استثماراتهم وتحليل اتجاهات السوق واتخاذ قرارات مالية مستنيرة بسهولة.',
    mainImage: 'https://picsum.photos/seed/fintech/800/600',
    gallery: [
      'https://picsum.photos/seed/fintech1/800/600',
      'https://picsum.photos/seed/fintech2/800/600',
      'https://picsum.photos/seed/fintech3/800/600',
    ],
    technologies: ['Next.js', 'Tailwind', 'Recharts'],
    link: '#',
  },
  {
    id: '2',
    nameEn: 'Luxe E-commerce',
    nameAr: 'متجر إلكتروني فاخر',
    category: 'Web Design',
    descEn:
      "A premium shopping experience for a luxury fashion brand, featuring immersive product reveals and seamless checkout. The platform focuses on high-quality imagery and smooth animations to reflect the brand's elegance.",
    descAr:
      'تجربة تسوق مميزة لعلامة تجارية فاخرة للأزياء، تتميز بعرض منتجات غامر وعملية دفع سلسة. تركز المنصة على الصور عالية الجودة والرسوم المتحركة السلسة لتعكس أناقة العلامة التجارية.',
    mainImage: 'https://picsum.photos/seed/fashion/800/600',
    gallery: [
      'https://picsum.photos/seed/fashion1/800/600',
      'https://picsum.photos/seed/fashion2/800/600',
      'https://picsum.photos/seed/fashion3/800/600',
    ],
    technologies: ['Shopify', 'Framer Motion', 'Stripe'],
    link: '#',
  },
  {
    id: '3',
    nameEn: 'AI Startup Landing',
    nameAr: 'صفحة هبوط لشركة ذكاء اصطناعي',
    category: 'Marketing Site',
    descEn:
      'High-conversion landing page for a generative AI startup, utilizing 3D elements and scroll-triggered animations. Built to capture leads and showcase the power of their AI models through interactive demos.',
    descAr:
      'صفحة هبوط عالية التحويل لشركة ناشئة في مجال الذكاء الاصطناعي التوليدي، تستخدم عناصر ثلاثية الأبعاد ورسوم متحركة. تم بناؤها لجذب العملاء المحتملين وعرض قوة نماذج الذكاء الاصطناعي الخاصة بهم من خلال العروض التفاعلية.',
    mainImage: 'https://picsum.photos/seed/ai/800/600',
    gallery: [
      'https://picsum.photos/seed/ai1/800/600',
      'https://picsum.photos/seed/ai2/800/600',
      'https://picsum.photos/seed/ai3/800/600',
    ],
    technologies: ['React', 'Three.js', 'GSAP'],
    link: '#',
  },
  {
    id: '4',
    nameEn: 'Travel Companion',
    nameAr: 'تطبيق رفيق السفر',
    category: 'Mobile App',
    descEn:
      'A cross-platform mobile application for travel planning, booking, and local discovery. Features include offline maps, real-time weather updates, and personalized itinerary suggestions based on user preferences.',
    descAr:
      'تطبيق جوال متعدد المنصات لتخطيط السفر والحجز واكتشاف الأماكن المحلية. تشمل الميزات خرائط غير متصلة بالإنترنت وتحديثات الطقس في الوقت الفعلي واقتراحات مسارات مخصصة بناءً على تفضيلات المستخدم.',
    mainImage: 'https://picsum.photos/seed/travel/800/600',
    gallery: [
      'https://picsum.photos/seed/travel1/800/600',
      'https://picsum.photos/seed/travel2/800/600',
      'https://picsum.photos/seed/travel3/800/600',
    ],
    technologies: ['React Native', 'Expo', 'Maps API'],
    link: '#',
  },
  {
    id: '5',
    nameEn: 'Health & Wellness',
    nameAr: 'منصة الصحة والعافية',
    category: 'Brand Identity',
    descEn:
      'Complete digital rebranding for a wellness platform, including logo design, color system, and web interface. The goal was to create a calming, trustworthy digital environment for users seeking mental health resources.',
    descAr:
      'إعادة تصميم العلامة التجارية الرقمية بالكامل لمنصة صحية، بما في ذلك تصميم الشعار ونظام الألوان وواجهة الويب. كان الهدف هو إنشاء بيئة رقمية مهدئة وجديرة بالثقة للمستخدمين الذين يبحثون عن موارد الصحة العقلية.',
    mainImage: 'https://picsum.photos/seed/health/800/600',
    gallery: [
      'https://picsum.photos/seed/health1/800/600',
      'https://picsum.photos/seed/health2/800/600',
      'https://picsum.photos/seed/health3/800/600',
    ],
    technologies: ['Branding', 'UI/UX', 'Webflow'],
    link: '#',
  },
  {
    id: '6',
    nameEn: 'Real Estate Portal',
    nameAr: 'بوابة العقارات',
    category: 'Web Application',
    descEn:
      'A feature-rich property listing platform with virtual tours, mortgage calculators, and agent dashboards. Designed to streamline the property buying and renting process for both clients and real estate agents.',
    descAr:
      'منصة غنية بالميزات لعرض العقارات مع جولات افتراضية وحاسبات عقارية ولوحات تحكم للوكلاء. مصممة لتبسيط عملية شراء واستئجار العقارات لكل من العملاء ووكلاء العقارات.',
    mainImage: 'https://picsum.photos/seed/realestate/800/600',
    gallery: [
      'https://picsum.photos/seed/realestate1/800/600',
      'https://picsum.photos/seed/realestate2/800/600',
      'https://picsum.photos/seed/realestate3/800/600',
    ],
    technologies: ['Next.js', 'IndexedDB', 'Tailwind'],
    link: '#',
  },
]
