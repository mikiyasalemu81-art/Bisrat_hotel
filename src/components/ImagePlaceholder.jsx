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
      <div className={`relative overflow-hidden rounded-xl bg-slate-100 ${aspectRatio} ${className}`}>
        <img 
          src={activeImage} 
          alt={alt} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            // fallback if image path missing
            e.target.style.display = 'none';
          }}
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 via-sky-50 to-slate-200 border-2 border-dashed border-skybrand-200/80 flex flex-col items-center justify-center p-4 text-center group ${aspectRatio} ${className}`}>
      <div className="w-12 h-12 rounded-full bg-white/90 shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
        <ImageIcon className="w-6 h-6 text-skybrand-600" />
      </div>
      
      <span className="font-mono text-xs font-semibold text-skybrand-800 bg-skybrand-100/90 px-3 py-1 rounded-md border border-skybrand-300/50 shadow-xs mb-1">
        [UPLOAD: {slotName}]
      </span>
      
      <p className="text-[11px] text-slate-500 font-medium">
        Ready for hotel photo upload
      </p>
    </div>
  );
}
