import React, { useState } from 'react';
import { Camera, Upload, CheckCircle2, AlertCircle, Image as ImageIcon, RefreshCw, Link as LinkIcon, Loader2, Trash2 } from 'lucide-react';
import ImagePlaceholder from '../components/ImagePlaceholder';
import { savePhotoToStorage, deletePhotoFromStorage } from '../utils/imageStorage';

export default function PhotoManager({ photos = {}, setPhotos }) {
  const [selectedSlot, setSelectedSlot] = useState('hero-exterior.jpg');
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await processAndSave(file);
    e.target.value = ''; // Reset input
  };

  const handleUrlSave = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    await processAndSave(urlInput.trim());
    setUrlInput('');
  };

  const processAndSave = async (fileOrUrl) => {
    setIsUploading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // 1. Process, compress, and store photo in permanent IndexedDB storage
      const result = await savePhotoToStorage(selectedSlot, fileOrUrl);

      // 2. Immediately update app state so live site updates for all visitors
      setPhotos(prev => ({
        ...prev,
        [selectedSlot]: result.dataUrl
      }));

      setSuccessMsg(`Photo successfully saved & published live to slot [UPLOAD: ${selectedSlot}]!`);
    } catch (err) {
      console.error('Photo save error:', err);
      setErrorMsg(err.message || 'Failed to process and save photo. Please try another file.');
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = async (slotName) => {
    if (!window.confirm(`Reset slot [${slotName}] back to default placeholder?`)) return;

    try {
      await deletePhotoFromStorage(slotName);
      setPhotos(prev => {
        const copy = { ...prev };
        delete copy[slotName];
        return copy;
      });
      setSuccessMsg(`Reset [${slotName}] back to placeholder.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Failed to remove photo from storage.');
    }
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h3 className="font-serif text-xl font-bold text-navybrand-900">
          Photo Slot Manager
        </h3>
        <p className="text-xs text-slate-500">
          Upload real hotel photos to replace default `[UPLOAD: filename.jpg]` placeholders site-wide. Photos are permanently stored in high quality and visible immediately across all sections.
        </p>
      </div>

      {/* Loading Indicator */}
      {isUploading && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-bold flex items-center gap-3 animate-fade-in shadow-xs">
          <Loader2 className="w-5 h-5 text-amber-600 animate-spin shrink-0" />
          <div>
            <p className="font-bold text-amber-900">Optimizing & Saving Image...</p>
            <p className="text-[11px] text-amber-700 font-normal">Compressing image data and writing to permanent database storage...</p>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {successMsg && !isUploading && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && !isUploading && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
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
              onChange={(e) => {
                setSelectedSlot(e.target.value);
                setSuccessMsg('');
                setErrorMsg('');
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-navybrand-900 focus:ring-2 focus:ring-skybrand-500 focus:outline-none"
            >
              {slots.map(s => (
                <option key={s.name} value={s.name}>
                  [{s.category}] — [UPLOAD: {s.name}] {photos[s.name] ? '✓ (Uploaded)' : ''}
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
              Supports JPEG, PNG, WEBP files (Auto-optimized & permanently saved)
            </p>

            <label className={`bg-skybrand-500 hover:bg-skybrand-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-2 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              <span>{isUploading ? 'Saving...' : 'Choose Photo File'}</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                disabled={isUploading}
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
                disabled={isUploading}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-skybrand-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isUploading || !urlInput.trim()}
                className="bg-navybrand-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
              >
                {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Apply URL</span>
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
                className="text-xs text-rose-600 font-semibold hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset to Placeholder</span>
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

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <p>
              {photos[selectedSlot] 
                ? "✓ Real photo active & permanently saved for this slot." 
                : "Showing default labeled upload slot indicator."}
            </p>
            {photos[selectedSlot] && (
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Live on Public Site
              </span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
