'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Globe, Sparkles, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from 'next-themes';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const handleNewMessage = (e: Event) => {
      const customEvent = e as CustomEvent<{ name: string; subject?: string }>;
      const notificationsEnabled = localStorage.getItem('sharksite_notifications_enabled') === 'true';
      if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('New Message Received', {
          body: `From: ${customEvent.detail.name}\n${customEvent.detail.subject || 'No Subject'}`,
          icon: '/favicon.ico',
          tag: 'new-message'
        });
      }
    };

    window.addEventListener('sharksite_new_message', handleNewMessage);

    return () => {
      window.removeEventListener('sharksite_new_message', handleNewMessage);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setIsNavigating(false);
    }, 0);

    // Track page views in Firestore once per session to conserve daily quota
    const sessionKey = `sharksite_viewed_${pathname}`;
    if (typeof window !== 'undefined' && !sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, '1');
      import('@/lib/analytics').then(({ incrementPageViews }) => {
        incrementPageViews();
      });
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    if (pathname !== href && !href.startsWith('/#')) {
      setIsNavigating(true);
    }
    setIsOpen(false);
  };

  const navItems = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.works'), href: '/works' },
    { name: t('nav.blog'), href: '/blog' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.contact'), href: '/contact' },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <header>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 py-4 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group" onClick={() => handleNavClick('/')}>
          <div className="relative w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500 shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className={`text-2xl font-bold tracking-tighter transition-colors ${scrolled ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}>SHARKSITE</span>
        </Link>

        {/* Desktop Nav */}
        <div className={`hidden md:flex items-center gap-1 rounded-full px-2 py-1 border backdrop-blur-sm transition-all ${scrolled ? 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700' : 'bg-white/50 dark:bg-slate-900/50 border-white/50 dark:border-slate-800/50'}`}>
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={() => handleNavClick(item.href)}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                pathname === item.href 
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white dark:hover:bg-slate-900'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Globe className="w-4 h-4" />
            <span>{t('nav.lang')}</span>
          </button>
          <Link href="/#contact" onClick={() => handleNavClick('/#contact')}>
            <button className="relative group overflow-hidden bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 hover:shadow-lg">
              <span className="relative z-10">{t('nav.order')}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
          <button 
            className="text-slate-900 dark:text-white p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed inset-0 top-[80px] bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 overflow-y-auto"
          >
            <div className="container mx-auto px-4 py-8 flex flex-col gap-6">
              {navItems.map((item, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={item.name}
                >
                  <Link 
                    href={item.href}
                    className="text-3xl font-bold text-slate-800 dark:text-slate-100 hover:text-purple-600 dark:hover:text-purple-400 transition-colors block py-2"
                    onClick={() => handleNavClick(item.href)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />
              <div className="flex flex-col gap-4">
                <button 
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 text-lg"
                >
                  <Globe className="w-5 h-5" />
                  <span>{t('nav.lang')}</span>
                </button>
                <Link href="/#contact" onClick={() => handleNavClick('/#contact')} className="w-full">
                  <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-xl font-bold text-lg w-full hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                    {t('nav.order')}
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </nav>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-purple-100 dark:border-purple-900 border-t-purple-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/50" />
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium animate-pulse">Loading...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
