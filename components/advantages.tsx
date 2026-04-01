'use client';

import { advantages } from '@/lib/data';
import { advantagesAr } from '@/lib/data-ar';
import { useLanguage } from '@/lib/i18n';

export function Advantages() {
  const { language } = useLanguage();
  const data = language === 'ar' ? advantagesAr : advantages;

  return (
    <section className="py-32 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">
            {language === 'ar' ? 'ميزة' : 'The'} <span className="text-purple-600">Sharksite</span> {language === 'ar' ? '' : 'Advantage'}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 font-light transition-colors duration-300">
            {language === 'ar' 
              ? 'نحن لا نصمم فقط؛ نحن نهندس النجاح. إليك سبب اختيار قادة الصناعة لنا.' 
              : "We don't just design; we engineer success. Here is why industry leaders choose us."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-14 h-14 mb-6 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 group-hover:text-white group-hover:bg-purple-600 transition-all duration-300">
                <item.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed transition-colors duration-300">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
