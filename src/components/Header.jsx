import React, { useState, useEffect } from 'react';
import { Home, UtensilsCrossed, ShieldCheck, Globe, PhoneCall, Calendar } from 'lucide-react';
import { translations } from '../translations';

// Simple SVG TikTok Icon
const TikTokIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-2.89-2.89c.28 0 .56.04.83.12V9.41a6.34 6.34 0 0 0-.83-.05A6.33 6.33 0 1 0 15.82 15.7V8.5a8.28 8.28 0 0 0 4.77 1.51V6.56a4.84 4.84 0 0 1-1-.13z"/>
  </svg>
);

export default function Header({ 
  activeTab, 
  setActiveTab, 
  lang, 
  setLang, 
  onBookClick 
}) {
  const [scrolled, setScrolled] = useState(false);
  const t = translations[lang] || translations.en;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const languageNames = [
    { code: 'en', label: 'EN', fullName: 'English' },
    { code: 'am', label: 'አማ', fullName: 'አማርኛ' },
    { code: 'or', label: 'OR', fullName: 'Afaan Oromo' },
  ];

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${
      scrolled ? 'glass-header shadow-lg py-1 border-b border-[#2D2D2D]' : 'bg-[#1A1A1A] border-b border-[#2A2A2A] py-1.5 sm:py-2'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Official Crest Logo & Brand */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shadow-md border-2 border-[#C8A24A] bg-[#1A1A1A] p-0.5 group-hover:scale-105 transition-transform shrink-0">
              <img 
                src="/images/logo.jpg" 
                alt="Bisrat Luxury Hotel Logo Crest" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight leading-none group-hover:text-[#C8A24A] transition-colors">
                  {t.brandName}
                </span>
                <span className="hidden xs:inline-block bg-[#C8A24A]/20 text-[#C8A24A] border border-[#C8A24A]/40 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                  Adama
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Bar: TikTok, Phone, Language Switcher, Book Now */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* TikTok Social Link */}
            <a
              href="https://www.tiktok.com/@bisrat_hotel"
              target="_blank"
              rel="noopener noreferrer"
              title="Follow Bisrat Hotel on TikTok (@bisrat_hotel)"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#262626] hover:bg-[#333333] text-[#C8A24A] flex items-center justify-center transition-colors border border-[#C8A24A]/40"
            >
              <TikTokIcon className="w-4 h-4 text-[#C8A24A]" />
            </a>

            {/* Language Switcher */}
            <div className="flex items-center bg-[#262626] p-1 rounded-xl border border-[#C8A24A]/40">
              <Globe className="w-3.5 h-3.5 text-[#C8A24A] ml-1.5 mr-0.5 hidden xs:inline" />
              {languageNames.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  title={l.fullName}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    lang === l.code
                      ? 'bg-[#C8A24A] text-[#1A1A1A] shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Direct Reception Phones Link */}
            <div className="hidden lg:flex flex-col text-[11px] font-semibold text-slate-300 bg-[#262626] px-3 py-1 rounded-xl border border-[#C8A24A]/30">
              <a href="tel:0906320251" className="hover:text-[#C8A24A] flex items-center gap-1">
                <PhoneCall className="w-3 h-3 text-[#C8A24A]" />
                <span>0906320251</span>
              </a>
              <a href="tel:0222112555" className="hover:text-[#C8A24A] flex items-center gap-1 text-[10px] text-slate-400">
                <span>☎ 022 211 2555</span>
              </a>
            </div>

            {/* Book Now Button: Gold background with Dark Charcoal text */}
            <button
              onClick={onBookClick}
              className="flex items-center gap-1.5 bg-[#C8A24A] hover:bg-[#B58E38] text-[#1A1A1A] font-bold text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-95 border border-[#D8B96D]"
            >
              <Calendar className="w-4 h-4 text-[#1A1A1A]" />
              <span>{t.nav.bookNow}</span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
