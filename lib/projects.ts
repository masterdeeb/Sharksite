import { supabase, isSupabaseConfigured } from './supabase'

export type CustomLink = {
  url: string;
  labelEn: string;
  labelAr?: string;
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

export const defaultCategories = [
  "SaaS Product",
  "Web Design",
  "Marketing Site",
  "Mobile App",
  "Brand Identity",
  "Web Application"
]

export const getProjects = async (): Promise<Project[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('projects').select('*').order('createdAt', { ascending: false })
      if (error) throw error
      if (data && data.length > 0) return data as Project[]
    } catch (error) {
      console.error('Error fetching projects from Supabase:', error)
    }
  }
  
  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('sharksite_projects')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {}
    }
  }
  
  return initialProjects
}

export const saveProjectsToSupabase = async (projects: Project[]) => {
  if (isSupabaseConfigured && supabase) {
    try {
      // Upsert projects
      const { error } = await supabase.from('projects').upsert(projects)
      if (error) throw error
    } catch (error) {
      console.error('Error saving projects to Supabase:', error)
    }
  }
}

export const getCategories = async (): Promise<string[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('categories').select('name')
      if (error) throw error
      if (data && data.length > 0) return data.map(c => c.name)
    } catch (error) {
      console.error('Error fetching categories from Supabase:', error)
    }
  }
  
  if (typeof window !== 'undefined') {
    const storedCats = localStorage.getItem('sharksite_categories')
    if (storedCats) {
      try {
        return JSON.parse(storedCats)
      } catch (e) {}
    }
  }
  
  return defaultCategories
}

export const saveCategoriesToSupabase = async (categories: string[]) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('categories').upsert(categories.map(name => ({ name })))
      if (error) throw error
    } catch (error) {
      console.error('Error saving categories to Supabase:', error)
    }
  }
}

