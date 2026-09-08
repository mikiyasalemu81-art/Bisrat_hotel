import React, { useState } from 'react';
import { Camera, Upload, CheckCircle2, Image as ImageIcon, RefreshCw, Link as LinkIcon } from 'lucide-react';
import ImagePlaceholder from '../components/ImagePlaceholder';

export default function PhotoManager({ photos = {}, setPhotos }) {
  const [selectedSlot, setSelectedSlot] = useState('hero-exterior.jpg');
  const [urlInput, setUrlInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const slots = [
    { name: "hero-exterior.jpg", category: "Hero Banner" },
    { name: "hero-lobby.jpg", category: "Hero Banner" },
    { name: "hero-dining.jpg", category: "Hero Banner" },
    { name: "room-deluxe.jpg", category: "Rooms & Rates" },
    { name: "room-executive.jpg", category: "Rooms & Rates" },
    { name: "room-family.jpg", category: "Rooms & Rates" },
    { name: "room-standard.jpg", category: "Rooms & Rates" },
    { name: "menu-doro-wot.jpg", category: "Restaurant Menu" },
    { name: "menu-special-kitfo.jpg", category: "Restaurant Menu" },
    { name: "menu-tibs-firfir.jpg", category: "Restaurant Menu" },
    { name: "menu-beyaynetu.jpg", category: "Restaurant Menu" },
    { name: "menu-club-sandwich.jpg", category: "Restaurant Menu" },
    { name: "menu-beef-steak.jpg", category: "Restaurant Menu" },
    { name: "gallery-exterior-1.jpg", category: "Photo Gallery" },
    { name: "gallery-room-1.jpg", category: "Photo Gallery" },
    { name: "gallery-restaurant-1.jpg", category: "Photo Gallery" }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result;
      savePhoto(selectedSlot, base64Url);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSave = (e) => {
    e.preventDefault();
    if (!urlInput) return;
    savePhoto(selectedSlot, urlInput);
    setUrlInput('');
  };

  const savePhoto = (slotName, photoData) => {
    setPhotos(prev => ({
      ...prev,
      [slotName]: photoData
    }));
    setSuccessMsg(`Uploaded photo to slot [UPLOAD: ${slotName}] successfully!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const removePhoto = (slotName) => {
    setPhotos(prev => {
      const copy = { ...prev };
      delete copy[slotName];
      return copy;
    });
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h3 className="font-serif text-xl font-bold text-navybrand-900">
          Photo Slot Manager
        </h3>
        <p className="text-xs text-slate-500">
          Upload real hotel photos to replace default `[UPLOAD: filename.jpg]` placeholders site-wide
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Upload Controls */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-6">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              1. Select Target Photo Slot:
            </label>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-navybrand-900 focus:ring-2 focus:ring-skybrand-500 focus:outline-none"
            >
              {slots.map(s => (
                <option key={s.name} value={s.name}>
                  [{s.category}] — [UPLOAD: {s.name}]
                </option>
              ))}
            </select>
          </div>

          {/* Upload Method A: File Browser */}
          <div className="border-2 border-dashed border-sky-200 bg-sky-50/50 rounded-2xl p-6 text-center hover:bg-sky-50 transition-colors">
            <Upload className="w-8 h-8 text-skybrand-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800 mb-1">
              Upload Image File from Device
            </p>
            <p className="text-[11px] text-slate-500 mb-3">
              Supports JPEG, PNG, WEBP files
            </p>

            <label className="bg-skybrand-500 hover:bg-skybrand-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs cursor-pointer inline-block transition-colors">
              Choose Photo File
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>
          </div>

          {/* Upload Method B: Image URL */}
          <form onSubmit={handleUrlSave} className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-skybrand-500" />
              <span>Or Paste Direct Image URL:</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-skybrand-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-navybrand-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0"
              >
                Apply URL
              </button>
            </div>
          </form>

        </div>

        {/* Right Column: Live Slot Preview */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-navybrand-900 text-base">
              Slot Preview: <span className="font-mono text-skybrand-600">[{selectedSlot}]</span>
            </h4>

            {photos[selectedSlot] && (
              <button
                onClick={() => removePhoto(selectedSlot)}
                className="text-xs text-rose-600 font-semibold hover:underline"
              >
                Reset to Placeholder
              </button>
            )}
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden p-2 bg-slate-50">
            <ImagePlaceholder
              slotName={selectedSlot}
              customImage={photos[selectedSlot]}
              alt="Slot Preview"
              aspectRatio="aspect-[16/10]"
              className="w-full"
            />
          </div>

          <p className="text-[11px] text-slate-500">
            {photos[selectedSlot] 
              ? "✓ Real photo active for this slot on the public site." 
              : "Showing default labeled upload slot indicator."}
          </p>
        </div>

      </div>

    </div>
  );
}
