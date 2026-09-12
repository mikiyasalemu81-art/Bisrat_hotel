import React from 'react';
import { Wifi, Utensils, Car, Zap, Coffee, Building2, Shield, CheckCircle2 } from 'lucide-react';
import { translations } from '../translations';
import ScrollReveal from './ScrollReveal';

const iconMap = {
  Wifi: Wifi,
  Utensils: Utensils,
  Car: Car,
  Zap: Zap,
  Coffee: Coffee,
  Building2: Building2,
  Shield: Shield
};

export default function Highlights({ lang, facilities = [] }) {
  const t = translations[lang] || translations.en;

  const defaultFeatures = [
    {
      id: "fac-1",
      iconType: "Wifi",
      title: t.highlights.wifi,
      desc: t.highlights.wifiDesc,
      bg: "bg-sky-50 text-skybrand-600 border-sky-100"
    },
    {
      id: "fac-2",
      iconType: "Utensils",
      title: t.highlights.dining,
      desc: t.highlights.diningDesc,
      bg: "bg-blue-50 text-blue-600 border-blue-100"
    },
    {
      id: "fac-3",
      iconType: "Car",
      title: t.highlights.parking,
      desc: t.highlights.parkingDesc,
      bg: "bg-emerald-50 text-emerald-600 border-emerald-100"
    },
    {
      id: "fac-4",
      iconType: "Zap",
      title: t.highlights.power,
      desc: t.highlights.powerDesc,
      bg: "bg-amber-50 text-amber-600 border-amber-100"
    }
  ];

  const displayList = facilities.length > 0 ? facilities : defaultFeatures;

  return (
    <section className="py-16 bg-[#FDFCF7] border-y border-[#E8EFE9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <ScrollReveal delay={0} direction="up">
            <h2 className="fluid-section-title font-serif font-bold text-[#1A1C19] mb-3">
              {t.highlights.title}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={120} direction="up">
            <p className="text-stone-600 text-sm sm:text-base">
              {t.highlights.subtitle}
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayList.map((f, i) => {
            const Icon = iconMap[f.iconType] || Wifi;
            return (
              <ScrollReveal 
                key={f.id || i}
                delay={200 + i * 100}
                direction="up"
                distance={30}
                className="h-full"
              >
                <div className="card-hover-effect rounded-2xl p-6 border border-[#E8EFE9] bg-white shadow-soft flex flex-col justify-between group h-full">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#1B4D3E]/10 text-[#1B4D3E] border border-[#1B4D3E]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-[#1B4D3E]" />
                    </div>

                    <h3 className="font-serif text-lg font-bold text-[#1A1C19] mb-2">
                      {f.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-1.5 text-[11px] font-bold text-[#1B4D3E]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4D3E]" />
                    <span>Verified Hotel Amenity</span>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}
