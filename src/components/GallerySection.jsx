import React, { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import ImagePlaceholder from './ImagePlaceholder';
import { translations } from '../translations';

export default function GallerySection({ 
  gallery = [], 
  photos = {}, 
  lang 
}) {
  const t = translations[lang] || translations.en;

  const [activeCategory, setActiveCategory] = useState('all');
  const [activeLightboxItem, setActiveLightboxItem] = useState(null);

  const categories = [
    { id: 'all', label: t.gallery.all },
    { id: 'rooms', label: t.gallery.rooms },
    { id: 'exterior', label: t.gallery.exterior },
    { id: 'food', label: t.gallery.food },
    { id: 'events', label: t.gallery.events },
  ];

  const filteredItems = gallery.filter((g) => 
    activeCategory === 'all' || g.category === activeCategory
  );

  return (
    <section id="gallery" className="py-16 bg-softbg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-skybrand-700 bg-skybrand-100/80 px-3 py-1 rounded-full mb-3">
            Bisrat Hotel Tour
          </span>
          <h2 className="fluid-section-title font-serif font-bold text-navybrand-900 mb-3">
            {t.gallery.title}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            {t.gallery.subtitle}
          </p>
        </div>

        {/* Categories Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-skybrand-500 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const customImg = photos?.[item.placeholderSlot] || item.customImage;
            const title = lang === 'am' ? item.titleAm : lang === 'or' ? item.titleOr : item.titleEn;

            return (
              <div
                key={item.id}
                onClick={() => setActiveLightboxItem(item)}
                className="group relative cursor-pointer bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-hover transition-all duration-300 border border-slate-100"
              >
                <ImagePlaceholder
                  slotName={item.placeholderSlot}
                  customImage={customImg}
                  alt={title}
                  aspectRatio="aspect-[4/3]"
                  className="w-full"
                />

                {/* Overlay hover effect */}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center text-white backdrop-blur-xs">
                  <ZoomIn className="w-8 h-8 text-skybrand-300 mb-2 transform scale-75 group-hover:scale-100 transition-transform" />
                  <p className="font-serif text-sm font-bold">{title}</p>
                  <span className="text-[10px] text-slate-300 capitalize mt-1 bg-slate-800/80 px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lightbox Modal */}
        {activeLightboxItem && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <button
              onClick={() => setActiveLightboxItem(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="max-w-4xl w-full text-center space-y-4">
              <div className="rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-900">
                <ImagePlaceholder
                  slotName={activeLightboxItem.placeholderSlot}
                  customImage={photos?.[activeLightboxItem.placeholderSlot] || activeLightboxItem.customImage}
                  alt={activeLightboxItem.titleEn}
                  aspectRatio="aspect-[16/10]"
                  className="w-full max-h-[75vh]"
                />
              </div>

              <div className="text-white">
                <h3 className="font-serif text-xl font-bold">
                  {lang === 'am' ? activeLightboxItem.titleAm : lang === 'or' ? activeLightboxItem.titleOr : activeLightboxItem.titleEn}
                </h3>
                <p className="text-xs text-skybrand-400 font-mono mt-1">
                  [UPLOAD: {activeLightboxItem.placeholderSlot}]
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
