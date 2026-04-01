'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { Project, getProjects } from '@/lib/projects';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export function Portfolio() {
  const { language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadProjects = async () => {
      const allProjects = await getProjects();
      const homeProjects = allProjects.filter(p => p.showOnHome);
      setProjects(homeProjects);
    };
    loadProjects();
  }, []);

  const [itemsToShow, setItemsToShow] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsToShow(1);
      } else if (window.innerWidth < 1024) {
        setItemsToShow(2);
      } else {
        setItemsToShow(3);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, projects.length - itemsToShow);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  if (projects.length === 0) {
    return null; // Don't show the section if no projects are selected for home
  }

  // Calculate how many items to show based on screen size (we'll just use CSS grid/flex for simplicity, but handle index for sliding)
  // A simple approach is to show 1 on mobile, 2 on tablet, 3 on desktop.
  // We can just use a flex container with overflow-hidden and transform translateX.

  return (
    <section id="our-works" className="py-32 bg-white dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-300">
      {/* Spotlight Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-100/50 dark:bg-purple-900/20 rounded-full blur-[100px] pointer-events-none transition-colors duration-300" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-slate-900 dark:text-white transition-colors duration-300">
              {language === 'ar' ? 'أعمال مختارة' : 'Selected Works'}
            </h2>
            <div className="w-24 h-1 bg-slate-200 dark:bg-slate-800 rounded-full transition-colors duration-300" />
          </div>
          
          <div className="flex items-center gap-4">
            {projects.length > itemsToShow && (
              <div className="flex gap-2 mr-4">
                <button 
                  onClick={prevSlide}
                  className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={nextSlide}
                  className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
            <Link href="/works">
              <button className="flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold hover:bg-purple-600 dark:hover:bg-purple-500 transition-all hover:scale-105 shadow-lg">
                {language === 'ar' ? 'رؤية المزيد' : 'See More'}
                <ArrowRight className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden -mx-4 px-4">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
            }}
          >
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="w-full md:w-1/2 lg:w-1/3 shrink-0 px-4"
              >
                <div className="group relative bg-slate-50 dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 h-full flex flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-200 dark:bg-slate-800 transition-colors duration-300">
                    <img 
                      src={project.mainImage} 
                      alt={language === 'ar' ? project.nameAr || project.nameEn : project.nameEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      {(project.categories?.length ? project.categories : [project.category]).map(cat => (
                        <span key={cat} className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-900 dark:text-white text-xs font-bold rounded-full shadow-sm transition-colors duration-300">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {language === 'ar' ? project.nameAr || project.nameEn : project.nameEn}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-6 line-clamp-2 flex-1 transition-colors duration-300">
                      {language === 'ar' ? project.descAr || project.descEn : project.descEn}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.technologies.slice(0, 3).map((tech, i) => (
                        <span key={i} className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md transition-colors duration-300">
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-md transition-colors duration-300">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>
                    
                    <a 
                      href={project.customLinks?.[0]?.url || project.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors mt-auto"
                    >
                      {language === 'ar' ? (project.customLinks?.[0]?.labelAr || project.customLinks?.[0]?.labelEn || 'عرض المشروع') : (project.customLinks?.[0]?.labelEn || 'View Project')}
                      <svg className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
