import React from 'react';
import { MapPin, Phone, Mail, Globe, ArrowUp } from 'lucide-react';
import { translations } from '../translations';

// Simple SVG TikTok Icon
const TikTokIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-2.89-2.89c.28 0 .56.04.83.12V9.41a6.34 6.34 0 0 0-.83-.05A6.33 6.33 0 1 0 15.82 15.7V8.5a8.28 8.28 0 0 0 4.77 1.51V6.56a4.84 4.84 0 0 1-1-.13z"/>
  </svg>
);

export default function Footer({ 
  lang, 
  setLang, 
  setActiveTab 
}) {
  const t = translations[lang] || translations.en;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0D0D0D] text-slate-300 pt-16 pb-12 border-t border-[#262626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#262626]">
          
          {/* Brand Info & TikTok */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden shadow-md shrink-0 border-2 border-[#C8A24A] bg-[#1A1A1A] p-0.5">
                <img src="/images/logo.jpg" alt="Bisrat Luxury Hotel Logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-white">
                  {t.brandName}
                </h3>
                <p className="text-xs text-[#C8A24A] font-semibold">{t.brandAmharic}</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {t.footer.desc}
            </p>

            {/* Social Link: TikTok */}
            <div className="pt-1">
              <a
                href="https://www.tiktok.com/@bisrat_hotel"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#262626] border border-[#C8A24A]/40 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors"
              >
                <TikTokIcon className="w-4 h-4 text-[#C8A24A]" />
                <span>TikTok @bisrat_hotel</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#C8A24A] uppercase tracking-wider">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => { setActiveTab('home'); scrollToTop(); }}
                  className="hover:text-[#C8A24A] transition-colors"
                >
                  {t.tabs.home}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('menu'); scrollToTop(); }}
                  className="hover:text-[#C8A24A] transition-colors"
                >
                  {t.tabs.menu}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setActiveTab('admin'); scrollToTop(); }}
                  className="hover:text-[#C8A24A] transition-colors"
                >
                  {t.tabs.admin}
                </button>
              </li>
            </ul>
          </div>

          {/* Language Switcher in Footer */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#C8A24A] uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#C8A24A]" />
              <span>Select Language</span>
            </h4>
            <div className="flex flex-col gap-2 text-xs">
              <button
                onClick={() => setLang('en')}
                className={`text-left px-3 py-2 rounded-xl transition-colors ${
                  lang === 'en' ? 'bg-[#C8A24A] text-[#1A1A1A] font-bold' : 'bg-[#1A1A1A] text-slate-300 hover:text-white border border-[#2A2A2A]'
                }`}
              >
                English (EN)
              </button>
              <button
                onClick={() => setLang('am')}
                className={`text-left px-3 py-2 rounded-xl transition-colors ${
                  lang === 'am' ? 'bg-[#C8A24A] text-[#1A1A1A] font-bold' : 'bg-[#1A1A1A] text-slate-300 hover:text-white border border-[#2A2A2A]'
                }`}
              >
                አማርኛ (Amharic)
              </button>
              <button
                onClick={() => setLang('or')}
                className={`text-left px-3 py-2 rounded-xl transition-colors ${
                  lang === 'or' ? 'bg-[#C8A24A] text-[#1A1A1A] font-bold' : 'bg-[#1A1A1A] text-slate-300 hover:text-white border border-[#2A2A2A]'
                }`}
              >
                Afaan Oromo (OR)
              </button>
            </div>
          </div>

          {/* Contact & Back to top */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-bold text-[#C8A24A] uppercase tracking-wider">
              {t.footer.contactInfo}
            </h4>
            
            <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-[#2A2A2A] space-y-2 text-xs">
              <p className="text-slate-400">Mobile & WhatsApp:</p>
              <a href="tel:0906320251" className="font-mono text-sm font-bold text-[#C8A24A] block hover:underline">
                0906320251
              </a>

              <p className="text-slate-400 pt-1">Reception Landline:</p>
              <a href="tel:0222112555" className="font-mono text-sm font-bold text-white block hover:underline">
                022 211 2555
              </a>
            </div>

            <button
              onClick={scrollToTop}
              className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#262626] text-white border border-[#C8A24A]/40 py-2.5 rounded-xl text-xs font-semibold transition-colors"
            >
              <ArrowUp className="w-4 h-4 text-[#C8A24A]" />
              <span>Back to Top</span>
            </button>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {t.footer.rights}</p>
          <p className="text-[11px]">Adama, Oromia, Ethiopia</p>
        </div>

      </div>
    </footer>
  );
}
