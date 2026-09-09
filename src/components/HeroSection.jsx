import React, { useState } from 'react';
import { Calendar, UtensilsCrossed, MapPin, Sparkles, PhoneCall } from 'lucide-react';
import { translations } from '../translations';

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

  return (
    <section className="relative w-full min-h-[75vh] lg:min-h-[82vh] flex items-center justify-center overflow-hidden bg-[#0D0D0D]">
      
      {/* Full-width Exterior Background Image */}
      <img
        src={photos?.['hero-exterior.jpg'] || "/images/exterior-building.jpg"}
        alt="Bisrat Luxury Hotel Exterior Adama"
        className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000"
      />

      {/* Dark Subtle Overlay for contrast & readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/90 via-[#1A1A1A]/60 to-[#0D0D0D]/50" />

      {/* Hero Content Overlay */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-6 sm:space-y-8 animate-fade-in py-12">
        
        {/* Adama Badge */}
        <div className="inline-flex items-center gap-2 bg-[#1A1A1A]/70 backdrop-blur-md border border-[#C8A24A]/40 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide text-[#C8A24A] shadow-md">
          <MapPin className="w-4 h-4 text-[#C8A24A] animate-bounce" />
          <span>{t.locationShort}</span>
          <span className="opacity-50">•</span>
          <span className="font-serif text-white">Bisrat Hotel (ብስራት ሆቴል)</span>
        </div>

        {/* Minimal Hero Title */}
        <h1 className="fluid-hero-title font-serif font-bold text-white tracking-tight drop-shadow-md">
          {t.hero.title}
        </h1>

        {/* Minimal Hero Subtitle */}
        <p className="text-sm sm:text-lg text-slate-200 font-medium max-w-2xl mx-auto drop-shadow-sm leading-relaxed">
          {t.hero.subtitle}
        </p>

        {/* ONLY TWO LARGE ACTION TAB BUTTONS ON TOP OF HERO PHOTO */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 max-w-md mx-auto">
          
          {/* Action Button 1: Reservation (Gold Background with Dark Charcoal Text) */}
          <button
            onClick={onBookClick}
            className="w-full sm:w-1/2 flex items-center justify-center gap-3 bg-[#C8A24A] hover:bg-[#B58E38] text-[#1A1A1A] font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform active:scale-95 text-base sm:text-lg border border-[#D8B96D]"
          >
            <Calendar className="w-5 h-5 text-[#1A1A1A]" />
            <span>Reservation</span>
          </button>

          {/* Action Button 2: Menu (Dark Charcoal Translucent with Gold Border & Text) */}
          <button
            onClick={onExploreMenuClick}
            className="w-full sm:w-1/2 flex items-center justify-center gap-3 bg-[#1A1A1A]/80 hover:bg-[#1A1A1A] text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform active:scale-95 text-base sm:text-lg border border-[#C8A24A]/50"
          >
            <UtensilsCrossed className="w-5 h-5 text-[#C8A24A]" />
            <span>Menu</span>
          </button>

        </div>

        {/* Quick Reception Contact Bar */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5 bg-[#1A1A1A]/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#C8A24A]/30">
            <PhoneCall className="w-3.5 h-3.5 text-[#C8A24A]" />
            Mobile: <a href={`tel:${mobilePhone}`} className="text-white hover:text-[#C8A24A] transition-colors">{mobilePhone}</a>
          </span>
          <span className="flex items-center gap-1.5 bg-[#1A1A1A]/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#C8A24A]/30">
            ☎ Reception: <a href={`tel:${landlinePhone.replace(/\s+/g, '')}`} className="text-white hover:text-[#C8A24A] transition-colors">{landlinePhone}</a>
          </span>
        </div>

      </div>

    </section>
  );
}
