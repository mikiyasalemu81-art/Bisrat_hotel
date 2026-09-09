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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A1A1A]/95 backdrop-blur-md border-t border-[#2D2D2D] shadow-[0_-4px_25px_rgba(0,0,0,0.5)] px-2 sm:px-6 h-14 sm:h-16 flex items-center justify-around select-none">
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
                ? 'text-[#C8A24A] font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            {isActive && (
              <span className="absolute -top-1.5 w-8 h-1 bg-[#C8A24A] rounded-full animate-fade-in shadow-[0_0_8px_rgba(200,162,74,0.6)]" />
            )}
            <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
            <span className="text-[10px] sm:text-xs mt-0.5 tracking-tight truncate max-w-[120px]">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
