'use client';

import { useLanguage } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export function CTAStrip() {
  const { language } = useLanguage();
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setParticles([...Array(20)].map((_, i) => ({
        id: i,
        width: Math.random() * 100 + 50,
        height: Math.random() * 100 + 50,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        duration: Math.random() * 10 + 10,
      })));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 animate-gradient-x" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
      
      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute bg-white/20 rounded-full blur-xl"
            style={{
              width: p.width,
              height: p.height,
              top: p.top,
              left: p.left,
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
        <h2 
          className="text-5xl md:text-7xl font-bold text-white mb-12 tracking-tight drop-shadow-lg"
        >
          {language === 'ar' ? 'جاهز للانطلاق؟' : 'Ready to launch?'}
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <Link href="/#contact">
            <button className="px-12 py-5 bg-white text-purple-600 rounded-full font-bold text-xl hover:bg-slate-50 transition-all hover:scale-105 shadow-xl shadow-purple-900/20">
              {language === 'ar' ? 'اطلب الآن' : 'Order Now'}
            </button>
          </Link>
          <Link href="/#contact">
            <button className="px-12 py-5 bg-transparent border-2 border-white/30 text-white rounded-full font-bold text-xl hover:bg-white/10 hover:border-white transition-all backdrop-blur-sm">
              {language === 'ar' ? 'اتصل بنا' : 'Contact Us'}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
