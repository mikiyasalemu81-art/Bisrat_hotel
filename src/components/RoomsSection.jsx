import React from 'react';
import { Users, Bed, Check, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import ImagePlaceholder from './ImagePlaceholder';
import { translations } from '../translations';

export default function RoomsSection({ 
  rooms, 
  photos, 
  lang, 
  onSelectRoom 
}) {
  const t = translations[lang] || translations.en;

  return (
    <section id="rooms" className="py-16 lg:py-24 bg-[#1A1A1A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#C8A24A] bg-[#C8A24A]/20 border border-[#C8A24A]/40 px-3 py-1 rounded-full mb-3">
            Bisrat Hotel Accommodations
          </span>
          <h2 className="fluid-section-title font-serif font-bold text-white mb-4">
            {t.rooms.title}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            {t.rooms.subtitle}
          </p>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {rooms.map((room) => {
            const name = t.rooms[room.nameKey] || room.nameKey;
            const desc = t.rooms[room.descKey] || room.descKey;
            const customImg = photos?.[room.placeholderSlot] || room.customImage || room.image;

            return (
              <div 
                key={room.id}
                className="bg-[#242424] rounded-2xl overflow-hidden border border-[#C8A24A]/30 flex flex-col justify-between group shadow-xl hover:border-[#C8A24A] transition-all"
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
                    <div className="absolute top-3 left-3 bg-[#1A1A1A]/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{t.rooms.available}</span>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute bottom-3 right-3 bg-[#1A1A1A]/95 text-white backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#C8A24A]/40 shadow-md">
                      <span className="font-serif text-lg font-bold text-[#C8A24A]">
                        {room.price.toLocaleString()} ETB
                      </span>
                      <span className="text-[11px] text-slate-300 ml-1 font-sans">
                        {t.rooms.night}
                      </span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-serif text-xl font-bold text-white group-hover:text-[#C8A24A] transition-colors">
                        {name}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed">
                      {desc}
                    </p>

                    {/* Specs Pills */}
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-400 py-2 border-y border-[#333333] mb-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#C8A24A]" />
                        <span>{room.capacity} {t.rooms.capacity}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Bed className="w-4 h-4 text-[#C8A24A]" />
                        <span>{room.bedType}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#C8A24A]" />
                        <span>{room.size}</span>
                      </div>
                    </div>

                    {/* Amenities List */}
                    <div className="space-y-2 mb-6">
                      <p className="text-xs font-bold text-[#C8A24A] uppercase tracking-wider">
                        {t.rooms.amenities}:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {room.amenities.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-300">
                            <Check className="w-3.5 h-3.5 text-[#C8A24A] shrink-0" />
                            <span className="truncate">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action: Gold background with Dark Charcoal text */}
                <div className="px-6 pb-6 pt-0">
                  <button
                    onClick={() => onSelectRoom(room)}
                    className="w-full flex items-center justify-center gap-2 bg-[#C8A24A] hover:bg-[#B58E38] text-[#1A1A1A] font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all group-hover:scale-[1.01] border border-[#D8B96D]"
                  >
                    <Calendar className="w-4 h-4 text-[#1A1A1A]" />
                    <span>{t.rooms.bookThis}</span>
                    <ArrowRight className="w-4 h-4 text-[#1A1A1A]" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
