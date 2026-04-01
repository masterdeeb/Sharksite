'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Sparkles, Lock, Linkedin, Github, Youtube } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { getSettings, SiteSettings } from '@/lib/settings';

export function Footer() {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const s = await getSettings();
      setSettings(s);
    };
    loadSettings();
    window.addEventListener('settingsUpdated', loadSettings);
    return () => window.removeEventListener('settingsUpdated', loadSettings);
  }, []);

  const footerNavItems = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.works'), href: '/works' },
    { name: t('nav.blog'), href: '/blog' },
    { name: t('nav.contact'), href: '/#contact' },
    { name: t('nav.about'), href: '/about' },
  ];

  const socialIcons = [
    { name: 'facebook', icon: Facebook },
    { name: 'twitter', icon: Twitter },
    { name: 'instagram', icon: Instagram },
    { name: 'linkedin', icon: Linkedin },
    { name: 'github', icon: Github },
    { name: 'youtube', icon: Youtube },
  ];

  return (
    <footer className="bg-slate-950 text-white pt-24 pb-10 border-t border-slate-800 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-20">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 overflow-hidden">
                {settings?.faviconUrl ? (
                  <img src={settings.faviconUrl} alt="Logo" className="w-6 h-6 object-contain" />
                ) : (
                  <Sparkles className="w-5 h-5 text-white" />
                )}
              </div>
              <span className="text-2xl font-bold tracking-tighter text-white uppercase">
                {settings ? (language === 'ar' ? settings.siteNameAr : settings.siteNameEn) : 'SHARKSITE'}
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-base max-w-md mb-8">
              {t('footer.description')}
            </p>
            <div className="flex flex-wrap gap-4">
              {settings && socialIcons.map(({ name, icon: Icon }) => {
                const url = settings.socialLinks[name as keyof typeof settings.socialLinks];
                if (!url) return null;
                return (
                  <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center hover:bg-slate-800 hover:border-purple-500/50 hover:text-purple-400 transition-all duration-300 group">
                    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-8 text-white">{t('footer.navigation')}</h3>
            <ul className="space-y-4">
              {footerNavItems.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-slate-400 hover:text-purple-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-8 text-white">{t('footer.contact')}</h3>
            <div className="space-y-6">
              <a href={`mailto:${settings?.contactEmail || 'ahmedbeby2002@gmail.com'}`} className="flex items-start gap-4 text-slate-400 hover:text-white transition-colors group">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-purple-600 transition-colors border border-slate-800 group-hover:border-purple-500">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">{t('footer.email_label')}</div>
                  <span className="text-sm font-medium">{settings?.contactEmail || 'ahmedbeby2002@gmail.com'}</span>
                </div>
              </a>
              <Link href="/#contact">
                <button className="w-full px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors shadow-lg shadow-white/5">
                  {t('footer.start_project')}
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <div className="flex items-center gap-2">
            <p>&copy; {new Date().getFullYear()} {settings ? (language === 'ar' ? settings.siteNameAr : settings.siteNameEn) : 'SharkSite'}. {t('footer.copyright')}</p>
            <Link href="/admin" className="text-slate-600 hover:text-purple-400 transition-colors" title="Admin Dashboard">
              <Lock className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
