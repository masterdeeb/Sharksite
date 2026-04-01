'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const translations = {
  en: {
    nav: {
      home: 'Home',
      works: 'Our works',
      blog: 'Blog',
      about: 'About us',
      contact: 'Contact us',
      order: 'Order Now',
      lang: 'العربية',
    },
    hero: {
      badge: 'Next Gen Web Design',
      title_1: 'Crafting',
      title_2: 'Digital',
      title_3: 'Excellence',
      description: "We don't just build websites; we architect digital experiences that define brands and drive growth. Join the future of the web with Sharksite.",
      cta_primary: 'Start Project',
      cta_secondary: 'View Portfolio',
      stat_growth: 'Growth',
      stat_users: '1k+ Users',
    },
    features: {
      title: 'Why Choose Us',
      subtitle: 'We deliver excellence in every pixel',
      card_1_title: 'Modern Design',
      card_1_desc: 'Cutting-edge aesthetics that captivate your audience.',
      card_2_title: 'Fast Performance',
      card_2_desc: 'Lightning-fast load times for better user experience.',
      card_3_title: 'SEO Optimized',
      card_3_desc: 'Rank higher on search engines with our SEO strategies.',
    },
    services: {
      title: 'Our Services',
      subtitle: 'Comprehensive digital solutions',
      web_design: 'Web Design',
      web_dev: 'Web Development',
      branding: 'Branding',
      marketing: 'Digital Marketing',
    },
    cta: {
      title: 'Ready to start your project?',
      subtitle: 'Let\'s build something amazing together.',
      button: 'Get Started',
    },
    footer: {
      description: 'Sharksite is a premium web design agency crafting digital experiences that define brands. We merge aesthetics with functionality to drive growth.',
      navigation: 'Navigation',
      contact: 'Contact',
      email_label: 'Email us at',
      start_project: 'Start a Project',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      copyright: 'Sharksite. All rights reserved | by Master.Dev',
    },
    about: {
      hero_title_1: 'We Are',
      hero_title_2: 'Sharksite',
      hero_desc: "A team of digital architects, designers, and strategists dedicated to redefining the web. We don't just follow trends; we set them.",
      story_badge: 'Years of Excellence',
      story_title_1: 'Crafting Digital',
      story_title_2: 'Masterpieces',
      story_p1: 'Founded with a rebellious spirit and a lofty objective: to offer premium web design services at a revolutionary price, while leading the way for socially conscious businesses.',
      story_p2: "Every brand has a story, and our mission is to tell yours through immersive design and flawless functionality. We believe that a website is more than just code; it's the digital heart of your business.",
      precision_title: 'Precision',
      precision_desc: 'Pixel-perfect designs that scale.',
      innovation_title: 'Innovation',
      innovation_desc: 'Always ahead of the curve.',
      stats_projects: 'Projects Completed',
      stats_clients: 'Happy Clients',
      stats_team: 'Team Members',
      stats_awards: 'Awards Won',
      team_title: 'Meet the Minds',
      team_desc: 'The creative force behind your next project.',
    },
    blog: {
      badge: 'Our Blog',
      title_1: 'Insights &',
      title_2: 'Ideas',
      desc: 'Thoughts on design, technology, and the future of the web. Stay ahead of the curve with our latest articles.',
      newsletter_title: 'Subscribe to our newsletter',
      newsletter_desc: 'Get the latest insights and trends delivered directly to your inbox. No spam, just quality content.',
      email_placeholder: 'Enter your email address',
      subscribe_btn: 'Subscribe',
      read_time: 'min read',
    },
    contact: {
      hero_title_1: 'Get in',
      hero_title_2: 'Touch',
      hero_desc: 'Ready to start your next project? We are here to help you take your business to the next level.',
      email_title: 'Email Us',
      email_desc: 'For general inquiries and project discussions.',
      chat_title: 'Live Chat',
      chat_desc: 'Available Mon-Fri, 9am - 6pm.',
      chat_btn: 'Start a conversation',
      office_title: 'Office',
      form_title: 'Send us a message',
      fname_label: 'First Name',
      lname_label: 'Last Name',
      email_label: 'Email Address',
      subject_label: 'Subject',
      message_label: 'Message',
      message_placeholder: 'Tell us about your project...',
      send_btn: 'Send Message',
      subjects: {
        general: 'General Inquiry',
        proposal: 'Project Proposal',
        support: 'Support',
        partnership: 'Partnership',
      }
    },
    works: {
      badge: 'Our Portfolio',
      title_1: 'Selected',
      title_2: 'Masterpieces',
      desc: 'Explore a curated selection of our finest work. We build digital products that are as functional as they are beautiful.',
      cta_title: 'Have a project in mind?',
      cta_desc: "Let's collaborate to build something extraordinary. We are ready to bring your vision to life.",
      cta_btn: 'Start Your Project',
    },
  },
  ar: {
    nav: {
      home: 'الرئيسية',
      works: 'أعمالنا',
      blog: 'المدونة',
      about: 'من نحن',
      contact: 'اتصل بنا',
      order: 'اطلب الآن',
      lang: 'English',
    },
    hero: {
      badge: 'تصميم ويب من الجيل القادم',
      title_1: 'نصنع',
      title_2: 'التميز',
      title_3: 'الرقمي',
      description: 'نحن لا نبني مواقع ويب فحسب؛ بل نصمم تجارب رقمية تحدد العلامات التجارية وتدفع النمو. انضم إلى مستقبل الويب مع Sharksite.',
      cta_primary: 'ابدأ المشروع',
      cta_secondary: 'عرض الأعمال',
      stat_growth: 'النمو',
      stat_users: 'أكثر من 1000 مستخدم',
    },
    features: {
      title: 'لماذا تختارنا',
      subtitle: 'نقدم التميز في كل بكسل',
      card_1_title: 'تصميم عصري',
      card_1_desc: 'جماليات متطورة تأسر جمهورك.',
      card_2_title: 'أداء سريع',
      card_2_desc: 'أوقات تحميل فائقة السرعة لتجربة مستخدم أفضل.',
      card_3_title: 'تحسين محركات البحث',
      card_3_desc: 'احصل على ترتيب أعلى في محركات البحث مع استراتيجياتنا.',
    },
    services: {
      title: 'خدماتنا',
      subtitle: 'حلول رقمية شاملة',
      web_design: 'تصميم الويب',
      web_dev: 'تطوير الويب',
      branding: 'العلامة التجارية',
      marketing: 'التسويق الرقمي',
    },
    cta: {
      title: 'جاهز لبدء مشروعك؟',
      subtitle: 'لنبدأ بناء شيء مذهل معًا.',
      button: 'ابدأ الآن',
    },
    footer: {
      description: 'Sharksite هي وكالة تصميم ويب متميزة تصنع تجارب رقمية تحدد العلامات التجارية. ندمج الجماليات مع الوظائف لدفع النمو.',
      navigation: 'التنقل',
      contact: 'اتصل بنا',
      email_label: 'راسلنا عبر البريد الإلكتروني',
      start_project: 'ابدأ مشروعًا',
      privacy: 'سياسة الخصوصية',
      terms: 'شروط الخدمة',
      copyright: 'Sharksite. جميع الحقوق محفوظة | بواسطة Master.Dev',
    },
    about: {
      hero_title_1: 'نحن',
      hero_title_2: 'Sharksite',
      hero_desc: 'فريق من المهندسين الرقميين والمصممين والاستراتيجيين المكرسين لإعادة تعريف الويب. نحن لا نتبع الاتجاهات فقط؛ نحن نحددها.',
      story_badge: 'سنوات من التميز',
      story_title_1: 'صياغة التحف',
      story_title_2: 'الرقمية',
      story_p1: 'تأسست بروح متمردة وهدف سامٍ: تقديم خدمات تصميم ويب متميزة بسعر ثوري، مع قيادة الطريق للشركات الواعية اجتماعيًا.',
      story_p2: 'كل علامة تجارية لها قصة، ومهمتنا هي سرد قصتك من خلال تصميم غامر ووظائف خالية من العيوب. نحن نؤمن بأن الموقع الإلكتروني هو أكثر من مجرد كود؛ إنه القلب الرقمي لعملك.',
      precision_title: 'الدقة',
      precision_desc: 'تصاميم مثالية بالبكسل قابلة للتوسع.',
      innovation_title: 'الابتكار',
      innovation_desc: 'دائمًا في الطليعة.',
      stats_projects: 'مشروع مكتمل',
      stats_clients: 'عميل سعيد',
      stats_team: 'عضو في الفريق',
      stats_awards: 'جائزة تم الفوز بها',
      team_title: 'تعرف على العقول',
      team_desc: 'القوة الإبداعية وراء مشروعك القادم.',
    },
    blog: {
      badge: 'مدونتنا',
      title_1: 'رؤى و',
      title_2: 'أفكار',
      desc: 'أفكار حول التصميم والتكنولوجيا ومستقبل الويب. ابق في الطليعة مع أحدث مقالاتنا.',
      newsletter_title: 'اشترك في نشرتنا الإخبارية',
      newsletter_desc: 'احصل على أحدث الرؤى والاتجاهات مباشرة في بريدك الوارد. لا رسائل مزعجة، فقط محتوى عالي الجودة.',
      email_placeholder: 'أدخل عنوان بريدك الإلكتروني',
      subscribe_btn: 'اشترك',
      read_time: 'دقيقة للقراءة',
    },
    contact: {
      hero_title_1: 'تواصل',
      hero_title_2: 'معنا',
      hero_desc: 'جاهز لبدء مشروعك القادم؟ نحن هنا لمساعدتك في نقل عملك إلى المستوى التالي.',
      email_title: 'راسلنا',
      email_desc: 'للاستفسارات العامة ومناقشات المشاريع.',
      chat_title: 'الدردشة المباشرة',
      chat_desc: 'متاح من الاثنين إلى الجمعة، 9 صباحًا - 6 مساءً.',
      chat_btn: 'ابدأ محادثة',
      office_title: 'المكتب',
      form_title: 'أرسل لنا رسالة',
      fname_label: 'الاسم الأول',
      lname_label: 'اسم العائلة',
      email_label: 'عنوان البريد الإلكتروني',
      subject_label: 'الموضوع',
      message_label: 'الرسالة',
      message_placeholder: 'أخبرنا عن مشروعك...',
      send_btn: 'إرسال الرسالة',
      subjects: {
        general: 'استفسار عام',
        proposal: 'اقتراح مشروع',
        support: 'دعم',
        partnership: 'شراكة',
      }
    },
    works: {
      badge: 'أعمالنا',
      title_1: 'تحف',
      title_2: 'مختارة',
      desc: 'استكشف مجموعة مختارة من أفضل أعمالنا. نحن نبني منتجات رقمية وظيفية بقدر ما هي جميلة.',
      cta_title: 'هل لديك مشروع في ذهنك؟',
      cta_desc: 'لنتعاون لبناء شيء استثنائي. نحن مستعدون لإحياء رؤيتك.',
      cta_btn: 'ابدأ مشروعك',
    },
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
