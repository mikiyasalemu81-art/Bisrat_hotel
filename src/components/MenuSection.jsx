import React, { useState } from 'react';
import { Search, Utensils, Coffee, Wine, Sparkles, CheckCircle2 } from 'lucide-react';
import ImagePlaceholder from './ImagePlaceholder';
import { translations } from '../translations';

export default function MenuSection({ 
  menuItems = [], 
  photos = {}, 
  lang 
}) {
  const t = translations[lang] || translations.en;

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Key requirement: Filter out items that are marked isAvailable === false so they DISAPPEAR completely!
  const availableItems = menuItems.filter(item => item.isAvailable === true);

  const categories = [
    { id: 'all', label: t.menu.all, icon: Utensils },
    { id: 'ethiopian', label: t.menu.ethiopian, icon: Utensils },
    { id: 'international', label: t.menu.international, icon: Utensils },
    { id: 'beverages', label: t.menu.beverages, icon: Coffee },
    { id: 'bar', label: t.menu.bar, icon: Wine },
  ];

  const filteredItems = availableItems.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const nameStr = (item.nameEn + item.nameAm + item.nameOr + item.description).toLowerCase();
    const matchesSearch = nameStr.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="menu-section" className="py-12 lg:py-20 bg-white min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-skybrand-700 bg-sky-50 border border-sky-200 px-3.5 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5 text-skybrand-500" />
            <span>Bisrat Hotel Gourmet Dining</span>
          </div>
          <h2 className="fluid-section-title font-serif font-bold text-navybrand-900 mb-3">
            {t.menu.title}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            {t.menu.subtitle}
          </p>
        </div>

        {/* Controls: Search & Category Tabs */}
        <div className="space-y-6 mb-10">
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.menu.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-skybrand-500 shadow-xs"
            />
          </div>

          {/* Categories Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isSelected
                      ? 'bg-skybrand-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Menu Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const customImg = photos?.[item.placeholderSlot] || item.customImage;
              const displayName = lang === 'am' ? item.nameAm : lang === 'or' ? item.nameOr : item.nameEn;

              return (
                <div
                  key={item.id}
                  className="bg-slate-50/70 border border-slate-200/80 rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-hover transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Item Image Slot or Custom Image */}
                    <ImagePlaceholder 
                      slotName={item.placeholderSlot}
                      customImage={customImg}
                      alt={displayName}
                      aspectRatio="aspect-[16/10]"
                      className="w-full"
                    />

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-serif text-lg font-bold text-navybrand-900 group-hover:text-skybrand-600 transition-colors">
                          {displayName}
                        </h3>

                        <div className="bg-skybrand-100 text-skybrand-800 text-xs font-mono font-bold px-2.5 py-1 rounded-lg shrink-0">
                          {item.price} {t.menu.currency}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed mb-3">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-4 pt-0 flex items-center justify-between border-t border-slate-200/60 text-[11px] font-semibold text-emerald-700 mt-2">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Fresh Daily
                    </span>
                    <span className="text-slate-400 capitalize">{item.category}</span>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State if no items found or all out of stock */
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto">
            <Utensils className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold text-sm">
              {t.menu.noItems}
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
