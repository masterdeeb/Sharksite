'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';

export function Hero() {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-soft-light"></div>
      
      {/* Colorful Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-200/50 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-200/50 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-pink-200/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <div 
          className="text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-purple-100 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors duration-300">
            <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-500 animate-pulse"></span>
            {t('hero.badge')}
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-slate-900 dark:text-white leading-[1] mb-8 tracking-tight transition-colors duration-300">
            {t('hero.title_1')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient-x">{t('hero.title_2')}</span> <br />
            {t('hero.title_3')}
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal transition-colors duration-300">
            {t('hero.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Link href="/#contact" className="w-full sm:w-auto">
              <button className="group relative w-full px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 overflow-hidden">
                <span className="relative z-10">{t('hero.cta_primary')}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </Link>
            <Link href="/works" className="w-full sm:w-auto">
              <button className="w-full px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm">
                {t('hero.cta_secondary')}
              </button>
            </Link>
          </div>
        </div>

        <div 
          className="relative perspective-1000"
        >
          {/* 3D Card Effect Container */}
          <div className="relative w-full aspect-square max-w-[600px] mx-auto transform rotate-y-12 rotate-x-6 hover:rotate-0 transition-transform duration-700 ease-out">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-200 to-blue-200 rounded-[2rem] blur-3xl -z-10" />
            
            <div className="relative h-full w-full bg-white dark:bg-slate-900 border border-white/50 dark:border-slate-800/50 rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-black/5 dark:ring-white/5 transition-colors duration-300">
              {/* Browser Chrome */}
              <div className="h-12 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center px-6 gap-2 transition-colors duration-300">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="ml-4 flex-1 h-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-full shadow-sm transition-colors duration-300" />
              </div>
              
              {/* Content Placeholder */}
              <div className="p-8 relative h-full bg-slate-50/50 dark:bg-slate-800/50 transition-colors duration-300">
                <Image 
                  src="https://picsum.photos/seed/future/800/800" 
                  alt="Dashboard Preview" 
                  fill
                  className="object-cover opacity-90 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent opacity-80" />
              </div>
            </div>

            {/* Floating Widgets */}
            <div 
              className="absolute -top-6 -right-6 w-40 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/50 dark:border-slate-800/50 rounded-2xl shadow-xl z-20 ring-1 ring-black/5 dark:ring-white/5 transition-colors duration-300"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{t('hero.stat_growth')}</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">+128%</div>
                </div>
              </div>
            </div>
            
            <div 
              className="absolute -bottom-8 -left-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/50 dark:border-slate-800/50 rounded-2xl p-4 shadow-xl z-20 flex items-center gap-4 ring-1 ring-black/5 dark:ring-white/5 transition-colors duration-300"
            >
              <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900" />
                ))}
              </div>
              <div className="text-xs font-medium text-slate-900 dark:text-white">{t('hero.stat_users')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
