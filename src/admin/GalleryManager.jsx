import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Search, 
  Sparkles, 
  Image as ImageIcon,
  Loader2,
  X,
  Check,
  Eye
} from 'lucide-react';
import { compressImage, uploadToCloudStorage } from '../utils/imageStorage';
import { getOptimizedImageUrl, triggerGlobalImageRefresh } from '../utils/imageUrl';
import { initialGallery } from '../data/galleryData';

export default function GalleryManager({ 
  gallery = [], 
  setGallery, 
  paymentSettings = {}, 
  lang = 'en' 
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('rooms');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState(null);

  const fileInputRef = useRef(null);

  const categories = [
    { id: 'rooms', label: 'Rooms & Suites' },
    { id: 'exterior', label: 'Hotel Exterior & Grounds' },
    { id: 'food', label: 'Restaurant & Dining' },
    { id: 'events', label: 'Events & Lounge' }
  ];

  const showNotification = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  // Broadcast gallery update across tabs/devices
  const broadcastUpdate = (updatedList) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const now = Date.now();
        const channel = new BroadcastChannel('bisrat_hotel_sync');
        channel.postMessage({ type: 'GALLERY_UPDATE', gallery: updatedList, imgSyncTs: now });
        channel.postMessage({ type: 'IMG_SYNC', timestamp: now });
        channel.close();
      }
    } catch (e) {
      console.warn('Broadcast sync notice:', e);
    }
  };

  // Direct Cloud Storage Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const compressed = await compressImage(file, 1600, 0.85);
      const cloudRes = await uploadToCloudStorage(compressed, paymentSettings?.cloudStorage);
      const publicUrl = cloudRes.url;

      if (!publicUrl) {
        throw new Error("No public image URL returned from cloud storage.");
      }

      setImageUrl(publicUrl);
      setUploadSuccess(`✓ Photo uploaded to cloud (${cloudRes.provider})! Permanent public HTTPS URL active.`);
    } catch (err) {
      console.error('Gallery image upload error:', err);
      setUploadError(err.message || 'Failed to upload photo to cloud storage.');
    } finally {
      setIsUploading(false);
    }
  };

  // Save new discrete gallery record
  const handleAddPhoto = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please provide a title for the photo.");
      return;
    }
    if (!imageUrl.trim()) {
      alert("Please upload a photo or paste a public image URL.");
      return;
    }

    const now = Date.now();
    const cleanUrl = imageUrl.trim();
    const freshUrl = getOptimizedImageUrl(cleanUrl, now);

    const newRecord = {
      id: `gal-${now}`,
      title: title.trim(),
      titleEn: title.trim(),
      titleAm: title.trim(),
      titleOr: title.trim(),
      description: description.trim(),
      imageUrl: freshUrl,
      image: freshUrl,
      category,
      createdAt: new Date(now).toISOString(),
      updatedAt: now
    };

    const updated = [newRecord, ...gallery];
    if (setGallery) setGallery(updated);
    try {
      localStorage.setItem('bisrat_gallery', JSON.stringify(updated));
    } catch (err) {}
    triggerGlobalImageRefresh();
    broadcastUpdate(updated);

    // Reset Form
    setTitle('');
    setDescription('');
    setImageUrl('');
    setCategory('rooms');
    setUploadSuccess('');
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    showNotification(`✓ Added "${newRecord.title}" to public hotel gallery!`);
  };

  // Delete gallery item
  const handleDeletePhoto = (id, photoTitle) => {
    if (!window.confirm(`Remove "${photoTitle}" from the public gallery?`)) return;

    const updated = gallery.filter(item => item.id !== id);
    if (setGallery) setGallery(updated);
    try {
      localStorage.setItem('bisrat_gallery', JSON.stringify(updated));
    } catch (err) {}
    broadcastUpdate(updated);
    showNotification(`✓ Removed "${photoTitle}" from gallery.`);
  };

  // Reset to initial defaults
  const handleResetDefaults = () => {
    if (!window.confirm("Reset public gallery to original default photos? Custom uploads will be cleared.")) return;

    if (setGallery) setGallery(initialGallery);
    try {
      localStorage.setItem('bisrat_gallery', JSON.stringify(initialGallery));
    } catch (err) {}
    broadcastUpdate(initialGallery);
    showNotification("✓ Reset gallery to default showcase.");
  };

  // Filter items
  const filteredGallery = gallery.filter((item) => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const query = searchQuery.toLowerCase().trim();
    const itemTitle = (item.title || item.titleEn || item.titleAm || '').toLowerCase();
    const itemDesc = (item.description || '').toLowerCase();
    const matchesSearch = !query || itemTitle.includes(query) || itemDesc.includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8EFE9] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1B4D3E] bg-[#1B4D3E]/10 border border-[#1B4D3E]/20 px-3 py-0.5 rounded-full mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#1B4D3E]" />
            <span>Standalone Photo Gallery System</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#1A1C19]">
            Public Hotel Gallery Manager
          </h3>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl">
            Upload real photos to the public hotel gallery with custom titles, descriptions, and category tags. Photos are stored in the cloud with permanent HTTPS URLs and immediately appear for all visitors.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            title="Reset gallery to default photos"
          >
            Reset to Defaults
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Cloud Sync Active</span>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Add New Gallery Photo Form Card */}
      <form onSubmit={handleAddPhoto} className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E8EFE9] shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-[#E8EFE9] pb-3">
          <h4 className="font-serif text-lg font-bold text-[#1A1C19] flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#1B4D3E]" />
            <span>Upload New Photo to Public Gallery</span>
          </h4>
          <span className="text-[11px] font-mono text-stone-400 font-semibold uppercase">
            Total in Gallery: {gallery.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Photo Title * (e.g., VIP Presidential Suite Balcony)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. VIP Presidential Suite Balcony"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#FDFCF7] border border-[#E8EFE9] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-[#1B4D3E]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Gallery Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#FDFCF7] border border-[#E8EFE9] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-[#1B4D3E]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            Photo Description (Displayed on hover and in full-screen lightbox)
          </label>
          <textarea
            rows="2"
            placeholder="e.g. Panoramic evening views over the city skyline with signature cocktails and ambient seating."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#FDFCF7] border border-[#E8EFE9] rounded-xl px-3.5 py-2 text-xs text-stone-800 focus:ring-2 focus:ring-[#1B4D3E]"
          />
        </div>

        {/* Photo Upload with Direct Cloud Sync */}
        <div className="bg-[#FDFCF7] p-4 sm:p-5 rounded-2xl border border-[#E8EFE9] space-y-3">
          <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-[#1B4D3E]" />
            <span>Image File (Cloudinary / Supabase Direct Upload):</span>
          </label>

          {uploadError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`bg-[#1B4D3E] hover:bg-[#163E32] text-white font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer block text-center transition-all shadow-xs ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                {isUploading ? 'Uploading to Cloud Bucket...' : 'Choose Image File (Auto-Upload)'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <input
                type="url"
                placeholder="Or paste public image URL (https://...)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={isUploading}
                className="w-full bg-white border border-[#E8EFE9] rounded-xl px-3 py-2.5 text-xs text-stone-800 focus:ring-2 focus:ring-[#1B4D3E]"
              />
            </div>
          </div>

          {imageUrl && !isUploading && (
            <div className="flex items-center gap-3 pt-2">
              <div className="w-20 h-16 rounded-xl overflow-hidden border border-[#E8EFE9] shrink-0 shadow-2xs">
                <img
                  src={getOptimizedImageUrl(imageUrl)}
                  alt="Preview"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="text-xs">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Image ready for publication</span>
                </span>
                <p className="text-[11px] text-stone-400 font-mono truncate max-w-md mt-0.5">
                  {imageUrl}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isUploading}
            className="bg-[#C5A059] hover:bg-[#B08B42] text-[#1A1C19] font-bold px-7 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer border border-[#C5A059]"
          >
            <Plus className="w-4 h-4 text-[#1A1C19]" />
            <span>Publish Photo to Gallery</span>
          </button>
        </div>
      </form>

      {/* Gallery Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E8EFE9] shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search gallery photos by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FDFCF7] border border-[#E8EFE9] rounded-xl pl-10 pr-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filterCategory === 'all'
                ? 'bg-[#1B4D3E] text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All ({gallery.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilterCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                filterCategory === c.id
                  ? 'bg-[#1B4D3E] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {c.label} ({gallery.filter(i => i.category === c.id).length})
            </button>
          ))}
        </div>
      </div>

      {/* Current Gallery Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGallery.map((item) => {
          const raw = item.imageUrl || item.image || item.customImage || '/images/exterior-building.jpg';
          const itemImg = getOptimizedImageUrl(raw, item?.updatedAt || item?.createdAt);
          const itemTitle = item.title || item.titleEn || item.titleAm || 'Bisrat Hotel Photo';
          const catLabel = categories.find(c => c.id === item.category)?.label || item.category;

          return (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-[#E8EFE9] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div 
                className="relative w-full h-[180px] overflow-hidden bg-stone-100 cursor-pointer"
                onClick={() => setPreviewItem(item)}
              >
                <img
                  src={itemImg}
                  alt={itemTitle}
                  loading="lazy"
                  className="w-full h-full object-cover object-center block transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { e.currentTarget.src = "/images/exterior-building.jpg"; }}
                />

                <span className="absolute top-2.5 left-2.5 bg-[#1B4D3E]/85 backdrop-blur-xs text-[#C5A059] border border-[#C5A059]/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize">
                  {catLabel}
                </span>

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="bg-white/90 text-[#1A1C19] text-xs font-bold px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-[#1B4D3E]" />
                    <span>View</span>
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                <div>
                  <h4 
                    onClick={() => setPreviewItem(item)}
                    className="font-serif font-bold text-base text-[#1A1C19] hover:text-[#1B4D3E] transition-colors truncate cursor-pointer"
                    title={itemTitle}
                  >
                    {itemTitle}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E8EFE9] text-xs">
                  <span className="text-[11px] font-mono text-stone-400">
                    ID: {item.id}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(item.id, itemTitle)}
                    className="text-stone-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-colors cursor-pointer"
                    title="Delete photo from gallery"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGallery.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-[#E8EFE9] p-6">
          <ImageIcon className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="font-bold text-stone-700 text-sm">No photos match your filter</p>
          <p className="text-xs text-stone-500 mt-1">Try clearing search or selecting "All"</p>
        </div>
      )}

      {/* Photo Preview Lightbox Modal */}
      {previewItem && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in pointer-events-auto"
          onClick={() => setPreviewItem(null)}
        >
          <div 
            className="relative bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#E8EFE9] pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[65vh] overflow-hidden bg-stone-900 flex items-center justify-center">
              <img
                src={getOptimizedImageUrl(previewItem.imageUrl || previewItem.image || previewItem.customImage, previewItem?.updatedAt || previewItem?.createdAt)}
                alt={previewItem.title}
                className="max-h-[65vh] w-full object-contain"
              />
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 bg-white space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-[#1B4D3E]/10 text-[#1B4D3E] border border-[#1B4D3E]/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  {categories.find(c => c.id === previewItem.category)?.label || previewItem.category}
                </span>
                <span className="text-[11px] font-mono text-stone-400">
                  {previewItem.createdAt ? new Date(previewItem.createdAt).toLocaleDateString() : 'Active'}
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1A1C19]">
                {previewItem.title || previewItem.titleEn || previewItem.titleAm}
              </h3>
              {previewItem.description && (
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {previewItem.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
