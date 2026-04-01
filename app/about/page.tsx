'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Image from 'next/image';
import { Target, Lightbulb, Users, Trophy } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function AboutPage() {
  const { t, language } = useLanguage();

  return (
    <main className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-40 pb-20 relative overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight transition-colors duration-300">
              {t('about.hero_title_1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">{t('about.hero_title_2')}</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
              {t('about.hero_desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div
              className="relative"
            >
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-purple-100 dark:shadow-purple-900/20 border border-slate-200 dark:border-slate-800 transition-colors duration-300">
                <Image 
                  src="https://picsum.photos/seed/teamwork/800/800" 
                  alt="Our Team" 
                  fill 
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 transition-colors duration-300">
                <div className="text-4xl font-bold text-purple-600 mb-1">5+</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300">{t('about.story_badge')}</div>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">
                {t('about.story_title_1')} <br />
                <span className="text-purple-600">{t('about.story_title_2')}</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed transition-colors duration-300">
                {t('about.story_p1')}
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed transition-colors duration-300">
                {t('about.story_p2')}
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 transition-colors duration-300">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1 transition-colors duration-300">{t('about.precision_title')}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">{t('about.precision_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 transition-colors duration-300">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1 transition-colors duration-300">{t('about.innovation_title')}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">{t('about.innovation_desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Vision Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-purple-500/30">
              <Lightbulb className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
              {language === 'ar' ? 'رؤيتنا' : 'Our Vision'}
            </h2>
            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed font-light">
              {language === 'ar' 
                ? 'نطمح لأن نكون الرواد في تقديم حلول رقمية مبتكرة تتجاوز التوقعات، وتمكن الشركات من تحقيق أهدافها في العصر الرقمي من خلال تصاميم إبداعية وتقنيات متطورة.'
                : 'We aspire to be the pioneers in providing innovative digital solutions that exceed expectations, empowering businesses to achieve their goals in the digital age through creative designs and cutting-edge technologies.'}
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
