import {
  Unsubscribe,
  ensureLocalDbSeeded,
  getAllRecords,
  putRecord,
  putManyRecords,
  deleteRecord,
  onCollectionChange,
} from './local-db'

export interface BlogPost {
  id: string
  slug: string
  titleEn: string
  titleAr: string
  contentEn: string
  contentAr: string
  categoryEn: string
  categoryAr: string
  dateEn: string
  dateAr: string
  readTimeEn: string
  readTimeAr: string
  image: string
  author: {
    nameEn: string
    nameAr: string
    roleEn: string
    roleAr: string
  }
  createdAt: number
}

export const defaultBlogPosts: BlogPost[] = [
  {
    id: 'future-of-web-design-2026',
    slug: 'future-of-web-design-2026',
    titleEn: 'The Future of Web Design in 2026',
    titleAr: 'مستقبل تصميم الويب في عام 2026',
    contentEn:
      'Explore the emerging trends that are reshaping the digital landscape, from AI-driven interfaces to immersive 3D experiences.',
    contentAr:
      'استكشف الاتجاهات الناشئة التي تعيد تشكيل المشهد الرقمي، من الواجهات التي تعمل بالذكاء الاصطناعي إلى التجارب ثلاثية الأبعاد الغامرة.',
    categoryEn: 'Design Trends',
    categoryAr: 'اتجاهات التصميم',
    dateEn: 'March 15, 2026',
    dateAr: '15 مارس 2026',
    readTimeEn: '5',
    readTimeAr: '5',
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=800&auto=format&fit=crop',
    author: {
      nameEn: 'Muneeb Adil',
      nameAr: 'منيب عادل',
      roleEn: 'Founder & Lead Designer',
      roleAr: 'المؤسس وكبير المصممين',
    },
    createdAt: 1773532800000,
  },
  {
    id: 'mastering-nextjs-performance',
    slug: 'mastering-nextjs-performance',
    titleEn: 'Mastering Next.js Performance',
    titleAr: 'احتراف أداء Next.js',
    contentEn:
      'A deep dive into optimizing Next.js applications for lightning-fast load times and superior Core Web Vitals.',
    contentAr:
      'غوص عميق في تحسين تطبيقات Next.js للحصول على أوقات تحميل فائقة السرعة ومؤشرات أداء الويب الأساسية المتفوقة.',
    categoryEn: 'Development',
    categoryAr: 'تطوير',
    dateEn: 'March 10, 2026',
    dateAr: '10 مارس 2026',
    readTimeEn: '8',
    readTimeAr: '8',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
    author: {
      nameEn: 'Muneeb Adil',
      nameAr: 'منيب عادل',
      roleEn: 'Senior Developer',
      roleAr: 'مطور أول',
    },
    createdAt: 1773100800000,
  },
  {
    id: 'ui-ux-psychology',
    slug: 'ui-ux-psychology',
    titleEn: 'The Psychology of UI/UX',
    titleAr: 'سيكولوجية واجهة وتجربة المستخدم',
    contentEn:
      'Understanding how cognitive biases and human behavior influence user interaction and conversion rates.',
    contentAr:
      'فهم كيف تؤثر التحيزات المعرفية والسلوك البشري على تفاعل المستخدم ومعدلات التحويل.',
    categoryEn: 'UX Design',
    categoryAr: 'تصميم تجربة المستخدم',
    dateEn: 'March 5, 2026',
    dateAr: '5 مارس 2026',
    readTimeEn: '6',
    readTimeAr: '6',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
    author: {
      nameEn: 'Muneeb Adil',
      nameAr: 'منيب عادل',
      roleEn: 'UX Researcher',
      roleAr: 'باحث تجربة المستخدم',
    },
    createdAt: 1772668800000,
  },
]

function sanitizeSlug(raw: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)
  return cleaned || `post-${Date.now()}`
}

