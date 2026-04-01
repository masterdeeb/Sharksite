'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Image from 'next/image';
import { ArrowUpRight, X, ExternalLink, Search } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { motion, AnimatePresence } from 'motion/react';
import { Project, initialProjects, defaultCategories, getProjects, getCategories } from '@/lib/projects';

export default function WorksPage() {
  const { t, language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const loadData = async () => {
      const projs = await getProjects();
      setProjects(projs);
      
      const cats = await getCategories();
      setCategories(cats);
    };
    loadData();
  }, []);

  const displayCategories = ['All', ...categories];

  const filteredProjects = projects.filter(p => {
    const matchesCategory = selectedCategory === 'All' || 
      (p.categories && p.categories.includes(selectedCategory)) || 
      (!p.categories && p.category === selectedCategory);
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      p.nameEn.toLowerCase().includes(query) ||
      (p.nameAr?.toLowerCase().includes(query)) ||
      (p.descEn?.toLowerCase().includes(query)) ||
      (p.descAr?.toLowerCase().includes(query)) ||
      (p.categories ? p.categories.some(c => c.toLowerCase().includes(query)) : p.category.toLowerCase().includes(query));
      
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-40 pb-20 relative overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-100/60 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-100/60 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div>
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-purple-100 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors duration-300">
              <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-500 animate-pulse"></span>
              {t('works.badge')}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight transition-colors duration-300">
              {t('works.title_1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">{t('works.title_2')}</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
              {t('works.desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-[72px] z-40 transition-colors duration-300">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {displayCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === cat ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  {cat === 'All' ? (language === 'ar' ? 'الكل' : 'All') : cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative max-w-md w-full md:w-auto flex-1">
              <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 shadow-sm transition-all">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input 
                  type="text"
                  placeholder={language === 'ar' ? 'ابحث في المشاريع...' : 'Search projects...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent outline-none px-3 text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-300">
                {language === 'ar' ? 'لم يتم العثور على مشاريع' : 'No projects found'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 transition-colors duration-300">
                {language === 'ar' ? 'جرب البحث بكلمات مختلفة أو تغيير الفئة' : 'Try searching with different keywords or changing the category'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="group cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden mb-6 border border-slate-200 shadow-sm group-hover:shadow-xl transition-all duration-500">
                    <Image 
                      src={project.mainImage} 
                      alt={language === 'ar' && project.nameAr ? project.nameAr : project.nameEn} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div 
                        className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center transform scale-50 group-hover:scale-100 transition-all duration-300 shadow-lg"
                      >
                        <ArrowUpRight className="w-6 h-6 text-slate-900 dark:text-white transition-colors duration-300" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-purple-600 uppercase tracking-wider">
                      {(project.categories?.length ? project.categories : [project.category]).join(', ')}
                    </span>
                    <div className="flex gap-2">
                      {project.technologies.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md transition-colors duration-300">
                          {tag}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md transition-colors duration-300">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {language === 'ar' && project.nameAr ? project.nameAr : project.nameEn}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 transition-colors duration-300">
                    {language === 'ar' && project.descAr ? project.descAr : project.descEn}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 bg-slate-900/80 backdrop-blur-sm"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="bg-white dark:bg-slate-950 rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative transition-colors duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-[21/9] w-full bg-slate-100">
                <Image 
                  src={selectedProject.mainImage} 
                  alt={language === 'ar' && selectedProject.nameAr ? selectedProject.nameAr : selectedProject.nameEn} 
                  fill 
                  className="object-cover"
                />
              </div>

              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(selectedProject.categories?.length ? selectedProject.categories : [selectedProject.category]).map(cat => (
                        <div key={cat} className="inline-block px-3 py-1 bg-purple-50 text-purple-600 text-sm font-bold uppercase tracking-wider rounded-full">
                          {cat}
                        </div>
                      ))}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">
                      {language === 'ar' && selectedProject.nameAr ? selectedProject.nameAr : selectedProject.nameEn}
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed transition-colors duration-300">
                      {language === 'ar' && selectedProject.descAr ? selectedProject.descAr : selectedProject.descEn}
                    </p>
                  </div>
                  
                  <div className="md:w-72 shrink-0 bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors duration-300">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-sm transition-colors duration-300">
                      {language === 'ar' ? 'التقنيات المستخدمة' : 'Technologies'}
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {selectedProject.technologies.map(tag => (
                        <span key={tag} className="text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-sm transition-colors duration-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="space-y-3">
                      {(selectedProject.customLinks?.length ? selectedProject.customLinks : [{ url: selectedProject.link, labelEn: 'Visit Project', labelAr: 'زيارة المشروع' }]).map((link, i) => (
                        <Link key={i} href={link.url} target="_blank" rel="noopener noreferrer">
                          <button className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-purple-600 dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 group">
                            <span>{language === 'ar' ? (link.labelAr || link.labelEn) : link.labelEn}</span>
                            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedProject.gallery && selectedProject.gallery.length > 0 && (
                  <div className="space-y-8">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors duration-300">
                      {language === 'ar' ? 'معرض الصور' : 'Gallery'}
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {selectedProject.gallery.map((img, idx) => (
                        <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
                          <Image 
                            src={img} 
                            alt={`Gallery image ${idx + 1}`} 
                            fill 
                            className="object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
            {t('works.cta_title')}
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
            {t('works.cta_desc')}
          </p>
          <Link href="/#contact">
            <button className="px-10 py-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-full font-bold text-lg hover:bg-purple-50 dark:hover:bg-slate-700 transition-all hover:scale-105 shadow-lg shadow-white/10 dark:shadow-none">
              {t('works.cta_btn')}
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
