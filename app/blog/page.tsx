'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useState, useEffect } from 'react';
import { subscribeToBlogPosts, defaultBlogPosts, BlogPost } from '@/lib/blog';

export default function BlogPage() {
  const { t, language } = useLanguage();
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToBlogPosts(
      (posts) => {
        setArticles(posts.length > 0 ? posts : defaultBlogPosts);
        setIsLoading(false);
      },
      (error) => {
        console.error('Blog posts subscription error:', error);
        setArticles(defaultBlogPosts);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <main className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-40 pb-20 relative overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-purple-100/50 to-transparent rounded-full blur-[100px] pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div>
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-blue-100 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors duration-300">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 animate-pulse"></span>
              {t('blog.badge')}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight transition-colors duration-300">
              {t('blog.title_1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">{t('blog.title_2')}</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
              {t('blog.desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <Link href={`/blog/post?slug=${encodeURIComponent(article.slug)}`} className="block relative aspect-[16/10] overflow-hidden">
                    <Image 
                      src={article.image} 
                      alt={language === 'ar' ? article.titleAr : article.titleEn} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider shadow-sm transition-colors duration-300">
                      {language === 'ar' ? article.categoryAr : article.categoryEn}
                    </div>
                  </Link>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium transition-colors duration-300">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {language === 'ar' ? article.dateAr : article.dateEn}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {language === 'ar' ? article.readTimeAr : article.readTimeEn} {t('blog.read_time')}
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                      <Link href={`/blog/post?slug=${encodeURIComponent(article.slug)}`}>
                        {language === 'ar' ? article.titleAr : article.titleEn}
                      </Link>
                    </h2>
                    
                    <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow transition-colors duration-300" dangerouslySetInnerHTML={{ __html: language === 'ar' ? article.contentAr : article.contentEn }} />
                    
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors duration-300 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors duration-300">{language === 'ar' ? article.author.nameAr : article.author.nameEn}</span>
                      </div>
                      <Link href={`/blog/post?slug=${encodeURIComponent(article.slug)}`} className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors p-2 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/30">
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
            <div className="absolute top-[-50%] left-[-20%] w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('blog.newsletter_title')}</h2>
              <p className="text-slate-400 mb-8">{t('blog.newsletter_desc')}</p>
              
              <form className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="email" 
                  placeholder={t('blog.email_placeholder')}
                  className="flex-grow px-6 py-4 rounded-xl bg-white/10 dark:bg-slate-800/50 border border-white/10 dark:border-slate-700 text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm transition-colors duration-300"
                />
                <button className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors shadow-lg shadow-white/5 dark:shadow-none">
                  {t('blog.subscribe_btn')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
