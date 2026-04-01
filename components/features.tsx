'use client';

import { features } from '@/lib/data';
import { featuresAr } from '@/lib/data-ar';
import { useLanguage } from '@/lib/i18n';

export function Features() {
  const { language, t } = useLanguage();
  const data = language === 'ar' ? featuresAr : features;

  return (
    <section className="py-32 bg-slate-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight transition-colors duration-300">
            {language === 'ar' ? 'لماذا يحتاج عملك إلى' : 'Why Your Business Needs'} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              {language === 'ar' ? 'موقع إلكتروني متميز' : 'A Premium Website'}
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 font-light transition-colors duration-300">
            {language === 'ar' 
              ? 'حقق نموًا بمقدار 10 أضعاف من خلال وجود رقمي يجذب الانتباه ويبني الثقة.'
              : 'Unlock 10x growth with a digital presence that commands attention and builds trust.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {data.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-purple-500/5"
            >
              <div className="relative z-10 flex items-start gap-6">
                <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:scale-110 transition-all duration-500 shadow-sm">
                  <feature.icon className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors duration-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <button className="relative inline-flex h-14 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 shadow-lg">
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-white dark:bg-slate-950 px-10 py-1 text-sm font-bold text-slate-900 dark:text-white backdrop-blur-3xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors uppercase tracking-widest">
              {t('nav.order')}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
