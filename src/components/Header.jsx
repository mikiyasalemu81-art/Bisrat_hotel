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
      scrolled ? 'glass-header shadow-soft py-2' : 'bg-white/95 backdrop-blur-md border-b border-slate-100 py-3'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Official Crest Logo & Brand */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden shadow-md border-2 border-white bg-white p-0.5 group-hover:scale-105 transition-transform shrink-0">
              <img 
                src="/images/logo.jpg" 
                alt="Bisrat Luxury Hotel Logo Crest" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xl sm:text-2xl font-bold text-navybrand-900 tracking-tight leading-none group-hover:text-skybrand-600 transition-colors">
                  {t.brandName}
                </span>
                <span className="hidden xs:inline-block bg-skybrand-100 text-skybrand-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                  Adama
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {t.brandAmharic} • Luxury Comfort in Adama
              </p>
            </div>
          </div>

          {/* Desktop Persistent 3-Tab Main Navigation Bar */}
          <nav className="hidden md:flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-inner">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'home'
                  ? 'bg-skybrand-500 text-white shadow-md'
                  : 'text-slate-700 hover:text-navybrand-900 hover:bg-slate-200/60'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{t.tabs.home}</span>
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'menu'
                  ? 'bg-skybrand-500 text-white shadow-md'
                  : 'text-slate-700 hover:text-navybrand-900 hover:bg-slate-200/60'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>{t.tabs.menu}</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-skybrand-500 text-white shadow-md'
                  : 'text-slate-700 hover:text-navybrand-900 hover:bg-slate-200/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t.tabs.admin}</span>
            </button>
          </nav>

          {/* Right Action Bar: TikTok, Phone, Language Switcher, Book Now */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* TikTok Social Link */}
            <a
              href="https://www.tiktok.com/@bisrat_hotel"
              target="_blank"
              rel="noopener noreferrer"
              title="Follow Bisrat Hotel on TikTok (@bisrat_hotel)"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-colors border border-slate-200"
            >
              <TikTokIcon className="w-4 h-4 text-slate-900" />
            </a>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5 hidden xs:inline" />
              {languageNames.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  title={l.fullName}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    lang === l.code
                      ? 'bg-white text-skybrand-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-navybrand-900'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Direct Reception Phones Link */}
            <div className="hidden lg:flex flex-col text-[11px] font-semibold text-slate-700 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
              <a href="tel:0906320251" className="hover:text-skybrand-600 flex items-center gap-1">
                <PhoneCall className="w-3 h-3 text-skybrand-500" />
                <span>0906320251</span>
              </a>
              <a href="tel:0222112555" className="hover:text-skybrand-600 flex items-center gap-1 text-[10px] text-slate-500">
                <span>☎ 022 211 2555</span>
              </a>
            </div>

            {/* Book Now Button */}
            <button
              onClick={onBookClick}
              className="flex items-center gap-1.5 bg-gradient-to-r from-skybrand-500 to-skybrand-600 hover:from-skybrand-600 hover:to-skybrand-700 text-white font-semibold text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>{t.nav.bookNow}</span>
            </button>
          </div>

        </div>

        {/* Mobile Persistent 3-Tab Bar (Visible on Mobile) */}
        <div className="md:hidden mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-around bg-slate-50/90 p-1.5 rounded-xl">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'home'
                ? 'bg-skybrand-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t.tabs.home}</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'menu'
                ? 'bg-skybrand-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>{t.tabs.menu}</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'admin'
                ? 'bg-skybrand-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.tabs.admin}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