function mapBlogPost(data: BlogPost): BlogPost {
  const authorObj = data.author || { nameEn: '', nameAr: '', roleEn: '', roleAr: '' }
  return {
    id: data.id,
    slug: String(data.slug ?? data.id),
    titleEn: String(data.titleEn ?? ''),
    titleAr: String(data.titleAr ?? ''),
    contentEn: String(data.contentEn ?? ''),
    contentAr: String(data.contentAr ?? ''),
    categoryEn: String(data.categoryEn ?? ''),
    categoryAr: String(data.categoryAr ?? ''),
    dateEn: String(data.dateEn ?? ''),
    dateAr: String(data.dateAr ?? ''),
    readTimeEn: String(data.readTimeEn ?? ''),
    readTimeAr: String(data.readTimeAr ?? ''),
    image: String(data.image ?? ''),
    author: {
      nameEn: String(authorObj.nameEn ?? ''),
      nameAr: String(authorObj.nameAr ?? ''),
      roleEn: String(authorObj.roleEn ?? ''),
      roleAr: String(authorObj.roleAr ?? ''),
    },
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
  }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (typeof window === 'undefined') return []
  await ensureLocalDbSeeded()
  const items = await getAllRecords<BlogPost>('blog_posts')
  return items
    .map(mapBlogPost)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts()
  return posts.find((p) => p.slug === slug || p.id === slug) || null
}

export function subscribeToBlogPosts(
  onData: (posts: BlogPost[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  if (typeof window === 'undefined') return () => {}

  let active = true
  const load = async () => {
    try {
      const items = await getBlogPosts()
      if (active) onData(items)
    } catch (err) {
      if (active && onError) onError(err)
    }
  }

  load()
  const unsub = onCollectionChange('blog_posts', load)

  return () => {
    active = false
    unsub()
  }
}

export function subscribeToBlogPostBySlug(
  slug: string,
  onData: (post: BlogPost | null) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  if (typeof window === 'undefined') return () => {}

  let active = true
  const load = async () => {
    try {
      const post = await getBlogPostBySlug(slug)
      if (active) onData(post)
    } catch (err) {
      if (active && onError) onError(err)
    }
  }

  load()
  const unsub = onCollectionChange('blog_posts', load)

  return () => {
    active = false
    unsub()
  }
}

export async function saveBlogPost(
  post: Omit<BlogPost, 'id' | 'createdAt'> & { id?: string; createdAt?: number },
  isUpdate: boolean
): Promise<string> {
  await ensureLocalDbSeeded()
  const slug = sanitizeSlug(post.slug || post.titleEn)
  const id = post.id ? post.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128) : slug

  const record: BlogPost = {
    id,
    slug,
    titleEn: (post.titleEn || '').trim().slice(0, 250),
    titleAr: (post.titleAr || post.titleEn || '').trim().slice(0, 250),
    contentEn: (post.contentEn || '').trim().slice(0, 100000),
    contentAr: (post.contentAr || post.contentEn || '').trim().slice(0, 100000),
    categoryEn: (post.categoryEn || 'General').trim().slice(0, 100),
    categoryAr: (post.categoryAr || post.categoryEn || 'عام').trim().slice(0, 100),
    dateEn: (
      post.dateEn ||
      new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    )
      .trim()
      .slice(0, 60),
    dateAr: (post.dateAr || post.dateEn || '').trim().slice(0, 60),
    readTimeEn: (post.readTimeEn || '5').trim().slice(0, 30),
    readTimeAr: (post.readTimeAr || post.readTimeEn || '5').trim().slice(0, 30),
    image: (
      post.image ||
      'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=800&auto=format&fit=crop'
    )
      .trim()
      .slice(0, 1500000),
    author: {
      nameEn: (post.author?.nameEn || 'Admin').trim().slice(0, 120),
      nameAr: (post.author?.nameAr || post.author?.nameEn || 'المسؤول').trim().slice(0, 120),
      roleEn: (post.author?.roleEn || 'Author').trim().slice(0, 120),
      roleAr: (post.author?.roleAr || post.author?.roleEn || 'كاتب').trim().slice(0, 120),
    },
    createdAt: isUpdate && typeof post.createdAt === 'number' ? post.createdAt : Date.now(),
  }

  await putRecord('blog_posts', record, 'blog_posts')
  return id
}

export async function deleteBlogPost(id: string): Promise<void> {
  await deleteRecord('blog_posts', id, 'blog_posts')
}

export async function seedBlogPosts(posts: BlogPost[]): Promise<void> {
  const docs = posts.map((post) => ({
    ...post,
    id: sanitizeSlug(post.id || post.slug),
    slug: sanitizeSlug(post.slug),
    createdAt: post.createdAt || Date.now(),
  }))
  await putManyRecords('blog_posts', docs, false, 'blog_posts')
}

export const saveBlogPostToFirestore = saveBlogPost
export const deleteBlogPostFromFirestore = deleteBlogPost
