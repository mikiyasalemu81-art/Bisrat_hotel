import React, { useState } from 'react';
import { Calendar, UtensilsCrossed, MapPin, Sparkles, PhoneCall } from 'lucide-react';
import { translations } from '../translations';

export default function HeroSection({ 
  lang, 
  onBookClick,
  onExploreMenuClick 
}) {
  const t = translations[lang] || translations.en;

  return (
    <section className="relative w-full min-h-[75vh] lg:min-h-[82vh] flex items-center justify-center overflow-hidden bg-slate-900">
      
      {/* Full-width Exterior Background Image */}
      <img
        src="/images/exterior-building.jpg"
        alt="Bisrat Luxury Hotel Exterior Adama"
        className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000"
      />

      {/* Dark Subtle Overlay for contrast & readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/50 to-slate-950/40" />

      {/* Hero Content Overlay */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-6 sm:space-y-8 animate-fade-in py-12">
        
        {/* Adama Badge */}
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide text-sky-100 shadow-md">
          <MapPin className="w-4 h-4 text-skybrand-300 animate-bounce" />
          <span>{t.locationShort}</span>
          <span className="opacity-50">•</span>
          <span className="font-serif">Bisrat Hotel (ብስራት ሆቴል)</span>
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
          
          {/* Action Button 1: Reservation */}
          <button
            onClick={onBookClick}
            className="w-full sm:w-1/2 flex items-center justify-center gap-3 bg-skybrand-500 hover:bg-skybrand-600 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform active:scale-95 text-base sm:text-lg border border-skybrand-400/40"
          >
            <Calendar className="w-5 h-5" />
            <span>Reservation</span>
          </button>

          {/* Action Button 2: Menu */}
          <button
            onClick={onExploreMenuClick}
            className="w-full sm:w-1/2 flex items-center justify-center gap-3 bg-white/95 hover:bg-white text-navybrand-900 font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform active:scale-95 text-base sm:text-lg border border-white"
          >
            <UtensilsCrossed className="w-5 h-5 text-skybrand-600" />
            <span>Menu</span>
          </button>

        </div>

        {/* Quick Reception Contact Bar */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
            <PhoneCall className="w-3.5 h-3.5 text-skybrand-300" />
            Mobile: <a href="tel:0906320251" className="text-white hover:underline">0906320251</a>
          </span>
          <span className="flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
            ☎ Reception: <a href="tel:0222112555" className="text-white hover:underline">022 211 2555</a>
          </span>
        </div>

      </div>

    </section>
  );
}
