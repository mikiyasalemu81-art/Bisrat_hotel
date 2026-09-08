import React from 'react';
import { Sun, Compass, MapPin, Sparkles } from 'lucide-react';
import { translations } from '../translations';

export default function LocalGuide({ lang }) {
  const t = translations[lang] || translations.en;

  const attractions = [
    {
      name: t.guide.sodere,
      desc: t.guide.sodereDesc,
      dist: "25 km"
    },
    {
      name: t.guide.lakeHora,
      desc: t.guide.lakeHoraDesc,
      dist: "45 km"
    },
    {
      name: t.guide.wonji,
      desc: t.guide.wonjiDesc,
      dist: "12 km"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-white via-sky-50/50 to-slate-50 border border-sky-200/80 rounded-3xl p-6 sm:p-8 shadow-soft">
      
      {/* Title */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-skybrand-500 text-white flex items-center justify-center shadow-md">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-serif text-xl font-bold text-navybrand-900">
            {t.guide.title}
          </h3>
          <p className="text-xs text-slate-500">
            {t.guide.subtitle}
          </p>
        </div>
      </div>

      {/* Weather Badge Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Sun className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">{t.guide.weatherTitle}</p>
            <p className="text-base font-serif font-bold text-navybrand-900">{t.guide.weatherVal}</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-skybrand-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100 hidden sm:inline">
          Adama Climate
        </span>
      </div>

      {/* Nearby Attractions */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-skybrand-500" />
          <span>{t.guide.attractionsTitle}:</span>
        </p>

        <div className="space-y-2.5">
          {attractions.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white/80 p-3 rounded-xl border border-slate-200/60 hover:border-sky-300 transition-colors flex items-start gap-3"
            >
              <MapPin className="w-4 h-4 text-skybrand-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-navybrand-900 truncate">{item.name}</h4>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                    {item.dist}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
