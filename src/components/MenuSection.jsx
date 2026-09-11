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
  CheckCircle2,
  Utensils,
  ShoppingBag,
  Plus,
  Minus,
  LayoutGrid,
  List,
  PhoneCall
} from 'lucide-react';
import { CATEGORY_CONFIG } from '../data/menuData';
import { translations } from '../translations';
import CustomerPaymentDrawer from './CustomerPaymentDrawer';

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
  paymentSettings = {},
  lang = 'en' 
}) {
  const t = translations[lang] || translations.en;

  // Search & Active Category Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Layout View Mode: 'grid' (rich dish cards with centered images) or 'list' (compact dot leader)
  const [layoutMode, setLayoutMode] = useState('grid');

  // Collapsible Accordion State
  const [expandedCategories, setExpandedCategories] = useState(() => {
    return {
      traditional: true,
      pizza: true,
      burger: true,
      chicken: true,
      fish: true,
      pasta: true
    };
  });

  // Lightbox Modal State for Full-Screen Dish Photo (100% React state, NO history manipulation)
  const [lightboxItem, setLightboxItem] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);

  // Customer Order State (Live dining cart)
  const [orderItems, setOrderItems] = useState(() => {
    try {
      const saved = localStorage.getItem('bisrat_customer_order');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('bisrat_customer_order', JSON.stringify(orderItems));
    } catch (e) {}
  }, [orderItems]);

  // Available items (only show isAvailable !== false items on public menu)
  const availableItems = useMemo(() => {
    return menuItems.filter(item => item && item.isAvailable !== false);
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
  const toggleCategory = useCallback((categoryId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  }, []);

  // Expand All / Collapse All
  const handleExpandAll = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault();
    const allExpanded = {};
    CATEGORY_CONFIG.forEach(cat => {
      allExpanded[cat.id] = true;
    });
    setExpandedCategories(allExpanded);
  }, []);

  const handleCollapseAll = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault();
    const allCollapsed = {};
    CATEGORY_CONFIG.forEach(cat => {
      allCollapsed[cat.id] = false;
    });
    setExpandedCategories(allCollapsed);
  }, []);

  // Category Selection Handler (Instant filter, accordion expand & smooth scroll)
  const handleSelectCategory = useCallback((catId) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      const allExpanded = {};
      CATEGORY_CONFIG.forEach(cat => {
        allExpanded[cat.id] = true;
      });
      setExpandedCategories(allExpanded);
    } else {
      setExpandedCategories(prev => ({
        ...prev,
        [catId]: true
      }));
      setTimeout(() => {
        const el = document.getElementById(`cat-${catId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  }, []);

  // Helper to get image URL for an item
  const getItemImage = useCallback((item) => {
    if (!item) return null;
    return item.imageUrl || item.image_url || item.customImage || photos?.[item.placeholderSlot] || photos?.[item.id] || null;
  }, [photos]);

  // Open Lightbox Modal
  const openLightbox = useCallback((item, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!item) return;
    setImageLoading(true);
    setLightboxItem(item);
  }, []);

  // Close Lightbox Modal
  const closeLightbox = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setLightboxItem(null);
  }, []);

  // Keyboard Escape & Arrow navigation for the lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxItem) return;

      if (e.key === 'Escape') {
        closeLightbox(e);
      } else if (e.key === 'ArrowRight') {
        navigateDish(1, e);
      } else if (e.key === 'ArrowLeft') {
        navigateDish(-1, e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
  const navigateDish = useCallback((direction, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!lightboxItem) return;

    const currentCatList = filteredCategoryItems[lightboxItem.category] || availableItems;
    if (currentCatList.length <= 1) return;

    const currentIndex = currentCatList.findIndex(i => i.id === lightboxItem.id);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = currentCatList.length - 1;
    if (nextIndex >= currentCatList.length) nextIndex = 0;

    const nextItem = currentCatList[nextIndex];
    setImageLoading(true);
    setLightboxItem(nextItem);
  }, [lightboxItem, filteredCategoryItems, availableItems]);

  // Customer Order Handlers
  const handleAddToOrder = useCallback((item, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const displayName = lang === 'am' ? item.nameAm : lang === 'or' ? item.nameOr : item.nameEn;
    const thumb = getItemImage(item);

    setOrderItems(prev => {
      const existing = prev.find(o => o.id === item.id);
      if (existing) {
        return prev.map(o => o.id === item.id ? { ...o, quantity: (o.quantity || 1) + 1 } : o);
      }
      return [...prev, {
        id: item.id,
        nameEn: item.nameEn,
        displayName: displayName || item.nameEn,
        price: Number(item.price) || 0,
        imageUrl: thumb,
        quantity: 1,
        category: item.category
      }];
    });
  }, [lang, getItemImage]);

  const handleUpdateQuantity = useCallback((id, delta) => {
    setOrderItems(prev => {
      return prev
        .map(o => o.id === id ? { ...o, quantity: (o.quantity || 1) + delta } : o)
        .filter(o => o.quantity > 0);
    });
  }, []);

  const handleClearOrder = useCallback(() => {
    setOrderItems([]);
  }, []);

  const totalOrderCount = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [orderItems]);

  const totalOrderPrice = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  }, [orderItems]);

  return (
    <section id="menu-section" className="py-10 sm:py-16 bg-[#F9FAF7] min-h-screen text-[#1C1917]">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1B4D3E] bg-[#1B4D3E]/10 border border-[#1B4D3E]/25 px-3.5 py-1 rounded-full mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#1B4D3E]" />
            <span>Bisrat Hotel Gourmet Dining</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#1A1C19] mb-3 tracking-tight">
            {t.menu.title}
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            {t.menu.subtitle}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs font-semibold text-stone-500">
            <span>102 Dishes & Beverages</span>
            <span>•</span>
            <span className="text-[#1B4D3E] font-bold">Tap any photo for full-screen view • Order directly to your table</span>
          </div>
        </div>

        {/* Sticky Controls: Search, Layout Toggle & Category Navigation Bar */}
        <div className="sticky top-16 sm:top-20 z-20 bg-[#FDFCF7]/95 backdrop-blur-md py-3 mb-6 border-y border-[#E8EFE9] -mx-3 px-3 sm:mx-0 sm:px-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Real-Time Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.menu.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#E8EFE9] rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-[#1A1C19] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1B4D3E] shadow-2xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 rounded-full cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Actions: Grid/List Toggle & Expand/Collapse */}
            <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-bold shrink-0">
              
              {/* Layout Switcher (Grid Cards vs Compact List) */}
              <div className="flex items-center bg-stone-200/80 p-1 rounded-xl border border-[#E8EFE9]">
                <button
                  type="button"
                  onClick={() => setLayoutMode('grid')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer ${
                    layoutMode === 'grid' 
                      ? 'bg-white text-[#1B4D3E] shadow-xs' 
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Grid Card View (Centered Food Photography)"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('list')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer ${
                    layoutMode === 'list' 
                      ? 'bg-white text-[#1B4D3E] shadow-xs' 
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>

              {/* Expand All / Collapse All */}
              <div className="flex items-center gap-1.5 bg-stone-200/80 p-1 rounded-xl border border-[#E8EFE9]">
                <button
                  type="button"
                  onClick={handleExpandAll}
                  className="px-2.5 py-1 rounded-lg text-stone-700 hover:bg-white hover:text-stone-900 transition-colors text-[11px] font-semibold cursor-pointer"
                >
                  {t.menu.expandAll || 'Expand All'}
                </button>
                <span className="text-stone-400">|</span>
                <button
                  type="button"
                  onClick={handleCollapseAll}
                  className="px-2.5 py-1 rounded-lg text-stone-700 hover:bg-white hover:text-stone-900 transition-colors text-[11px] font-semibold cursor-pointer"
                >
                  {t.menu.collapseAll || 'Collapse All'}
                </button>
              </div>

            </div>

          </div>

          {/* Quick Category Filter Pills (Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3 pb-1">
            <button
              type="button"
              onClick={() => handleSelectCategory('all')}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#1B4D3E] text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-[#E8EFE9]'
              }`}
            >
              {t.menu.all || 'All Categories'} ({availableItems.length})
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
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#1B4D3E] text-white shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-[#E8EFE9]'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{catName}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter Pill / "See All" Reset Action Bar */}
        {selectedCategory !== 'all' && (
          <div className="flex items-center justify-between bg-white border border-[#E8EFE9] px-4 py-2.5 rounded-2xl mb-6 shadow-2xs animate-fade-in">
            <span className="text-xs font-semibold text-stone-700">
              Showing category: <strong className="text-[#1B4D3E] font-bold capitalize">
                {CATEGORY_CONFIG.find(c => c.id === selectedCategory)?.nameEn || selectedCategory}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => handleSelectCategory('all')}
              className="text-xs font-bold text-[#1B4D3E] hover:text-[#163E32] bg-[#1B4D3E]/10 hover:bg-[#1B4D3E]/20 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>See All Categories</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 13 Collapsible Sections */}
        <div className="space-y-6">
          {CATEGORY_CONFIG
            .filter(cat => selectedCategory === 'all' || selectedCategory === cat.id)
            .map((cat) => {
              const items = filteredCategoryItems[cat.id] || [];
              const isExpanded = !!expandedCategories[cat.id];
              const IconComp = ICON_MAP[cat.icon] || UtensilsCrossed;
              const catName = lang === 'am' ? cat.nameAm : lang === 'or' ? cat.nameOr : cat.nameEn;
              const secondaryCatName = lang !== 'en' ? cat.nameEn : cat.nameAm;

              if (searchQuery.trim() && items.length === 0) {
                return null;
              }

              return (
                <div
                  key={cat.id}
                  id={`cat-${cat.id}`}
                  className="bg-white rounded-3xl border border-[#E8EFE9] overflow-hidden shadow-xs transition-shadow hover:shadow-sm"
                >
                  {/* Collapsible Category Header Button */}
                  <button
                    type="button"
                    onClick={(e) => toggleCategory(cat.id, e)}
                    aria-expanded={isExpanded}
                    className="w-full px-4 sm:px-6 py-4 flex items-center justify-between text-left bg-gradient-to-r from-stone-50 to-white hover:from-stone-100 transition-all border-b border-[#E8EFE9] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/30 cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-[#1B4D3E]/10 border border-[#1B4D3E]/20 flex items-center justify-center text-[#1B4D3E] shrink-0 shadow-2xs">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-serif font-bold text-lg sm:text-xl text-[#1A1C19] tracking-tight">
                            {catName}
                          </h2>
                          {secondaryCatName && (
                            <span className="text-xs text-stone-400 font-medium">
                              ({secondaryCatName})
                            </span>
                          )}
                          <span className="bg-[#1B4D3E]/10 text-[#1B4D3E] border border-[#1B4D3E]/20 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full">
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
                      <div className="w-7 h-7 rounded-full bg-stone-100 border border-[#E8EFE9] flex items-center justify-center text-stone-600 transition-transform duration-300">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#1B4D3E]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-stone-500" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Section Body */}
                  {isExpanded && (
                    <div className="p-3 sm:p-5">
                      {items.length > 0 ? (
                        
                        /* ======================================================= */
                        /* MODE A: GRID CARD VIEW (Centered Image Fix & Order CTA) */
                        /* ======================================================= */
                        layoutMode === 'grid' ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                            {items.map((item) => {
                              const displayName = lang === 'am' ? item.nameAm : lang === 'or' ? item.nameOr : item.nameEn;
                              const secondaryName = lang !== 'en' ? item.nameEn : item.nameAm;
                              const itemThumb = getItemImage(item);
                              const inCartItem = orderItems.find(o => o.id === item.id);
                              const cartQty = inCartItem?.quantity || 0;

                              return (
                                <div
                                  key={item.id}
                                  className="group bg-white rounded-2xl border border-[#E8EFE9] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                  {/* Dish Image Container (Uniform 180px height & centered crop fix) */}
                                  <div 
                                    className="dish-card-img-wrapper relative cursor-pointer group-hover:opacity-95 transition-opacity bg-stone-100 flex items-center justify-center"
                                    onClick={(e) => openLightbox(item, e)}
                                    title="Click to view full-screen dish photo"
                                  >
                                    {itemThumb ? (
                                      <img
                                        src={itemThumb}
                                        alt={displayName}
                                        loading="lazy"
                                        decoding="async"
                                        className="transition-transform duration-500 group-hover:scale-105"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400 p-4 text-center">
                                        <Utensils className="w-8 h-8 text-[#1B4D3E] mb-1 opacity-40" />
                                        <span className="text-[11px] font-semibold text-stone-400">Bisrat Signature Dish</span>
                                      </div>
                                    )}

                                    {/* Category Pill Tag */}
                                    <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize">
                                      {item.category?.replace('_', ' ')}
                                    </span>

                                    {/* Tap to expand photo hint */}
                                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] shadow-sm">
                                      <Camera className="w-3 h-3 text-[#C5A059]" />
                                      <span>Full Photo</span>
                                    </div>
                                  </div>

                                  {/* Card Content & Details */}
                                  <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                                    <div>
                                      <div className="flex items-start justify-between gap-2">
                                        <h3 
                                          onClick={(e) => openLightbox(item, e)}
                                          className="font-serif font-bold text-base text-[#1A1C19] group-hover:text-[#1B4D3E] transition-colors line-clamp-1 cursor-pointer"
                                        >
                                          {displayName}
                                        </h3>
                                      </div>
                                      {secondaryName && secondaryName !== displayName && (
                                        <p className="text-xs text-stone-700 font-semibold truncate mt-0.5">
                                          {secondaryName}
                                        </p>
                                      )}
                                      {item.description && (
                                        <p className="text-xs text-[#2D312E] line-clamp-2 mt-1.5 leading-relaxed font-normal">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>

                                    {/* Price and Order CTA Button */}
                                    <div className="flex items-center justify-between pt-3 border-t border-[#E8EFE9]">
                                      <span className="font-mono font-bold text-sm sm:text-base text-[#1B4D3E] bg-[#1B4D3E]/10 border border-[#1B4D3E]/25 px-2.5 py-1 rounded-xl">
                                        {item.price} <span className="text-[10px] font-sans font-bold text-[#1A1C19]">ETB</span>
                                      </span>

                                      {/* Order Now CTA Button in Warm Champagne Gold #C5A059 with #1A1C19 text */}
                                      <button
                                        type="button"
                                        onClick={(e) => handleAddToOrder(item, e)}
                                        className="bg-[#C5A059] hover:bg-[#B08B42] text-[#1A1C19] font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs border border-[#C5A059] transition-all active:scale-95 hover:shadow-sm cursor-pointer"
                                        title="Add to dining order"
                                      >
                                        <ShoppingBag className="w-3.5 h-3.5 text-[#1A1C19]" />
                                        <span>{cartQty > 0 ? `Ordered (${cartQty})` : 'Order Now'}</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          
                          /* ======================================================= */
                          /* MODE B: COMPACT LIST VIEW (With Centered Thumbnails)     */
                          /* ======================================================= */
                          <div className="divide-y divide-stone-100">
                            {items.map((item) => {
                              const displayName = lang === 'am' ? item.nameAm : lang === 'or' ? item.nameOr : item.nameEn;
                              const secondaryName = lang !== 'en' ? item.nameEn : item.nameAm;
                              const itemThumb = getItemImage(item);
                              const inCartItem = orderItems.find(o => o.id === item.id);
                              const cartQty = inCartItem?.quantity || 0;

                              return (
                                <div
                                  key={item.id}
                                  className="w-full group flex items-center justify-between py-3 px-2 sm:px-4 rounded-xl hover:bg-stone-50 transition-all"
                                >
                                  {/* Dish Name & Subtitle */}
                                  <div 
                                    className="flex flex-col min-w-0 pr-2 cursor-pointer flex-1"
                                    onClick={(e) => openLightbox(item, e)}
                                  >
                                    <span className="font-serif font-bold text-sm sm:text-base text-[#1A1C19] group-hover:text-[#1B4D3E] transition-colors truncate">
                                      {displayName}
                                    </span>
                                    {secondaryName && secondaryName !== displayName && (
                                      <span className="text-[11px] text-stone-500 truncate leading-tight font-medium">
                                        {secondaryName}
                                      </span>
                                    )}
                                  </div>

                                  {/* Dotted Leader Line */}
                                  <span 
                                    className="hidden sm:inline-block flex-1 mx-3 border-b border-dotted border-stone-300 group-hover:border-[#1B4D3E]/40 transition-colors mb-1 min-w-[24px]" 
                                    aria-hidden="true" 
                                  />

                                  {/* Price, Centered Image Thumbnail, and Order Button */}
                                  <div className="flex items-center gap-3 shrink-0 pl-2">
                                    <div className="font-mono font-bold text-xs sm:text-sm text-[#1B4D3E] bg-[#1B4D3E]/10 px-2.5 py-1 rounded-lg border border-[#1B4D3E]/20">
                                      {item.price} <span className="text-[10px] font-sans uppercase">ETB</span>
                                    </div>

                                    {/* Centered Square Thumbnail */}
                                    <div 
                                      className="relative w-10 h-10 rounded-xl overflow-hidden bg-stone-100 border border-[#E8EFE9] cursor-pointer group-hover:border-[#1B4D3E] transition-all flex items-center justify-center shrink-0 shadow-2xs"
                                      onClick={(e) => openLightbox(item, e)}
                                      title="Tap to open full photo"
                                      style={{ width: '40px', height: '40px', overflow: 'hidden' }}
                                    >
                                      {itemThumb ? (
                                        <img
                                          src={itemThumb}
                                          alt=""
                                          loading="lazy"
                                          className="w-full h-full object-cover object-center block"
                                          style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            objectPosition: 'center center',
                                            display: 'block'
                                          }}
                                        />
                                      ) : (
                                        <Camera className="w-4 h-4 text-stone-400 group-hover:text-[#1B4D3E]" />
                                      )}
                                    </div>

                                    {/* Order Button */}
                                    <button
                                      type="button"
                                      onClick={(e) => handleAddToOrder(item, e)}
                                      className="bg-[#C5A059] hover:bg-[#B08B42] text-[#1A1C19] font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-2xs border border-[#C5A059] cursor-pointer"
                                      title="Add to dining order"
                                    >
                                      <Plus className="w-3.5 h-3.5 text-[#1A1C19]" />
                                      <span>{cartQty > 0 ? `+${cartQty}` : 'Add'}</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )

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
            <div className="text-center py-16 bg-white rounded-3xl border border-[#E8EFE9] max-w-md mx-auto p-6 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-[#1B4D3E]/10 border border-[#1B4D3E]/30 flex items-center justify-center text-[#1B4D3E] mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-[#1A1C19] text-lg mb-1">
                No menu items found
              </h3>
              <p className="text-stone-500 text-xs sm:text-sm mb-4">
                We couldn't find any dishes or drinks matching &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setSearchQuery('');
                }}
                className="bg-[#1B4D3E] hover:bg-[#163E32] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
              >
                Clear Search Filter
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ======================================================== */}
      {/* FLOATING ORDER BAR (Warm Champagne Gold #C5A059 CTA)      */}
      {/* ======================================================== */}
      {totalOrderCount > 0 && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md animate-bounce-short">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="w-full bg-[#C5A059] hover:bg-[#B08B42] text-[#1A1C19] font-bold px-5 py-3.5 rounded-2xl shadow-2xl border border-[#C5A059] flex items-center justify-between transition-transform active:scale-95 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#1B4D3E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {totalOrderCount}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-[#1A1C19]">
                  View Dining Order
                </p>
                <p className="text-[11px] text-stone-800">
                  {totalOrderCount} item{totalOrderCount > 1 ? 's' : ''} in cart
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="font-mono font-bold text-sm sm:text-base text-[#1A1C19]">
                {totalOrderPrice.toLocaleString()} ETB
              </span>
              <span className="bg-[#1B4D3E] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs">
                Order Now →
              </span>
            </div>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* FULL-SCREEN LIGHTBOX MODAL (Centered Image & Order CTA)  */}
      {/* ======================================================== */}
      {lightboxItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-dish-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeLightbox(e);
            }
          }}
        >
          {/* Modal Container */}
          <div 
            className="relative bg-[#1A1C19] text-white border border-stone-700 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="sticky top-0 z-30 flex items-center justify-between p-3.5 sm:p-4 bg-gradient-to-b from-[#1A1C19] via-[#1A1C19]/95 to-transparent">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-400">
                <span className="capitalize px-2.5 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-stone-300">
                  {(lightboxItem?.category || 'menu').replace('_', ' ')}
                </span>
                <span>•</span>
                <span>Bisrat Hotel Gourmet Dining</span>
              </div>

              <button
                type="button"
                onClick={(e) => closeLightbox(e)}
                className="w-8 h-8 rounded-full bg-stone-800/90 hover:bg-stone-700 text-stone-200 flex items-center justify-center transition-colors border border-stone-600 focus:outline-none focus:ring-2 focus:ring-[#C5A059] cursor-pointer"
                aria-label="Close photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* High-Resolution Dish Photo View (Centered Image Fix) */}
            <div 
              className="relative w-full aspect-[16/10] sm:h-[360px] bg-stone-900 overflow-hidden flex items-center justify-center group"
              style={{ overflow: 'hidden' }}
            >
              {imageLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900 text-stone-500 animate-pulse">
                  <Camera className="w-10 h-10 mb-2 opacity-40 text-[#C5A059]" />
                  <span className="text-xs font-mono">Loading dish photo...</span>
                </div>
              )}

              {getItemImage(lightboxItem) ? (
                <img
                  src={getItemImage(lightboxItem)}
                  alt={lightboxItem?.nameEn || 'Bisrat Dish'}
                  loading="eager"
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                  className={`w-full h-full object-cover object-center block transition-transform duration-700 group-hover:scale-105 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center center',
                    display: 'block'
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-stone-800 text-stone-400 p-6 text-center">
                  <Utensils className="w-12 h-12 text-[#1B4D3E] mb-2" />
                  <p className="text-sm font-semibold text-stone-300">Bisrat Hotel Signature Dish</p>
                  <p className="text-xs text-stone-500 mt-1 font-mono">[{lightboxItem?.placeholderSlot}]</p>
                </div>
              )}

              {/* Prev / Next Navigation Controls */}
              <button
                type="button"
                onClick={(e) => navigateDish(-1, e)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-xs flex items-center justify-center border border-white/20 transition-all shadow-md cursor-pointer"
                aria-label="Previous dish"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={(e) => navigateDish(1, e)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-xs flex items-center justify-center border border-white/20 transition-all shadow-md cursor-pointer"
                aria-label="Next dish"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Dish Information Content */}
            <div className="p-5 sm:p-6 space-y-4">
              
              {/* Title, Price Header & Order CTA */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-stone-800 pb-4">
                <div>
                  <h3 id="lightbox-dish-title" className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {lang === 'am' ? lightboxItem?.nameAm : lang === 'or' ? lightboxItem?.nameOr : lightboxItem?.nameEn}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#C5A059] font-medium">
                    <span>{lightboxItem?.nameEn}</span>
                    {lightboxItem?.nameAm && (
                      <>
                        <span>•</span>
                        <span>{lightboxItem?.nameAm}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <div className="bg-[#1B4D3E] text-white px-3.5 py-1.5 rounded-xl font-mono font-bold text-base sm:text-lg border border-[#1B4D3E]/50 shadow-xs">
                    {lightboxItem?.price} <span className="text-xs font-sans uppercase">ETB</span>
                  </div>

                  {/* Order Button inside Lightbox */}
                  <button
                    type="button"
                    onClick={(e) => {
                      handleAddToOrder(lightboxItem, e);
                      closeLightbox(e);
                      setIsDrawerOpen(true);
                    }}
                    className="bg-[#C5A059] hover:bg-[#B08B42] text-[#1A1C19] font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md border border-[#C5A059] transition-transform active:scale-95 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#1A1C19]" />
                    <span>Order Now</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              {lightboxItem?.description && (
                <p className="text-sm text-stone-300 leading-relaxed">
                  {lightboxItem.description}
                </p>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-2 flex items-center justify-between text-xs text-stone-400 border-t border-stone-800/60">
                <span className="text-[11px] text-stone-500">
                  Bisrat Hotel Restaurant & Bar • Fresh Daily
                </span>

                <button
                  type="button"
                  onClick={(e) => closeLightbox(e)}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-5 py-2 rounded-xl text-xs font-bold transition-colors border border-stone-700"
                >
                  {t.menu.closePhoto || 'Close'}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CUSTOMER CHECKOUT & PAYMENT DRAWER MOUNT                 */}
      {/* ======================================================== */}
      <CustomerPaymentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        orderItems={orderItems}
        onUpdateQuantity={handleUpdateQuantity}
        onClearOrder={handleClearOrder}
        paymentSettings={paymentSettings}
        lang={lang}
      />

    </section>
  );
}

