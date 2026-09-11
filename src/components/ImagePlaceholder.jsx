import React from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';

export default function ImagePlaceholder({ 
  slotName = "photo.jpg", 
  customImage = null, 
  image = null,
  alt = "Bisrat Hotel Photo", 
  aspectRatio = "aspect-[16/10]",
  className = "" 
}) {
  const activeImage = customImage || image;

  if (activeImage) {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-stone-100 ${aspectRatio} ${className}`}>
        <img 
          src={activeImage} 
          alt={alt} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "/images/exterior-building.jpg";
          }}
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-stone-100 border border-[#E8EFE9] flex flex-col items-center justify-center p-4 text-center group ${aspectRatio} ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-[#1B4D3E]/10 border border-[#1B4D3E]/20 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
        <ImageIcon className="w-6 h-6 text-[#1B4D3E]" />
      </div>
      
      <span className="font-serif text-xs font-bold text-[#1A1C19] mb-0.5">
        Bisrat Hotel Showcase
      </span>
      
      <p className="text-[11px] text-stone-500 font-medium">
        Adama, Ethiopia
      </p>
    </div>
  );
}
