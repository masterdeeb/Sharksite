'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { saveMessage } from '@/lib/messages';

export function Contact() {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert(language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    await saveMessage(formData);
    
    setIsSubmitting(false);
    setIsSuccess(true);
    setFormData({ name: '', email: '', message: '' });
    
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <section id="contact-us" className="py-32 bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
      <div className="absolute right-0 bottom-0 w-1/3 h-full bg-gradient-to-l from-purple-100/50 dark:from-purple-900/20 to-transparent pointer-events-none transition-colors duration-300" />
      
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-300">
            {language === 'ar' ? 'لنتحدث في العمل' : "Let's Talk Business"}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 transition-colors duration-300">
            {language === 'ar' 
              ? 'املأ النموذج أدناه وسنرد عليك في غضون 24 ساعة.' 
              : "Fill out the form below and we'll get back to you within 24 hours."}
          </p>
        </div>

        <form 
          onSubmit={handleSubmit}
          className="space-y-6 bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-purple-100/50 dark:shadow-none transition-colors duration-300"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-1 transition-colors duration-300">
                {language === 'ar' ? 'الاسم' : 'Name'}
              </label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="John Doe"
                className="w-full px-6 py-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-1 transition-colors duration-300">
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="john@example.com"
                className="w-full px-6 py-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-1 transition-colors duration-300">
              {language === 'ar' ? 'الرسالة' : 'Message'}
            </label>
            <textarea 
              rows={5}
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
              placeholder={language === 'ar' ? 'أخبرنا عن مشروعك...' : 'Tell us about your project...'}
              className="w-full px-6 py-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all resize-none"
            />
          </div>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-5 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-70"
          >
            {isSubmitting ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') : 
             isSuccess ? (language === 'ar' ? 'تم الإرسال بنجاح!' : 'Sent Successfully!') : 
             (language === 'ar' ? 'إرسال الرسالة' : 'Send Message')}
          </button>
        </form>
      </div>
    </section>
  );
}
