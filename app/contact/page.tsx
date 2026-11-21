'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Mail, MapPin, Phone, Send, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { saveMessage } from '@/lib/messages';
import { subscribeToSettings, SiteSettings } from '@/lib/settings';

export default function ContactPage() {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToSettings(
      (s) => setSettings(s),
      (error) => console.error('Contact settings subscription error:', error)
    );
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert(language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    await saveMessage({
      name: formData.name,
      email: formData.email,
      subject: formData.subject || t('contact.subjects.general'),
      message: formData.message
    });
    
    setIsSubmitting(false);
    setIsSuccess(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <main className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-40 pb-12 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight transition-colors duration-300">
              {t('contact.hero_title_1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">{t('contact.hero_title_2')}</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto transition-colors duration-300">
              {t('contact.hero_desc')}
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              <div 
                className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 transition-colors duration-300">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-300">{t('contact.email_title')}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4 transition-colors duration-300">{t('contact.email_desc')}</p>
                <a href={`mailto:${settings?.contactEmail || 'ahmedbeby2002@gmail.com'}`} className="text-purple-600 dark:text-purple-400 font-medium hover:underline transition-colors duration-300">
                  {settings?.contactEmail || 'ahmedbeby2002@gmail.com'}
                </a>
              </div>

              <div 
                className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 transition-colors duration-300">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-300">{t('contact.chat_title')}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4 transition-colors duration-300">{t('contact.chat_desc')}</p>
                <button className="text-blue-600 dark:text-blue-400 font-medium hover:underline transition-colors duration-300">
                  {t('contact.chat_btn')}
                </button>
              </div>

              <div 
                className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-6 transition-colors duration-300">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors duration-300">{t('contact.office_title')}</h3>
                <p className="text-slate-500 dark:text-slate-400 whitespace-pre-line transition-colors duration-300">
                  {settings ? (language === 'ar' ? settings.officeAddressAr : settings.officeAddressEn) : '123 Innovation Drive,\nTech City, TC 90210'}
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div 
              className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-purple-100/50 dark:shadow-none transition-colors duration-300"
            >
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 transition-colors duration-300">{t('contact.form_title')}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 transition-colors duration-300">{t('contact.fname_label')}</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-6 py-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 transition-colors duration-300">{t('contact.lname_label')}</label>
                    <input 
                      type="text" 
                      onChange={e => setFormData({...formData, name: formData.name.split(' ')[0] + ' ' + e.target.value})}
                      className="w-full px-6 py-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 transition-colors duration-300">{t('contact.email_label')}</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-6 py-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 transition-colors duration-300">{t('contact.subject_label')}</label>
                  <select 
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-6 py-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">{t('contact.subjects.general')}</option>
                    <option value={t('contact.subjects.proposal')}>{t('contact.subjects.proposal')}</option>
                    <option value={t('contact.subjects.support')}>{t('contact.subjects.support')}</option>
                    <option value={t('contact.subjects.partnership')}>{t('contact.subjects.partnership')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 transition-colors duration-300">{t('contact.message_label')}</label>
                  <textarea 
                    rows={6}
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full px-6 py-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all resize-none"
                    placeholder={t('contact.message_placeholder')}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-xl font-bold text-lg hover:bg-purple-600 dark:hover:bg-purple-500 transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-70"
                >
                  <span>
                    {isSubmitting ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') : 
                     isSuccess ? (language === 'ar' ? 'تم الإرسال بنجاح!' : 'Sent Successfully!') : 
                     t('contact.send_btn')}
                  </span>
                  {!isSubmitting && !isSuccess && <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
