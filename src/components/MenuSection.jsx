import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Wine, 
  Beer, 
  Pizza, 
  Sandwich, 
  Drumstick, 
  UtensilsCrossed, 
  Flame, 
  Soup, 
  Salad, 
  Fish, 
  Egg, 
  Citrus, 
  Coffee, 
  Search, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Camera, 
  Copy, 
  Check, 
  SlidersHorizontal,
  Layers,
  Sparkle
} from 'lucide-react';
import { CATEGORY_CONFIG } from '../data/menuData';
import { translations } from '../translations';

// Map category icons safely
const ICON_MAP = {
  Wine,
  Beer,
  Pizza,
  Sandwich,
  Drumstick,
  UtensilsCrossed,
  Flame,
  Soup,
  Salad,
  Fish,
  Egg,
  Citrus,
  Coffee
};

export default function MenuSection({ 
  menuItems = [], 
  photos = {}, 
  lang = 'en' 
}) {
  const t = translations[lang] || translations.en;

  // Search & Active Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Collapsible Accordion State: record which category IDs are expanded
  // Default: start with the first 4 popular categories open for immediate visual appeal
  const [expandedCategories, setExpandedCategories] = useState(() => {
    return {
      traditional: true,
      pizza: true,
      burger: true,
      chicken: true
    };
  });

  // Lightbox Modal State for Full-Screen Dish Photo
  const [lightboxItem, setLightboxItem] = useState(null);
  const [isCopiedPrompt, setIsCopiedPrompt] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Available items (only show isAvailable === true items on public menu)
  const availableItems = useMemo(() => {
    return menuItems.filter(item => item.isAvailable !== false);
  }, [menuItems]);

  // Group available items by category
  const itemsByCategory = useMemo(() => {
    const grouped = {};
    CATEGORY_CONFIG.forEach(cat => {
      grouped[cat.id] = [];
    });
    availableItems.forEach(item => {
      const catKey = item.category || 'traditional';
      if (!grouped[catKey]) {
        grouped[catKey] = [];
      }
      grouped[catKey].push(item);
    });
    return grouped;
  }, [availableItems]);

  // Filtered items by search query
  const filteredCategoryItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = {};

    CATEGORY_CONFIG.forEach(cat => {
      let items = itemsByCategory[cat.id] || [];

      if (query) {
        items = items.filter(item => {
          const nameStr = (
            (item.nameEn || '') + ' ' + 
            (item.nameAm || '') + ' ' + 
            (item.nameOr || '') + ' ' + 
            (item.description || '')
          ).toLowerCase();
          return nameStr.includes(query);
        });
      }

      result[cat.id] = items;
    });

    return result;
  }, [itemsByCategory, searchQuery]);

  // Total count of matching items
  const totalMatchingItems = useMemo(() => {
    return Object.values(filteredCategoryItems).reduce((sum, list) => sum + list.length, 0);
  }, [filteredCategoryItems]);

  // Auto-expand categories when user types a search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const newExpanded = {};
      CATEGORY_CONFIG.forEach(cat => {
        if ((filteredCategoryItems[cat.id] || []).length > 0) {
          newExpanded[cat.id] = true;
        }
      });
      setExpandedCategories(newExpanded);
    }
  }, [searchQuery, filteredCategoryItems]);

  // Accordion Toggle
  const toggleCategory = useCallback((categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  }, []);

  // Expand All / Collapse All
  const handleExpandAll = useCallback(() => {
    const allExpanded = {};
    CATEGORY_CONFIG.forEach(cat => {
      allExpanded[cat.id] = true;
    });
    setExpandedCategories(allExpanded);
  }, []);

  const handleCollapseAll = useCallback(() => {
    setExpandedCategories({});
  }, []);

  // Open Lightbox Modal with Browser History Support (Back button closes modal)
  const openLightbox = useCallback((item) => {
    setImageLoading(true);
    setIsCopiedPrompt(false);
    setLightboxItem(item);

    // Push state so mobile back button closes the lightbox
    try {
      window.history.pushState({ bisratModal: 'lightbox', itemId: item.id }, '');
    } catch (e) {
      // ignore
    }
  }, []);

  // Close Lightbox Modal
  const closeLightbox = useCallback(() => {
    setLightboxItem(null);
    setIsCopiedPrompt(false);
  }, []);

  // Handle browser back button (popstate) & keyboard Escape / Arrow navigation
  useEffect(() => {
    const handlePopState = (e) => {
      if (lightboxItem) {
        closeLightbox();
      }
    };

    const handleKeyDown = (e) => {
      if (!lightboxItem) return;

      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        navigateDish(1);
      } else if (e.key === 'ArrowLeft') {
        navigateDish(-1);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxItem, closeLightbox]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxItem) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [lightboxItem]);

  // Navigate to previous or next dish in current category / menu
  const navigateDish = useCallback((direction) => {
    if (!lightboxItem) return;

    // Get current active category list or flat list
    const currentCatList = filteredCategoryItems[lightboxItem.category] || availableItems;
    if (currentCatList.length <= 1) return;

    const currentIndex = currentCatList.findIndex(i => i.id === lightboxItem.id);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = currentCatList.length - 1;
    if (nextIndex >= currentCatList.length) nextIndex = 0;

    const nextItem = currentCatList[nextIndex];
    setImageLoading(true);
    setIsCopiedPrompt(false);
    setLightboxItem(nextItem);
  }, [lightboxItem, filteredCategoryItems, availableItems]);

  // Copy AI Prompt
  const handleCopyPrompt = useCallback((promptText) => {
    if (!promptText) return;
    navigator.clipboard.writeText(promptText).then(() => {
      setIsCopiedPrompt(true);
      setTimeout(() => setIsCopiedPrompt(false), 2500);
    }).catch(() => {
      // fallback
    });
  }, []);

  // Helper to get image URL for an item
  const getItemImage = useCallback((item) => {
    if (!item) return null;
    return photos?.[item.placeholderSlot] || item.customImage || item.imageUrl || null;
  }, [photos]);

  return (
    <section id="menu-section" className="py-10 sm:py-16 bg-[#FAF7F0] min-h-screen text-slate-800">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#977227] bg-[#FAF2E1] border border-[#C8A24A]/40 px-3.5 py-1 rounded-full mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C8A24A]" />
            <span>Bisrat Hotel Gourmet Dining</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-3 tracking-tight">
            {t.menu.title}
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            {t.menu.subtitle}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs font-semibold text-stone-500">
            <span>102 Gourmet Dishes & Beverages</span>
            <span>•</span>
            <span className="text-[#977227]">Tap any item to view photo full-screen</span>
          </div>
        </div>

        {/* Sticky-Aware Controls: Search & Category Navigation Bar */}
        <div className="sticky top-16 sm:top-20 z-20 bg-[#FAF7F0]/95 backdrop-blur-md py-3 mb-6 border-y border-[#E8DFD0] -mx-3 px-3 sm:mx-0 sm:px-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Real-Time Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.menu.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#DDD5C5] rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C8A24A] shadow-xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 rounded-full"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Actions: Expand All / Collapse All */}
            <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-bold shrink-0">
              <span className="text-stone-500 text-[11px] font-mono sm:hidden">
                {totalMatchingItems} {t.menu.itemCount || 'items'}
              </span>
              
              <div className="flex items-center gap-1.5 bg-[#F0E9DC] p-1 rounded-xl border border-[#DDD5C5]">
                <button
                  type="button"
                  onClick={handleExpandAll}
                  className="px-2.5 py-1 rounded-lg text-stone-700 hover:bg-white hover:text-stone-900 transition-colors text-[11px] font-semibold"
                >
                  {t.menu.expandAll || 'Expand All'}
                </button>
                <span className="text-stone-300">|</span>
                <button
                  type="button"
                  onClick={handleCollapseAll}
                  className="px-2.5 py-1 rounded-lg text-stone-700 hover:bg-white hover:text-stone-900 transition-colors text-[11px] font-semibold"
                >
                  {t.menu.collapseAll || 'Collapse All'}
                </button>
              </div>
            </div>

          </div>

          {/* Quick Category Filter Pills (Horizontal Scroll on Mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3 pb-1">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                handleExpandAll();
              }}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-[#977227] text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-[#F0E9DC] border border-[#DDD5C5]'
              }`}
            >
              {t.menu.all} ({availableItems.length})
            </button>

            {CATEGORY_CONFIG.map((cat) => {
              const count = (itemsByCategory[cat.id] || []).length;
              const isSelected = selectedCategory === cat.id;
              const catName = lang === 'am' ? cat.nameAm : lang === 'or' ? cat.nameOr : cat.nameEn;
              const IconComp = ICON_MAP[cat.icon] || UtensilsCrossed;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setExpandedCategories({ [cat.id]: true });
                    const el = document.getElementById(`cat-${cat.id}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-[#977227] text-white shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-[#F0E9DC] border border-[#DDD5C5]'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{catName}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 13 Collapsible Sections */}
        <div className="space-y-4 sm:space-y-6">
          {CATEGORY_CONFIG
            .filter(cat => selectedCategory === 'all' || selectedCategory === cat.id)
            .map((cat) => {
              const items = filteredCategoryItems[cat.id] || [];
              const isExpanded = !!expandedCategories[cat.id];
              const IconComp = ICON_MAP[cat.icon] || UtensilsCrossed;
              const catName = lang === 'am' ? cat.nameAm : lang === 'or' ? cat.nameOr : cat.nameEn;
              const secondaryCatName = lang !== 'en' ? cat.nameEn : cat.nameAm;

              // If searching and this category has no matches, hide it
              if (searchQuery.trim() && items.length === 0) {
                return null;
              }

              return (
                <div
                  key={cat.id}
                  id={`cat-${cat.id}`}
                  className="bg-white rounded-2xl border border-[#E8DFD0] overflow-hidden shadow-xs transition-shadow hover:shadow-md"
                >
                  {/* Collapsible Category Header Button */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    aria-expanded={isExpanded}
                    className="w-full px-4 sm:px-6 py-4 flex items-center justify-between text-left bg-gradient-to-r from-[#FDFBF7] to-white hover:from-[#F7F2E7] transition-all border-b border-[#E8DFD0]/60 focus:outline-none focus:ring-2 focus:ring-[#C8A24A]/40"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#FAF2E1] border border-[#C8A24A]/30 flex items-center justify-center text-[#977227] shrink-0 shadow-2xs">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-serif font-bold text-lg sm:text-xl text-stone-900 tracking-tight">
                            {catName}
                          </h2>
                          {secondaryCatName && (
                            <span className="text-xs text-stone-400 font-medium">
                              ({secondaryCatName})
                            </span>
                          )}
                          <span className="bg-[#FAF2E1] text-[#977227] border border-[#C8A24A]/30 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full">
                            {items.length} {t.menu.itemCount || 'items'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 font-normal truncate mt-0.5">
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3 text-stone-500">
                      <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline text-stone-400">
                        {isExpanded ? 'Collapse' : 'Expand'}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-[#FAF7F0] border border-[#E8DFD0] flex items-center justify-center text-stone-600 transition-transform duration-300">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#977227]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-stone-500" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Collapsible Section Body: Compact Dot-Leader Rows */}
                  {isExpanded && (
                    <div className="divide-y divide-[#F0EBE0] bg-white p-2 sm:p-4">
                      {items.length > 0 ? (
                        <div className="grid grid-cols-1 gap-1">
                          {items.map((item) => {
                            const displayName = lang === 'am' ? item.nameAm : lang === 'or' ? item.nameOr : item.nameEn;
                            const secondaryName = lang !== 'en' ? item.nameEn : item.nameAm;
                            const itemThumb = getItemImage(item);

                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => openLightbox(item)}
                                className="w-full text-left group flex items-center justify-between py-2.5 px-3 sm:px-4 rounded-xl hover:bg-[#FAF6EE] transition-all border border-transparent hover:border-[#E8DFD0] focus:outline-none focus:ring-2 focus:ring-[#C8A24A]/40"
                              >
                                {/* Dish Name Column */}
                                <div className="flex flex-col min-w-0 pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-serif font-bold text-sm sm:text-base text-stone-900 group-hover:text-[#977227] transition-colors truncate">
                                      {displayName}
                                    </span>
                                  </div>
                                  {secondaryName && secondaryName !== displayName && (
                                    <span className="text-[11px] text-stone-500 truncate leading-tight font-medium">
                                      {secondaryName}
                                    </span>
                                  )}
                                </div>

                                {/* Responsive Dotted Leader Line */}
                                <span 
                                  className="flex-1 mx-2.5 border-b-2 border-dotted border-stone-300/80 group-hover:border-[#C8A24A]/60 transition-colors mb-1 min-w-[24px]" 
                                  aria-hidden="true" 
                                />

                                {/* Price in ETB & Small Thumbnail Icon at Row End */}
                                <div className="flex items-center gap-2.5 shrink-0 pl-1">
                                  <div className="font-mono font-bold text-xs sm:text-sm text-[#977227] bg-[#FAF2E1] px-2.5 py-1 rounded-lg border border-[#C8A24A]/30 shadow-2xs group-hover:bg-[#977227] group-hover:text-white transition-all">
                                    {item.price} <span className="text-[10px] font-sans font-semibold uppercase">{t.menu.currency}</span>
                                  </div>

                                  {/* Small Thumbnail Icon at End of Row */}
                                  <div 
                                    className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden bg-stone-100 border border-stone-300 group-hover:border-[#C8A24A] group-hover:scale-105 transition-all flex items-center justify-center shrink-0 shadow-2xs"
                                    title="Tap to open dish photo full-screen"
                                  >
                                    {itemThumb ? (
                                      <img
                                        src={itemThumb}
                                        alt=""
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Camera className="w-4 h-4 text-stone-400 group-hover:text-[#977227] transition-colors" />
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-xs text-stone-500 font-medium">
                          {t.menu.noItems}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

          {/* Empty Search State */}
          {totalMatchingItems === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#E8DFD0] max-w-md mx-auto p-6 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-[#FAF2E1] border border-[#C8A24A]/30 flex items-center justify-center text-[#977227] mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-lg mb-1">
                No menu items found
              </h3>
              <p className="text-stone-500 text-xs sm:text-sm mb-4">
                We couldn't find any dishes or drinks matching &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="bg-[#977227] hover:bg-[#836220] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors"
              >
                Clear Search Filter
              </button>
            </div>
          )}
        </div>

      </div>

      {/* FULL-SCREEN LIGHTBOX MODAL */}
      {lightboxItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-dish-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={(e) => {
            // Tap outside modal content closes the lightbox
            if (e.target === e.currentTarget) {
              closeLightbox();
            }
          }}
        >
          {/* Modal Container */}
          <div 
            className="relative bg-[#1A1A1A] text-white border border-stone-700/80 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Bar */}
            <div className="sticky top-0 z-30 flex items-center justify-between p-3.5 sm:p-4 bg-gradient-to-b from-[#1A1A1A] via-[#1A1A1A]/95 to-transparent">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-400">
                <span className="capitalize px-2.5 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-stone-300">
                  {lightboxItem.category.replace('_', ' ')}
                </span>
                <span>•</span>
                <span>Bisrat Hotel Dining</span>
              </div>

              <button
                type="button"
                onClick={closeLightbox}
                className="w-8 h-8 rounded-full bg-stone-800/90 hover:bg-stone-700 text-stone-200 flex items-center justify-center transition-colors border border-stone-600 focus:outline-none focus:ring-2 focus:ring-[#C8A24A]"
                aria-label="Close photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* High-Resolution Dish Photo View (Full-Screen / Plated Food Only) */}
            <div className="relative w-full aspect-[16/11] sm:aspect-[16/10] bg-stone-900 overflow-hidden group">
              {imageLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900 text-stone-500 animate-pulse">
                  <Camera className="w-10 h-10 mb-2 opacity-40" />
                  <span className="text-xs font-mono">Loading full-res dish photo...</span>
                </div>
              )}

              {getItemImage(lightboxItem) ? (
                <img
                  src={getItemImage(lightboxItem)}
                  alt={lightboxItem.nameEn}
                  loading="eager"
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                  className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-stone-800 text-stone-400 p-6 text-center">
                  <Camera className="w-12 h-12 text-[#C8A24A] mb-2" />
                  <p className="text-sm font-semibold text-stone-300">Photo Ready for Upload</p>
                  <p className="text-xs text-stone-500 mt-1 font-mono">[{lightboxItem.placeholderSlot}]</p>
                </div>
              )}

              {/* Prev / Next Navigation Controls */}
              <button
                type="button"
                onClick={() => navigateDish(-1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-xs flex items-center justify-center border border-white/20 transition-all shadow-md"
                aria-label="Previous dish"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => navigateDish(1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-xs flex items-center justify-center border border-white/20 transition-all shadow-md"
                aria-label="Next dish"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Dish Information Content */}
            <div className="p-5 sm:p-6 space-y-4">
              
              {/* Title & Price Header */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-stone-800 pb-4">
                <div>
                  <h3 id="lightbox-dish-title" className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {lang === 'am' ? lightboxItem.nameAm : lang === 'or' ? lightboxItem.nameOr : lightboxItem.nameEn}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#D8B96D] font-medium">
                    <span>{lightboxItem.nameEn}</span>
                    <span>•</span>
                    <span>{lightboxItem.nameAm}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <div className="bg-[#FAF2E1] text-[#977227] px-3.5 py-1.5 rounded-xl font-mono font-bold text-base sm:text-lg border border-[#C8A24A]/40 shadow-xs">
                    {lightboxItem.price} <span className="text-xs font-sans uppercase">{t.menu.currency}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {lightboxItem.description && (
                <p className="text-sm text-stone-300 leading-relaxed">
                  {lightboxItem.description}
                </p>
              )}

              {/* AI Image Generation Prompt Card */}
              {lightboxItem.aiPrompt && (
                <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3.5 sm:p-4 text-xs">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#D8B96D]">
                      <Sparkles className="w-3.5 h-3.5 text-[#C8A24A]" />
                      <span>{t.menu.aiPromptLabel || 'AI Photography Prompt'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(lightboxItem.aiPrompt)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                        isCopiedPrompt
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                      }`}
                    >
                      {isCopiedPrompt ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>{t.menu.promptCopied || 'Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{t.menu.copyPrompt || 'Copy Prompt'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="font-mono text-[11px] text-stone-400 bg-black/40 p-2.5 rounded-xl border border-stone-800/80 leading-relaxed select-all">
                    &ldquo;{lightboxItem.aiPrompt}&rdquo;
                  </p>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-2 flex items-center justify-between text-xs text-stone-400 border-t border-stone-800/60">
                <span className="text-[11px]">
                  Use <kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-stone-300 border border-stone-700 font-mono">Esc</kbd> or tap outside to close
                </span>

                <button
                  type="button"
                  onClick={closeLightbox}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-4 py-2 rounded-xl text-xs font-bold transition-colors border border-stone-700"
                >
                  {t.menu.closePhoto || 'Close'}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </section>
  );
}
