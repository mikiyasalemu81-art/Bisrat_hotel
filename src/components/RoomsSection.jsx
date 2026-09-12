import React from 'react';
import { Users, Bed, Check, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import ImagePlaceholder from './ImagePlaceholder';
import { translations } from '../translations';
import ScrollReveal from './ScrollReveal';

export default function RoomsSection({ 
  rooms, 
  photos, 
  lang, 
  onSelectRoom 
}) {
  const t = translations[lang] || translations.en;

  return (
    <section id="rooms" className="py-16 lg:py-24 bg-[#1A1C19] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <ScrollReveal delay={0} direction="up">
            <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-[#C5A059] bg-[#1B4D3E] border border-[#C5A059]/40 px-4 py-1.5 rounded-full mb-3 shadow-sm">
              Bisrat Hotel Accommodations
            </span>
          </ScrollReveal>
          <ScrollReveal delay={120} direction="up">
            <h2 className="fluid-section-title font-serif font-bold text-white mb-4">
              {t.rooms.title}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={240} direction="up">
            <p className="text-[#E8EFE9] text-sm sm:text-base">
              {t.rooms.subtitle}
            </p>
          </ScrollReveal>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {rooms.map((room, index) => {
            const name = t.rooms[room.nameKey] || room.nameKey;
            const desc = t.rooms[room.descKey] || room.descKey;
            const customImg = photos?.[room.placeholderSlot] || room.customImage || room.image;

            return (
              <ScrollReveal
                key={room.id}
                delay={200 + index * 120}
                direction="up"
                distance={30}
                className="h-full"
              >
                <div 
                  className="bg-[#232622] rounded-2xl overflow-hidden border border-[#1B4D3E]/50 flex flex-col justify-between group shadow-xl hover:border-[#C5A059] transition-all h-full"
                >
                <div>
                  {/* Room Image Placeholder Slot or Real Photo */}
                  <div className="relative">
                    <ImagePlaceholder 
                      image={room.image}
                      slotName={room.placeholderSlot}
                      customImage={customImg}
                      alt={name}
                      aspectRatio="aspect-[16/10]"
                      className="w-full"
                    />

                    {/* Available Tag */}
                    <div className="absolute top-3 left-3 bg-[#1B4D3E]/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#C5A059] border border-[#C5A059]/40 flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
                      <span>{t.rooms.available}</span>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute bottom-3 right-3 bg-[#1A1C19]/95 text-white backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#1B4D3E] shadow-md">
                      <span className="font-serif text-lg font-bold text-[#C5A059]">
                        {room.price.toLocaleString()} ETB
                      </span>
                      <span className="text-[11px] text-[#E8EFE9] ml-1 font-sans">
                        {t.rooms.night}
                      </span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-serif text-xl font-bold text-white group-hover:text-[#C5A059] transition-colors">
                        {name}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-300 mb-4 leading-relaxed">
                      {desc}
                    </p>

                    {/* Specs Pills */}
                    <div className="flex items-center gap-4 text-xs font-medium text-[#E8EFE9] py-2 border-y border-stone-800 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#C5A059]" />
                        <span>{room.capacity} {t.rooms.capacity}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Bed className="w-4 h-4 text-[#C5A059]" />
                        <span>{room.bedType}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                        <span>{room.size}</span>
                      </div>
                    </div>

                    {/* Amenities List */}
                    <div className="space-y-2 mb-6">
                      <p className="text-xs font-bold text-[#C5A059] uppercase tracking-wider">
                        {t.rooms.amenities}:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {room.amenities.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-stone-300">
                            <Check className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                            <span className="truncate">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key CTA Button ("Book Room"): Warm Champagne Gold with Charcoal text */}
                <div className="px-6 pb-6 pt-0">
                  <button
                    onClick={() => onSelectRoom(room)}
                    className="w-full flex items-center justify-center gap-2 bg-[#C5A059] hover:bg-[#B08B42] text-[#1A1C19] font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all group-hover:scale-[1.01] border border-[#C5A059] cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-[#1A1C19]" />
                    <span>{t.rooms.bookThis}</span>
                    <ArrowRight className="w-4 h-4 text-[#1A1C19]" />
                  </button>
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
