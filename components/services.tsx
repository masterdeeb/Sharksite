'use client';

import { services } from '@/lib/data';
import { servicesAr } from '@/lib/data-ar';
import { useLanguage } from '@/lib/i18n';

export function Services() {
  const { language } = useLanguage();
  const data = language === 'ar' ? servicesAr : services;

  return (
    <section className="py-32 bg-white dark:bg-slate-950 text-slate-900 dark:text-white relative border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-gradient-to-r from-transparent via-purple-200 to-transparent opacity-50" />
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-slate-900 dark:text-white transition-colors duration-300">
            {language === 'ar' ? 'خبراتنا' : 'Our Expertise'}
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto rounded-full shadow-sm" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.map((service, index) => (
            <div
              key={index}
              className="group relative bg-white dark:bg-slate-950 p-1 rounded-3xl hover:bg-gradient-to-br hover:from-purple-600 hover:to-blue-600 transition-all duration-500 shadow-sm hover:shadow-xl"
            >
              <div className="bg-white dark:bg-slate-950 h-full p-8 rounded-[22px] relative overflow-hidden border border-slate-100 dark:border-slate-800 group-hover:border-transparent transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl group-hover:bg-purple-600/10 transition-all" />
                
                <div className="mb-8 w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 group-hover:border-purple-200 dark:group-hover:border-purple-800 group-hover:scale-110 transition-all duration-500">
                  <service.icon className="w-8 h-8 text-slate-600 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 transition-all">
                  {service.title}
                </h3>
                
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
