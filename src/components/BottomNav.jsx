import React from 'react';
import { Home, UtensilsCrossed, ShieldCheck } from 'lucide-react';
import { translations } from '../translations';

export default function BottomNav({ activeTab, setActiveTab, lang }) {
  const t = translations[lang] || translations.en;

  const navItems = [
    { id: 'home', label: t.tabs.home, icon: Home },
    { id: 'menu', label: t.tabs.menu, icon: UtensilsCrossed },
    { id: 'admin', label: t.tabs.admin, icon: ShieldCheck },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1B4D3E] backdrop-blur-md border-t border-[#13382D] shadow-[0_-4px_25px_rgba(27,77,62,0.35)] px-2 sm:px-6 h-14 flex items-center justify-around select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 px-3 sm:px-6 rounded-xl transition-all duration-200 relative ${
              isActive
                ? 'text-[#C5A059] font-extrabold scale-105'
                : 'text-white/80 hover:text-white font-medium'
            }`}
          >
            {isActive && (
              <span className="absolute -top-1 w-8 h-1 bg-[#C5A059] rounded-full animate-fade-in shadow-[0_0_10px_#C5A059]" />
            )}
            <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.75px] text-[#C5A059]' : 'stroke-[1.75px]'}`} />
            <span className={`text-[10px] sm:text-xs mt-0.5 tracking-tight truncate max-w-[120px] ${isActive ? 'text-[#C5A059]' : 'text-white/85'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