export const initialProjects: Project[] = [
  {
    id: '1',
    nameEn: "Fintech Dashboard",
    nameAr: "لوحة تحكم مالية",
    category: "SaaS Product",
    descEn: "A comprehensive financial analytics platform with real-time data visualization and AI-driven insights. Designed to help users track their investments, analyze market trends, and make informed financial decisions with ease.",
    descAr: "منصة تحليلات مالية شاملة مع تصور للبيانات في الوقت الفعلي ورؤى مدعومة بالذكاء الاصطناعي. مصممة لمساعدة المستخدمين على تتبع استثماراتهم وتحليل اتجاهات السوق واتخاذ قرارات مالية مستنيرة بسهولة.",
    mainImage: "https://picsum.photos/seed/fintech/800/600",
    gallery: [
      "https://picsum.photos/seed/fintech1/800/600",
      "https://picsum.photos/seed/fintech2/800/600",
      "https://picsum.photos/seed/fintech3/800/600"
    ],
    technologies: ["Next.js", "Tailwind", "Recharts"],
    link: "#"
  },
  {
    id: '2',
    nameEn: "Luxe E-commerce",
    nameAr: "متجر إلكتروني فاخر",
    category: "Web Design",
    descEn: "A premium shopping experience for a luxury fashion brand, featuring immersive product reveals and seamless checkout. The platform focuses on high-quality imagery and smooth animations to reflect the brand's elegance.",
    descAr: "تجربة تسوق مميزة لعلامة تجارية فاخرة للأزياء، تتميز بعرض منتجات غامر وعملية دفع سلسة. تركز المنصة على الصور عالية الجودة والرسوم المتحركة السلسة لتعكس أناقة العلامة التجارية.",
    mainImage: "https://picsum.photos/seed/fashion/800/600",
    gallery: [
      "https://picsum.photos/seed/fashion1/800/600",
      "https://picsum.photos/seed/fashion2/800/600",
      "https://picsum.photos/seed/fashion3/800/600"
    ],
    technologies: ["Shopify", "Framer Motion", "Stripe"],
    link: "#"
  },
  {
    id: '3',
    nameEn: "AI Startup Landing",
    nameAr: "صفحة هبوط لشركة ذكاء اصطناعي",
    category: "Marketing Site",
    descEn: "High-conversion landing page for a generative AI startup, utilizing 3D elements and scroll-triggered animations. Built to capture leads and showcase the power of their AI models through interactive demos.",
    descAr: "صفحة هبوط عالية التحويل لشركة ناشئة في مجال الذكاء الاصطناعي التوليدي، تستخدم عناصر ثلاثية الأبعاد ورسوم متحركة. تم بناؤها لجذب العملاء المحتملين وعرض قوة نماذج الذكاء الاصطناعي الخاصة بهم من خلال العروض التفاعلية.",
    mainImage: "https://picsum.photos/seed/ai/800/600",
    gallery: [
      "https://picsum.photos/seed/ai1/800/600",
      "https://picsum.photos/seed/ai2/800/600",
      "https://picsum.photos/seed/ai3/800/600"
    ],
    technologies: ["React", "Three.js", "GSAP"],
    link: "#"
  },
  {
    id: '4',
    nameEn: "Travel Companion",
    nameAr: "تطبيق رفيق السفر",
    category: "Mobile App",
    descEn: "A cross-platform mobile application for travel planning, booking, and local discovery. Features include offline maps, real-time weather updates, and personalized itinerary suggestions based on user preferences.",
    descAr: "تطبيق جوال متعدد المنصات لتخطيط السفر والحجز واكتشاف الأماكن المحلية. تشمل الميزات خرائط غير متصلة بالإنترنت وتحديثات الطقس في الوقت الفعلي واقتراحات مسارات مخصصة بناءً على تفضيلات المستخدم.",
    mainImage: "https://picsum.photos/seed/travel/800/600",
    gallery: [
      "https://picsum.photos/seed/travel1/800/600",
      "https://picsum.photos/seed/travel2/800/600",
      "https://picsum.photos/seed/travel3/800/600"
    ],
    technologies: ["React Native", "Expo", "Maps API"],
    link: "#"
  },
  {
    id: '5',
    nameEn: "Health & Wellness",
    nameAr: "منصة الصحة والعافية",
    category: "Brand Identity",
    descEn: "Complete digital rebranding for a wellness platform, including logo design, color system, and web interface. The goal was to create a calming, trustworthy digital environment for users seeking mental health resources.",
    descAr: "إعادة تصميم العلامة التجارية الرقمية بالكامل لمنصة صحية، بما في ذلك تصميم الشعار ونظام الألوان وواجهة الويب. كان الهدف هو إنشاء بيئة رقمية مهدئة وجديرة بالثقة للمستخدمين الذين يبحثون عن موارد الصحة العقلية.",
    mainImage: "https://picsum.photos/seed/health/800/600",
    gallery: [
      "https://picsum.photos/seed/health1/800/600",
      "https://picsum.photos/seed/health2/800/600",
      "https://picsum.photos/seed/health3/800/600"
    ],
    technologies: ["Branding", "UI/UX", "Webflow"],
    link: "#"
  },
  {
    id: '6',
    nameEn: "Real Estate Portal",
    nameAr: "بوابة العقارات",
    category: "Web Application",
    descEn: "A feature-rich property listing platform with virtual tours, mortgage calculators, and agent dashboards. Designed to streamline the property buying and renting process for both clients and real estate agents.",
    descAr: "منصة غنية بالميزات لعرض العقارات مع جولات افتراضية وحاسبات عقارية ولوحات تحكم للوكلاء. مصممة لتبسيط عملية شراء واستئجار العقارات لكل من العملاء ووكلاء العقارات.",
    mainImage: "https://picsum.photos/seed/realestate/800/600",
    gallery: [
      "https://picsum.photos/seed/realestate1/800/600",
      "https://picsum.photos/seed/realestate2/800/600",
      "https://picsum.photos/seed/realestate3/800/600"
    ],
    technologies: ["Next.js", "PostgreSQL", "Prisma"],
    link: "#"
  }
]
