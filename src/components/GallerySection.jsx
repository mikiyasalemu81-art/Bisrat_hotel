import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { translations } from '../translations';
import { getOptimizedImageUrl } from '../utils/imageUrl';
import ScrollReveal from './ScrollReveal';

export default function GallerySection({ 
  gallery = [], 
  photos = {}, 
  lang = 'en' 
}) {
  const t = translations[lang] || translations.en;

  const [activeCategory, setActiveCategory] = useState('all');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);

  const categories = [
    { id: 'all', label: t.gallery.all || 'All Photos' },
    { id: 'rooms', label: t.gallery.rooms || 'Rooms & Suites' },
    { id: 'exterior', label: t.gallery.exterior || 'Hotel Exterior' },
    { id: 'food', label: t.gallery.food || 'Food & Dining' },
    { id: 'events', label: t.gallery.events || 'Events & Lounge' },
  ];

  const filteredItems = gallery.filter((g) => 
    activeCategory === 'all' || g.category === activeCategory
  );

  const activeLightboxItem = activeLightboxIndex !== null ? filteredItems[activeLightboxIndex] : null;

  const getItemImage = (item) => {
    if (!item) return '/images/exterior-building.jpg';
    const raw = item.imageUrl || item.image || item.customImage || photos?.[item.placeholderSlot] || photos?.[item.id] || '/images/exterior-building.jpg';
    return getOptimizedImageUrl(raw, item?.updatedAt || item?.createdAt);
  };

  const getItemTitle = (item) => {
    if (!item) return '';
    return item.title || (lang === 'am' ? item.titleAm : lang === 'or' ? item.titleOr : item.titleEn) || item.titleEn || 'Bisrat Hotel';
  };

  const handleOpenLightbox = (index) => {
    setActiveLightboxIndex(index);
  };

  const handleCloseLightbox = () => {
    setActiveLightboxIndex(null);
  };

  const handlePrev = useCallback(() => {
    if (filteredItems.length === 0) return;
    setActiveLightboxIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
  }, [filteredItems.length]);

  const handleNext = useCallback(() => {
    if (filteredItems.length === 0) return;
    setActiveLightboxIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
  }, [filteredItems.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeLightboxIndex === null) return;
      if (e.key === 'Escape') handleCloseLightbox();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, handlePrev, handleNext]);

  // Lock scroll
  useEffect(() => {
    if (activeLightboxIndex !== null) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [activeLightboxIndex]);

  return (
    <section id="gallery" className="py-16 sm:py-20 bg-[#FDFCF7] border-t border-[#E8EFE9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <ScrollReveal delay={0} direction="up">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1B4D3E] bg-[#1B4D3E]/10 border border-[#1B4D3E]/25 px-3.5 py-1 rounded-full mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#1B4D3E]" />
              <span>Bisrat Hotel Tour</span>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={120} direction="up">
            <h2 className="fluid-section-title font-serif font-bold text-[#1A1C19] mb-3">
              {t.gallery.title}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={240} direction="up">
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              {t.gallery.subtitle}
            </p>
          </ScrollReveal>
        </div>

        {/* Categories Tabs */}
        <ScrollReveal delay={300} direction="up">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1B4D3E] text-white shadow-md border border-[#13382D]'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-[#E8EFE9]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => {
            const imgUrl = getItemImage(item);
            const title = getItemTitle(item);

            return (
              <ScrollReveal
                key={item.id || index}
                delay={100 + (index % 6) * 80}
                direction="up"
                distance={25}
                className="h-full"
              >
                <div
                  onClick={() => handleOpenLightbox(index)}
                  className="group relative cursor-pointer bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-[#E8EFE9] flex flex-col justify-between h-full"
                >
                {/* Image Container with fixed 4:3 aspect ratio and smooth zoom */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-100">
                  <img
                    src={imgUrl}
                    alt={title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center block transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.currentTarget.src = "/images/exterior-building.jpg"; }}
                  />

                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 bg-[#1B4D3E]/85 backdrop-blur-xs text-[#C5A059] border border-[#C5A059]/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize shadow-xs">
                    {item.category}
                  </span>

                  {/* Overlay hover effect */}
                  <div className="absolute inset-0 bg-[#0A1713]/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-5 text-center text-white backdrop-blur-xs">
                    <ZoomIn className="w-8 h-8 text-[#C5A059] mb-2 transform scale-75 group-hover:scale-100 transition-transform duration-300" />
                    <p className="font-serif text-base font-bold text-white leading-snug">{title}</p>
                    {item.description && (
                      <p className="text-xs text-stone-300 line-clamp-2 mt-1 max-w-xs">
                        {item.description}
                      </p>
                    )}
                    <span className="text-[10px] text-[#C5A059] font-bold uppercase tracking-wider mt-3 bg-[#1B4D3E]/80 border border-[#C5A059]/40 px-3 py-1 rounded-full">
                      View High-Res Photo
                    </span>
                  </div>
                </div>

                {/* Card footer description */}
                <div className="p-4 bg-white border-t border-[#E8EFE9]">
                  <h3 className="font-serif font-bold text-sm sm:text-base text-[#1A1C19] group-hover:text-[#1B4D3E] transition-colors truncate">
                    {title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-stone-500 truncate mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E8EFE9] p-8 max-w-md mx-auto">
            <p className="font-serif font-bold text-stone-800 text-base">No photos found in this category</p>
            <p className="text-xs text-stone-500 mt-1">Select "All Photos" to see the full hotel showcase</p>
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className="mt-4 bg-[#1B4D3E] text-white font-bold px-4 py-2 rounded-xl text-xs"
            >
              Show All Photos
            </button>
          </div>
        )}

        {/* Full-Screen Lightbox Modal */}
        {activeLightboxItem && typeof document !== 'undefined' && createPortal(
          <div 
            className="fixed inset-0 z-[9999] bg-[#0A1713]/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in pointer-events-auto"
            onClick={handleCloseLightbox}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseLightbox}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/20 cursor-pointer z-50"
              aria-label="Close photo"
            >
              <X className="w-6 h-6 text-[#C5A059]" />
            </button>

            {/* Navigation Arrows */}
            {filteredItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors border border-[#C5A059]/40 cursor-pointer z-50"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-6 h-6 text-[#C5A059]" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors border border-[#C5A059]/40 cursor-pointer z-50"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-6 h-6 text-[#C5A059]" />
                </button>
              </>
            )}

            {/* Main Modal Content Box */}
            <div 
              className="max-w-4xl w-full text-center space-y-4 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-3xl overflow-hidden border-2 border-[#C5A059]/40 bg-[#0A1713] shadow-2xl relative flex items-center justify-center">
                <img
                  src={getItemImage(activeLightboxItem)}
                  alt={getItemTitle(activeLightboxItem)}
                  className="w-full max-h-[72vh] object-contain"
                  onError={(e) => { e.currentTarget.src = "/images/exterior-building.jpg"; }}
                />
              </div>

              <div className="text-white space-y-1.5 px-4">
                <div className="inline-flex items-center gap-2">
                  <span className="bg-[#1B4D3E] text-[#C5A059] border border-[#C5A059]/40 text-xs font-bold px-3 py-0.5 rounded-full capitalize">
                    {activeLightboxItem.category}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    {activeLightboxIndex + 1} / {filteredItems.length}
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {getItemTitle(activeLightboxItem)}
                </h3>
                {activeLightboxItem.description && (
                  <p className="text-stone-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                    {activeLightboxItem.description}
                  </p>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      </div>
    </section>
  );
}
