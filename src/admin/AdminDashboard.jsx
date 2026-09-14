import React from 'react';
import { Utensils, LogOut } from 'lucide-react';
import MenuManager from './MenuManager';
import { translations } from '../translations';
import { getOptimizedImageUrl } from '../utils/imageUrl';

export default function AdminDashboard({ 
  menuItems, 
  setMenuItems, 
  photos, 
  setPhotos, 
  paymentSettings,
  lang = 'en',
  onLogout 
}) {
  const t = translations[lang] || translations.en;

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-[#1B4D3E] text-white border border-[#13382D] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#C5A059] bg-[#13382D] p-0.5 shadow-md shrink-0">
            <img 
              src={getOptimizedImageUrl("/logo.png")} 
              onError={(e) => { e.currentTarget.src = "/images/logo.jpg"; }}
              alt="Bisrat Hotel Logo" 
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
                <Utensils className="w-6 h-6 text-[#C5A059]" />
                <span>{lang === 'am' ? 'የምግብ ዝርዝር ማስተካከያ (Edit Menu)' : 'Edit Menu — Bisrat Hotel'}</span>
              </h2>
              <span className="hidden sm:inline-block bg-[#C5A059] text-[#1A1C19] text-[10px] font-black px-2 py-0.5 rounded uppercase">
                Admin
              </span>
            </div>
            <p className="text-xs text-[#C5A059] font-medium mt-0.5">
              {lang === 'am' 
                ? 'የምግብ እና መጠጥ ዝርዝር ማስተካከያ (ስም፣ ዋጋ፣ ፎቶ) • አዳማ፣ ኢትዮጵያ' 
                : 'Live Menu Management (Add, Edit, Delete Dishes, Prices & Images) • Adama, Ethiopia'}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-[#13382D] hover:bg-[#0E2A22] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors border border-[#C5A059]/40 cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-[#C5A059]" />
          <span>{t.admin.logout}</span>
        </button>
      </div>

      {/* Edit Menu Interface Panel (No other tabs or settings) */}
      <div className="bg-[#FDFCF7] p-6 sm:p-8 rounded-3xl border border-[#E8EFE9] shadow-sm">
        <MenuManager 
          menuItems={menuItems} 
          setMenuItems={setMenuItems} 
          photos={photos}
          setPhotos={setPhotos}
          paymentSettings={paymentSettings}
          lang={lang} 
        />
      </div>

    </div>
  );
}
