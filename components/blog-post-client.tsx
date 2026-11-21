'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, Share2, Twitter, Linkedin, User } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { useState, useEffect } from 'react';
import { subscribeToBlogPostBySlug, defaultBlogPosts, BlogPost } from '@/lib/blog';

const defaultArticle: BlogPost = {
  id: 'default',
  slug: 'default',
  titleEn: 'Article Not Found',
  titleAr: 'المقالة غير موجودة',
  contentEn: '<p>The requested article could not be found.</p>',
  contentAr: '<p>تعذر العثور على المقالة المطلوبة.</p>',
  categoryEn: 'Error',
  categoryAr: 'خطأ',
  dateEn: '-',
  dateAr: '-',
  readTimeEn: '-',
  readTimeAr: '-',
  image: 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=1200&auto=format&fit=crop',
  author: {
    nameEn: 'System',
    nameAr: 'النظام',
    roleEn: 'Admin',
    roleAr: 'مسؤول',
  },
  createdAt: 0,
};

export function BlogPostClient({ slugProp }: { slugProp?: string }) {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = slugProp || searchParams.get('slug') || (params?.slug as string) || '';
  const { language } = useLanguage();
  const [loadedArticle, setLoadedArticle] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const unsubscribe = subscribeToBlogPostBySlug(
      slug,
      (post) => {
        if (post) {
          setLoadedArticle(post);
        } else {
          const fallback = defaultBlogPosts.find((p) => p.slug === slug);
          setLoadedArticle(fallback || defaultArticle);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Blog post subscription error:', error);
        const fallback = defaultBlogPosts.find((p) => p.slug === slug);
        setLoadedArticle(fallback || defaultArticle);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [slug]);

  const effectiveLoading = slug ? isLoading : false;
  const article = slug ? loadedArticle : defaultArticle;

  if (effectiveLoading) {
    return (
      <main className="bg-white dark:bg-slate-950 min-h-screen transition-colors duration-300">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!article) return null;

  return (
    <main className="bg-white dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <Navbar />

      {/* Article Header */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-20 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Blog</span>
          </Link>

          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider transition-colors duration-300">
                {language === 'ar' ? article.categoryAr : article.categoryEn}
              </span>
              <span className="text-slate-400 dark:text-slate-500 text-sm flex items-center gap-1 transition-colors duration-300">
                <Calendar className="w-3.5 h-3.5" /> {language === 'ar' ? article.dateAr : article.dateEn}
              </span>
              <span className="text-slate-400 dark:text-slate-500 text-sm flex items-center gap-1 transition-colors duration-300">
                <Clock className="w-3.5 h-3.5" /> {language === 'ar' ? article.readTimeAr : article.readTimeEn}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-8 leading-tight transition-colors duration-300">
              {language === 'ar' ? article.titleAr : article.titleEn}
            </h1>

            <div className="flex items-center justify-between border-y border-slate-100 dark:border-slate-800 py-6 transition-colors duration-300">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors duration-300 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <User className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white transition-colors duration-300">
                    {language === 'ar' ? article.author.nameAr : article.author.nameEn}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
                    {language === 'ar' ? article.author.roleAr : article.author.roleEn}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                  <Twitter className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-blue-800 dark:hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="pb-12">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="relative aspect-[21/9] rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200 dark:shadow-none transition-shadow duration-300">
            <Image
              src={article.image}
              alt={language === 'ar' ? article.titleAr : article.titleEn}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="pb-24">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <div
            className="prose prose-lg prose-slate dark:prose-invert prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-a:text-purple-600 dark:prose-a:text-purple-400 hover:prose-a:text-purple-700 dark:hover:prose-a:text-purple-300 prose-img:rounded-2xl transition-colors duration-300"
            dangerouslySetInnerHTML={{
              __html: language === 'ar' ? article.contentAr : article.contentEn,
            }}
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}
