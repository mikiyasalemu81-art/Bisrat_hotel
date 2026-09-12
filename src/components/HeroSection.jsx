import React, { useState, useEffect } from 'react';
import { Calendar, UtensilsCrossed, MapPin, PhoneCall } from 'lucide-react';
import { translations } from '../translations';
import { getOptimizedImageUrl } from '../utils/imageUrl';
import ScrollReveal from './ScrollReveal';

export default function HeroSection({ 
  lang, 
  photos = {},
  paymentSettings = {},
  onBookClick,
  onExploreMenuClick 
}) {
  const t = translations[lang] || translations.en;
  const mobilePhone = paymentSettings?.phoneNumber || '0906320251';
  const landlinePhone = paymentSettings?.landlinePhone || '022 211 2555';

  const slides = [
    {
      id: 'exterior',
      src: getOptimizedImageUrl(photos?.['hero-exterior.jpg'] || photos?.['exterior-building.jpg'] || "/images/exterior-building.jpg"),
      alt: "Bisrat Luxury Hotel Exterior Adama",
      caption: "Grand Hotel Exterior"
    },
    {
      id: 'dining',
      src: getOptimizedImageUrl(photos?.['restaurant-table-setting.jpg'] || "/images/restaurant-table-setting.jpg"),
      alt: "Bisrat Hotel Dining & Fine Restaurant Setting",
      caption: "Dining & Restaurant"
    },
    {
      id: 'suite',
      src: getOptimizedImageUrl(photos?.['room-deluxe.webp'] || "/images/room-deluxe.webp"),
      alt: "Bisrat Hotel Deluxe Room Accommodations",
      caption: "Deluxe Suite Accommodations"
    },
    {
      id: 'cuisine',
      src: getOptimizedImageUrl(photos?.['ethiopian-combo.jpg'] || "/images/ethiopian-combo.jpg"),
      alt: "Authentic Ethiopian Traditional Cuisine at Bisrat Hotel",
      caption: "Traditional Ethiopian Dining"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  // Auto-advance carousel every 4000ms (4 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Subtle Hero Parallax scroll tracking with requestAnimationFrame
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxOffset = Math.min(scrollY * 0.35, 140);

  return (
    <section className="relative w-full min-h-[72vh] lg:min-h-[78vh] flex items-center justify-center overflow-hidden bg-[#0A1713]">
      
      {/* 4-Second Auto-Transition Image Carousel with Subtle Parallax */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out overflow-hidden ${
              isActive ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
            }`}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              style={{
                width: '100%',
                height: '115%',
                objectFit: 'cover',
                objectPosition: 'center center',
                display: 'block',
                transform: `translate3d(0, ${parallaxOffset}px, 0) scale(1.06)`,
                transition: 'transform 0.1s ease-out'
              }}
            />
          </div>
        );
      })}

      {/* Dark Subtle Overlay for contrast & readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1713]/90 via-[#0A1713]/60 to-[#0A1713]/40 z-[1] pointer-events-none" />

      {/* Hero Content Overlay with Staggered Entrance */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-6 sm:space-y-8 py-12">
        
        {/* Adama Badge in Warm Champagne Gold & Deep Emerald */}
        <ScrollReveal delay={50} direction="up" distance={20}>
          <div className="inline-flex items-center gap-2 bg-[#1B4D3E]/85 backdrop-blur-md border border-[#C5A059]/60 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide text-[#C5A059] shadow-md">
            <MapPin className="w-4 h-4 text-[#C5A059] animate-bounce" />
            <span>{t.locationShort}</span>
            <span className="opacity-60 text-[#E8EFE9]">•</span>
            <span className="font-serif text-white">Bisrat Hotel (ብስራት ሆቴል)</span>
          </div>
        </ScrollReveal>

        {/* Minimal Hero Title */}
        <ScrollReveal delay={150} direction="up" distance={30}>
          <h1 className="fluid-hero-title font-serif font-bold text-white tracking-tight drop-shadow-md">
            {t.hero.title}
          </h1>
        </ScrollReveal>

        {/* Action Buttons Staggered */}
        <ScrollReveal delay={300} direction="up" distance={25}>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 max-w-md mx-auto">
            
            {/* Action Button 1: Key CTA "Book Table" in Warm Champagne Gold with Charcoal text */}
            <button
              type="button"
              onClick={onBookClick}
              className="w-full sm:w-1/2 flex items-center justify-center gap-2.5 bg-[#C5A059] hover:bg-[#b59049] text-[#1A1C19] font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform active:scale-95 text-base sm:text-lg border border-[#C5A059] cursor-pointer"
            >
              <Calendar className="w-5 h-5 text-[#1A1C19]" />
              <span>Book Table</span>
            </button>

            {/* Action Button 2: "Menu" in Deep Emerald with Warm Champagne Gold accent */}
            <button
              type="button"
              onClick={onExploreMenuClick}
              className="w-full sm:w-1/2 flex items-center justify-center gap-2.5 bg-[#1B4D3E]/90 hover:bg-[#1B4D3E] text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform active:scale-95 text-base sm:text-lg border border-[#C5A059]/60 hover:border-[#C5A059] cursor-pointer"
            >
              <UtensilsCrossed className="w-5 h-5 text-[#C5A059]" />
              <span>Menu</span>
            </button>

          </div>
        </ScrollReveal>

        {/* Carousel Indicator Dots */}
        <div className="pt-2 flex items-center justify-center gap-2.5 z-20">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Slide ${idx + 1}: ${slide.caption}`}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide 
                  ? 'w-8 bg-[#C5A059] shadow-md shadow-[#C5A059]/40' 
                  : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        {/* Quick Reception Contact Bar Staggered */}
        <ScrollReveal delay={450} direction="up" distance={20}>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-white/90">
            <span className="flex items-center gap-1.5 bg-[#1B4D3E]/85 backdrop-blur-md px-4 py-2 rounded-xl border border-[#C5A059]/40 shadow-sm text-[#FDFCF7]">
              <PhoneCall className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Mobile: <a href={`tel:${mobilePhone}`} className="text-white hover:text-[#C5A059] font-bold transition-colors">{mobilePhone}</a></span>
            </span>
            <span className="flex items-center gap-1.5 bg-[#1B4D3E]/85 backdrop-blur-md px-4 py-2 rounded-xl border border-[#C5A059]/40 shadow-sm text-[#FDFCF7]">
              <span className="text-[#C5A059]">☎</span>
              <span>Reception: <a href={`tel:${landlinePhone.replace(/\s+/g, '')}`} className="text-white hover:text-[#C5A059] font-bold transition-colors">{landlinePhone}</a></span>
            </span>
          </div>
        </ScrollReveal>

      </div>

    </section>
  );
}
