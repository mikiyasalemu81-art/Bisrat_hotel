import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Utensils, 
  ToggleLeft, 
  ToggleRight, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Upload, 
  Edit3, 
  Search,
  X,
  Camera,
  DollarSign,
  Check,
  Sparkles,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { translations } from '../translations';
import { CATEGORY_CONFIG } from '../data/menuData';
import { savePhotoToStorage, compressImage, uploadToCloudStorage } from '../utils/imageStorage';
import { getOptimizedImageUrl, triggerGlobalImageRefresh } from '../utils/imageUrl';
import { saveCloudAppState } from '../utils/cloudSync';

export default function MenuManager({ 
  menuItems = [], 
  setMenuItems, 
  photos = {},
  setPhotos,
  paymentSettings = {},
  lang = 'en'
}) {
  const t = translations[lang] || translations.en;

  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Search & Filter State
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('all');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedDish, setSelectedDish] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editNameAm, setEditNameAm] = useState('');
  const [editCategory, setEditCategory] = useState('traditional');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editIsAvailable, setEditIsAvailable] = useState(true);
  const [isEditUploading, setIsEditUploading] = useState(false);
  const [editUploadError, setEditUploadError] = useState('');
  const [editUploadSuccess, setEditUploadSuccess] = useState('');

  // Add Item Form State
  const [nameEn, setNameEn] = useState('');
  const [nameAm, setNameAm] = useState('');
  const [category, setCategory] = useState(CATEGORY_CONFIG[0]?.id || 'traditional');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAddUploading, setIsAddUploading] = useState(false);
  const [addUploadError, setAddUploadError] = useState('');
  const [addUploadSuccess, setAddUploadSuccess] = useState('');

  // Helper to get image URL for any item with automatic cache-busting
  const getItemImage = (item) => {
    if (!item) return null;
    const raw = item.imageUrl || item.image_url || item.customImage || photos?.[item.placeholderSlot] || photos?.[item.id] || null;
    return getOptimizedImageUrl(raw, item?.updatedAt);
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Open Edit Modal cleanly
  const handleOpenEdit = (item, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!item) return;
    setSelectedDish(item);
    setEditingItem(item);
    setEditPrice(item.price !== undefined ? item.price : '');
    setEditNameEn(item.nameEn || '');
    setEditNameAm(item.nameAm || '');
    setEditCategory(item.category || 'traditional');
    setEditDescription(item.description || '');
    setEditImageUrl(getItemImage(item) || '');
    setEditIsAvailable(item.isAvailable !== false);
    setEditUploadError('');
    setEditUploadSuccess('');
    setIsEditModalOpen(true);
  };

  // Close Edit Modal cleanly
  const handleCloseEdit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsEditModalOpen(false);
    setEditingItem(null);
    setSelectedDish(null);
    setEditUploadError('');
    setEditUploadSuccess('');
  };

  // Upload image to Cloud Storage for EDIT modal
  const handleEditFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsEditUploading(true);
    setEditUploadError('');
    setEditUploadSuccess('');

    try {
      const compressed = await compressImage(file, 1600, 0.85);
      const cloudRes = await uploadToCloudStorage(compressed, paymentSettings?.cloudStorage);
      const publicHttpsUrl = cloudRes.secureUrl || cloudRes.url;

      if (!publicHttpsUrl || publicHttpsUrl.startsWith('data:')) {
        throw new Error("No public Cloudinary URL returned from cloud storage.");
      }

      setEditImageUrl(publicHttpsUrl);
      setEditUploadSuccess(`✓ Photo uploaded to Cloudinary (${cloudRes.provider})! Secure URL active.`);
    } catch (err) {
      setEditUploadError(err.message || 'Failed to upload photo to Cloudinary.');
    } finally {
      setIsEditUploading(false);
    }
  };

  // Save changes from EDIT modal
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    const numericPrice = Number(editPrice);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      alert("Please enter a valid price in ETB.");
      return;
    }

    const now = Date.now();
    const cleanImg = editImageUrl.trim();
    const finalImageUrl = cleanImg 
      ? getOptimizedImageUrl(cleanImg, now) 
      : getItemImage(editingItem);

    const updatedItem = {
      ...editingItem,
      nameEn: editNameEn.trim() || editingItem.nameEn,
      nameAm: editNameAm.trim() || editingItem.nameAm,
      category: editCategory || editingItem.category,
      price: numericPrice,
      isAvailable: editIsAvailable,
      description: editDescription.trim(),
      imageUrl: finalImageUrl,
      image_url: finalImageUrl,
      customImage: finalImageUrl,
      updatedAt: now,
    };

    const updatedList = menuItems.map(item => item.id === editingItem.id ? updatedItem : item);
    setMenuItems(updatedList);
    try {
      localStorage.setItem('bisrat_menu', JSON.stringify(updatedList));
      saveCloudAppState('menuItems', updatedList, paymentSettings?.cloudStorage).catch(() => {});
    } catch (e) {}

    // Update photo cache if placeholderSlot exists
    if (editingItem.placeholderSlot && finalImageUrl) {
      try {
        await savePhotoToStorage(editingItem.placeholderSlot, finalImageUrl);
        if (setPhotos) {
          setPhotos(prev => ({ ...prev, [editingItem.placeholderSlot]: finalImageUrl }));
        }
      } catch (err) {
        console.warn('Local cache sync warning:', err);
      }
    }

    // Trigger global image cache-busting refresh
    triggerGlobalImageRefresh();

    // Broadcast live across tabs and customer devices
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('bisrat_hotel_sync');
        channel.postMessage({ type: 'MENU_UPDATE', menuItems: updatedList, imgSyncTs: now });
        channel.postMessage({ type: 'IMG_SYNC', timestamp: now });
        if (editingItem.placeholderSlot && finalImageUrl) {
          channel.postMessage({ type: 'PHOTOS_UPDATE', photos: { [editingItem.placeholderSlot]: finalImageUrl } });
        }
        channel.close();
      }
    } catch (e) {
      console.warn('Broadcast sync notice:', e);
    }

    showSuccess(`✓ Saved "${updatedItem.nameEn}"! Price: ${numericPrice} ETB, Stock: ${editIsAvailable ? 'In Stock' : 'Sold Out'}, Photo synced across all devices.`);
    handleCloseEdit();
  };

  // Toggle Item Availability directly from row
  const toggleAvailability = (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const updated = menuItems.map(item => {
      if (item.id === id) {
        return { ...item, isAvailable: !item.isAvailable };
      }
      return item;
    });
    setMenuItems(updated);
    try {
      localStorage.setItem('bisrat_menu', JSON.stringify(updated));
      saveCloudAppState('menuItems', updated, paymentSettings?.cloudStorage).catch(() => {});
    } catch (e) {}

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('bisrat_hotel_sync');
        channel.postMessage({ type: 'MENU_UPDATE', menuItems: updated });
        channel.close();
      }
    } catch (e) {}
  };

  // Upload image to Cloud Storage for ADD modal
  const handleAddFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAddUploading(true);
    setAddUploadError('');
    setAddUploadSuccess('');

    try {
      const compressed = await compressImage(file, 1600, 0.85);
      const cloudRes = await uploadToCloudStorage(compressed, paymentSettings?.cloudStorage);
      const publicHttpsUrl = cloudRes.secureUrl || cloudRes.url;

      if (!publicHttpsUrl || publicHttpsUrl.startsWith('data:')) {
        throw new Error("No public Cloudinary URL returned from cloud storage.");
      }

      setImageUrl(publicHttpsUrl);
      setAddUploadSuccess(`✓ Photo uploaded to Cloudinary (${cloudRes.provider})! Secure URL active.`);
    } catch (err) {
      setAddUploadError(err.message || 'Failed to upload photo to Cloudinary.');
    } finally {
      setIsAddUploading(false);
    }
  };

  // Add Item
  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    if (!nameEn || !price) return;

    const numericPrice = Number(price);
    const now = Date.now();
    const slotKey = `menu-custom-${now}.jpg`;
    const cleanImg = imageUrl.trim() || null;
    const finalUrl = cleanImg ? getOptimizedImageUrl(cleanImg, now) : null;

    const newItem = {
      id: `menu-${now}`,
      nameEn: nameEn.trim(),
      nameAm: nameAm.trim() || nameEn.trim(),
      nameOr: nameEn.trim(),
      category,
      price: numericPrice,
      isAvailable: true,
      placeholderSlot: slotKey,
      imageUrl: finalUrl,
      image_url: finalUrl,
      customImage: finalUrl,
      updatedAt: now,
      description: description.trim() || "Freshly prepared dish at Bisrat Hotel Restaurant & Bar."
    };

    const updatedList = [newItem, ...menuItems];
    setMenuItems(updatedList);
    try {
      localStorage.setItem('bisrat_menu', JSON.stringify(updatedList));
      saveCloudAppState('menuItems', updatedList, paymentSettings?.cloudStorage).catch(() => {});
    } catch (e) {}

    if (finalUrl) {
      try {
        await savePhotoToStorage(slotKey, finalUrl);
        if (setPhotos) {
          setPhotos(prev => ({ ...prev, [slotKey]: finalUrl }));
        }
      } catch (err) {}
      triggerGlobalImageRefresh();
    }

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('bisrat_hotel_sync');
        channel.postMessage({ type: 'MENU_UPDATE', menuItems: updatedList, imgSyncTs: now });
        channel.postMessage({ type: 'IMG_SYNC', timestamp: now });
        channel.close();
      }
    } catch (e) {}

    // Reset Form
    setNameEn('');
    setNameAm('');
    setCategory('traditional');
    setPrice('');
    setDescription('');
    setImageUrl('');
    setAddUploadSuccess('');
    setShowAddForm(false);

    showSuccess(`✓ Added "${newItem.nameEn}" (${numericPrice} ETB) to the live menu! Visible immediately on all customer devices.`);
  };

  // Delete Item
  const handleDeleteItem = (id, name, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (window.confirm(`Are you sure you want to delete "${name}" from the menu?`)) {
      const updated = menuItems.filter(item => item.id !== id);
      setMenuItems(updated);
      try {
        localStorage.setItem('bisrat_menu', JSON.stringify(updated));
        saveCloudAppState('menuItems', updated, paymentSettings?.cloudStorage).catch(() => {});
      } catch (e) {}

      try {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const channel = new BroadcastChannel('bisrat_hotel_sync');
          channel.postMessage({ type: 'MENU_UPDATE', menuItems: updated });
          channel.close();
        }
      } catch (e) {}

      showSuccess(`Removed "${name}" from the menu.`);
    }
  };

  // Filtered list
  const filteredItems = menuItems.filter((item) => {
    const matchesCat = adminCategoryFilter === 'all' || item.category === adminCategoryFilter;
    const nameText = ((item.nameEn || '') + ' ' + (item.nameAm || '') + ' ' + (item.category || '')).toLowerCase();
    const matchesQuery = !adminSearch || nameText.includes(adminSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const totalVisible = menuItems.filter(i => i.isAvailable !== false).length;
  const totalHidden = menuItems.length - totalVisible;

  return (
    <div className="space-y-6">
      
      {/* Header & Stats Banner (Refined Luxury Theme) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8EFE9] pb-4">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1C19] flex items-center gap-2">
            <Utensils className="w-6 h-6 text-[#1B4D3E]" />
            <span>Restaurant & Bar Menu Management</span>
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Edit dish prices, replace culinary photos via cloud sync, manage in-stock status, or add new catalog items.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#1B4D3E] hover:bg-[#163E32] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C5A059]" />
          <span>Add Food or Drink Item</span>
        </button>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-[#E8EFE9] shadow-2xs">
          <p className="text-[11px] font-bold text-stone-500 uppercase">Total Catalog</p>
          <p className="text-2xl font-bold text-[#1B4D3E] mt-0.5">{menuItems.length}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-[#E8EFE9] shadow-2xs">
          <p className="text-[11px] font-bold text-stone-500 uppercase">In Stock (Visible)</p>
          <p className="text-2xl font-bold text-emerald-700 mt-0.5">{totalVisible}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-[#E8EFE9] shadow-2xs">
          <p className="text-[11px] font-bold text-stone-500 uppercase">Sold Out (Hidden)</p>
          <p className="text-2xl font-bold text-amber-700 mt-0.5">{totalHidden}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-[#E8EFE9] shadow-2xs">
          <p className="text-[11px] font-bold text-stone-500 uppercase">Active Categories</p>
          <p className="text-2xl font-bold text-[#1A1C19] mt-0.5">{CATEGORY_CONFIG.length}</p>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add New Menu Item Form Modal */}
      {showAddForm && (
        <form onSubmit={handleAddMenuItem} className="bg-white border-2 border-[#1B4D3E]/30 p-6 rounded-3xl space-y-4 shadow-md animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#E8EFE9] pb-3">
            <h4 className="font-serif text-lg font-bold text-[#1A1C19] flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#1B4D3E]" />
              <span>Add New Dish to Restaurant / Bar Menu</span>
            </h4>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="text-stone-400 hover:text-stone-700 p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Item Name (English) *</label>
              <input
                type="text"
                required
                placeholder="e.g. Grilled Salmon Steak"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full bg-[#FDFCF7] border border-[#E8EFE9] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-[#1B4D3E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Item Name (Amharic - optional)</label>
              <input
                type="text"
                placeholder="e.g. ልዩ የዓሣ ጥብስ"
                value={nameAm}
                onChange={(e) => setNameAm(e.target.value)}
                className="w-full bg-[#FDFCF7] border border-[#E8EFE9] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-[#1B4D3E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#FDFCF7] border border-[#E8EFE9] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-[#1B4D3E] capitalize"
              >
                {CATEGORY_CONFIG.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameEn} ({cat.nameAm})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Price in ETB *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 450"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-[#FDFCF7] border border-[#E8EFE9] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Item Description</label>
            <input
              type="text"
              placeholder="Short description of ingredients or preparation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#FDFCF7] border border-[#E8EFE9] rounded-xl px-3.5 py-2.5 text-xs text-stone-800 focus:ring-2 focus:ring-[#1B4D3E]"
            />
          </div>

          {/* Photo Upload with Cloud Storage */}
          <div className="bg-[#FDFCF7] p-4 rounded-2xl border border-[#E8EFE9] space-y-3">
            <label className="block text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-[#1B4D3E]" />
              <span>Dish Culinary Photo (Cloud Storage Sync):</span>
            </label>

            {addUploadError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{addUploadError}</span>
              </div>
            )}

            {addUploadSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{addUploadSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`bg-[#1B4D3E] hover:bg-[#163E32] text-white font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer block text-center transition-all shadow-xs flex items-center justify-center gap-2 ${isAddUploading ? 'opacity-60 pointer-events-none' : ''}`}>
                  {isAddUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 text-[#C5A059] animate-spin" />
                      <span>Uploading to Cloudinary...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Upload Image File (Cloudinary)</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleAddFileUpload} disabled={isAddUploading} className="hidden" />
                </label>
              </div>

              <div>
                <input
                  type="url"
                  placeholder="Or paste public image URL (https://...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={isAddUploading}
                  className="w-full bg-white border border-[#E8EFE9] rounded-xl px-3 py-2.5 text-xs text-stone-800 focus:ring-2 focus:ring-[#1B4D3E]"
                />
              </div>
            </div>

            {imageUrl && !isAddUploading && (
              <div className="flex items-center gap-3 pt-2">
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="w-16 h-14 object-cover object-center rounded-xl border border-[#E8EFE9] shadow-2xs" 
                />
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Cloud URL active & ready for all visitors</span>
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#1B4D3E] hover:bg-[#163E32] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Save Menu Item
            </button>
          </div>
        </form>
      )}

      {/* Admin Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E8EFE9] shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dishes by English or Amharic name..."
            value={adminSearch}
            onChange={(e) => setAdminSearch(e.target.value)}
            className="w-full bg-[#FDFCF7] border border-[#E8EFE9] rounded-xl pl-10 pr-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-500 whitespace-nowrap">Category:</span>
          <select
            value={adminCategoryFilter}
            onChange={(e) => setAdminCategoryFilter(e.target.value)}
            className="bg-[#FDFCF7] border border-[#E8EFE9] rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1B4D3E] capitalize"
          >
            <option value="all">All Categories ({menuItems.length})</option>
            {CATEGORY_CONFIG.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nameEn} ({menuItems.filter(i => i.category === cat.id).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Menu Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const itemImg = getItemImage(item);
          return (
            <div 
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                item.isAvailable !== false
                  ? 'bg-white border-[#E8EFE9] shadow-sm hover:shadow-md' 
                  : 'bg-stone-50 border-stone-200 opacity-75'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                {/* Centered Dish Image Thumbnail */}
                <div 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-100 border border-[#E8EFE9] shrink-0 relative shadow-2xs"
                  style={{ width: '72px', height: '72px', overflow: 'hidden' }}
                >
                  {itemImg ? (
                    <img 
                      src={itemImg} 
                      alt={item.nameEn} 
                      className="w-full h-full object-cover object-center block"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center center',
                        display: 'block'
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}
                  {item.isAvailable === false && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[9px] font-bold uppercase tracking-wider">
                      Sold Out
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif font-bold text-[#1A1C19] text-base truncate">
                      {item.nameEn}
                    </span>
                    <span className="font-mono font-bold text-xs text-[#1B4D3E] bg-[#1B4D3E]/10 border border-[#1B4D3E]/20 px-2 py-0.5 rounded-lg">
                      {item.price} ETB
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 font-medium truncate">
                    {item.nameAm} • <span className="capitalize text-[#1B4D3E] font-semibold">{item.category}</span>
                  </p>

                  {item.description && (
                    <p className="text-[11px] text-stone-400 truncate max-w-xs">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 pt-0.5 text-[11px] font-bold">
                    {item.isAvailable !== false ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>In Stock (Visible)</span>
                      </span>
                    ) : (
                      <span className="text-amber-700 flex items-center gap-1">
                        <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                        <span>Sold Out (Hidden)</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions: Edit, Toggle Availability, Delete */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center relative z-10">
                {/* EDIT BUTTON (Opens Edit Photo, Price & Stock Modal) */}
                <button
                  type="button"
                  onClick={(e) => handleOpenEdit(item, e)}
                  style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#1B4D3E] hover:bg-[#163E32] text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                  title="Edit dish price, photo, or stock"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Edit</span>
                </button>

                {/* Availability Toggle */}
                <button
                  type="button"
                  onClick={(e) => toggleAvailability(item.id, e)}
                  style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}
                  className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                    item.isAvailable !== false
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                  }`}
                  title="Toggle In-Stock / Sold-Out"
                >
                  {item.isAvailable !== false ? (
                    <ToggleRight className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 text-stone-500" />
                  )}
                  <span className="hidden sm:inline">{item.isAvailable !== false ? 'In Stock' : 'Sold Out'}</span>
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={(e) => handleDeleteItem(item.id, item.nameEn, e)}
                  style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}
                  className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Delete Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#E8EFE9] p-6">
          <Utensils className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="font-bold text-stone-700 text-sm">No dishes match your search or filter</p>
          <p className="text-xs text-stone-500 mt-1">Try clearing your search term or selecting "All Categories"</p>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT MODAL: Full CRUD for Price, Photo & Stock Toggle     */}
      {/* ======================================================== */}
      {isEditModalOpen && (editingItem || selectedDish) && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm pointer-events-auto animate-fade-in"
          style={{ zIndex: 9999, pointerEvents: 'auto' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseEdit(e);
            }
          }}
        >
          <div 
            className="relative bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E8EFE9] p-5 sm:p-7 space-y-5 pointer-events-auto"
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E8EFE9] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#1B4D3E] font-bold">
                  Bisrat Menu Editor • ID: {editingItem.id}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1C19]">
                  Edit Menu Item
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseEdit}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Close editor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              
              {/* Dish Name Display / Edit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Dish Name (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={editNameEn}
                    onChange={(e) => setEditNameEn(e.target.value)}
                    className="w-full bg-[#FDFCF7] border border-[#E8EFE9] rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-[#1B4D3E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Dish Name (Amharic)
                  </label>
                  <input
                    type="text"
                    value={editNameAm}
                    onChange={(e) => setEditNameAm(e.target.value)}
                    className="w-full bg-[#FDFCF7] border border-[#E8EFE9] rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-[#1B4D3E]"
                  />
                </div>
              </div>

              {/* Price & Category Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-[#1B4D3E]" />
                    <span>Price in ETB *</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full bg-[#FDFCF7] border border-[#E8EFE9] rounded-xl pl-3.5 pr-14 py-2.5 text-base font-bold text-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]"
                      placeholder="e.g. 450"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-stone-400">
                      ETB
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-[#FDFCF7] border border-[#E8EFE9] rounded-xl px-3 py-2.5 text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-[#1B4D3E] capitalize"
                  >
                    {CATEGORY_CONFIG.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nameEn} ({cat.nameAm})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* STOCK / AVAILABILITY STATUS TOGGLE INSIDE MODAL */}
              <div className="bg-[#FDFCF7] p-3.5 rounded-2xl border border-[#E8EFE9] flex items-center justify-between gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1A1C19]">
                    Inventory Availability (Stock Status)
                  </label>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {editIsAvailable 
                      ? 'Item is In-Stock and visible to customers on the public menu.' 
                      : 'Item is Sold Out and hidden from public ordering.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setEditIsAvailable(!editIsAvailable)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer ${
                    editIsAvailable 
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white' 
                      : 'bg-rose-700 hover:bg-rose-800 text-white'
                  }`}
                >
                  {editIsAvailable ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  <span>{editIsAvailable ? 'In Stock (Visible)' : 'Sold Out (Hidden)'}</span>
                </button>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Description / Ingredients
                </label>
                <textarea
                  rows="2"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-[#FDFCF7] border border-[#E8EFE9] rounded-xl p-3 text-xs text-stone-800 focus:ring-2 focus:ring-[#1B4D3E]"
                  placeholder="Freshly prepared with authentic ingredients..."
                />
              </div>

              {/* ============================================================== */}
              {/* PHOTO SECTION: Preview + Cloud Storage Binary Upload */}
              {/* ============================================================== */}
              <div className="bg-[#FDFCF7] p-4 rounded-2xl border border-[#E8EFE9] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#1B4D3E]" />
                    <span>Dish Photo (Cloud Storage Sync):</span>
                  </label>
                  <span className="text-[10px] text-stone-400 font-mono">
                    Centered 16:9 • Publicly Synced
                  </span>
                </div>

                {/* Dish Photo Live Preview (With Centered Crop Fix) */}
                <div 
                  className="relative w-full h-44 rounded-2xl overflow-hidden bg-stone-900 border border-[#E8EFE9] flex items-center justify-center group"
                  style={{ height: '176px', overflow: 'hidden' }}
                >
                  {editImageUrl ? (
                    <img
                      src={editImageUrl}
                      alt={editNameEn || 'Dish'}
                      className="w-full h-full object-cover object-center block transition-transform duration-500 group-hover:scale-105"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center center',
                        display: 'block'
                      }}
                    />
                  ) : (
                    <div className="text-center text-stone-400 p-4">
                      <Camera className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">No photo attached yet</p>
                    </div>
                  )}

                  {/* Overlay Badge */}
                  <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    {editImageUrl ? 'Current Photo Preview (Centered)' : 'No Photo'}
                  </div>
                </div>

                {/* Upload Feedback Messages */}
                {editUploadError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{editUploadError}</span>
                  </div>
                )}

                {editUploadSuccess && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{editUploadSuccess}</span>
                  </div>
                )}

                {/* Upload & Replace Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className={`bg-[#1B4D3E] hover:bg-[#163E32] text-white font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer block text-center transition-all shadow-xs flex items-center justify-center gap-2 ${isEditUploading ? 'opacity-60 pointer-events-none' : ''}`}>
                      {isEditUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 text-[#C5A059] animate-spin" />
                          <span>Uploading to Cloudinary...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span>Upload New Photo (Cloudinary)</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleEditFileUpload} 
                        disabled={isEditUploading} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  <div>
                    <input
                      type="url"
                      placeholder="Or paste public image URL (https://...)"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      disabled={isEditUploading}
                      className="w-full bg-white border border-[#E8EFE9] rounded-xl px-3 py-2 text-xs text-stone-800 focus:ring-2 focus:ring-[#1B4D3E]"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-stone-500 leading-normal">
                  Images uploaded here are saved to cloud storage with permanent public HTTPS URLs so customers on any device see the updated photo instantly.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8EFE9]">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditUploading}
                  className="bg-[#C5A059] hover:bg-[#B08B42] text-[#1A1C19] font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-[#1A1C19]" />
                  <span>Save Changes</span>
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}


