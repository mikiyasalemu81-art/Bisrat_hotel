import React, { useState } from 'react';
import { Utensils, ToggleLeft, ToggleRight, AlertCircle, CheckCircle2, Eye, EyeOff, Plus, Trash2, Upload, Link as LinkIcon, Edit } from 'lucide-react';
import { translations } from '../translations';

export default function MenuManager({ 
  menuItems, 
  setMenuItems, 
  lang 
}) {
  const t = translations[lang] || translations.en;

  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Add Item Form State
  const [nameEn, setNameEn] = useState('');
  const [nameAm, setNameAm] = useState('');
  const [category, setCategory] = useState('ethiopian');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const toggleAvailability = (id) => {
    setMenuItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddMenuItem = (e) => {
    e.preventDefault();
    if (!nameEn || !price) return;

    const newItem = {
      id: `menu-${Date.now()}`,
      nameEn,
      nameAm: nameAm || nameEn,
      nameOr: nameEn,
      category,
      price: Number(price),
      isAvailable: true,
      placeholderSlot: `custom-${Date.now()}.jpg`,
      customImage: imageUrl || null,
      description: description || "Freshly prepared dish at Bisrat Hotel Restaurant & Bar."
    };

    setMenuItems([newItem, ...menuItems]);
    
    // Reset Form
    setNameEn('');
    setNameAm('');
    setCategory('ethiopian');
    setPrice('');
    setDescription('');
    setImageUrl('');
    setShowAddForm(false);

    showSuccess(`Added "${nameEn}" to the menu! It is now live on the public Menu tab.`);
  };

  const handleDeleteItem = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the menu?`)) {
      setMenuItems(menuItems.filter(item => item.id !== id));
      showSuccess(`Removed "${name}" from the menu.`);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-navybrand-900">
            Restaurant & Bar Menu Management
          </h3>
          <p className="text-xs text-slate-500">
            Add new food/drink items, toggle live Out-of-Stock status, or update pricing
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-skybrand-500 hover:bg-skybrand-600 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Food or Drink Item</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Out of Stock Notice Banner */}
      <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-skybrand-600 shrink-0 mt-0.5" />
        <div className="text-xs text-skybrand-900 leading-relaxed">
          <p className="font-bold">Live Out-of-Stock Hiding System:</p>
          <p>{t.admin.toggleNotice}</p>
        </div>
      </div>

      {/* Add New Menu Item Form Modal / Drawer */}
      {showAddForm && (
        <form onSubmit={handleAddMenuItem} className="bg-gradient-to-br from-white via-sky-50/50 to-slate-50 border-2 border-sky-200 p-6 rounded-3xl space-y-4 shadow-soft animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-lg font-bold text-navybrand-900 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-skybrand-500" />
              <span>Add New Item to Restaurant / Bar Menu</span>
            </h4>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="text-xs font-semibold text-slate-400 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Item Name (English) *</label>
              <input
                type="text"
                required
                placeholder="e.g. Grilled Salmon Steak"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-skybrand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Item Name (Amharic - optional)</label>
              <input
                type="text"
                placeholder="e.g. ልዩ የዓሣ ጥብስ"
                value={nameAm}
                onChange={(e) => setNameAm(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-skybrand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-skybrand-500"
              >
                <option value="ethiopian">Ethiopian Cuisine</option>
                <option value="international">International</option>
                <option value="beverages">Coffee & Hot Drinks</option>
                <option value="bar">Bar & Beverages</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price in ETB *</label>
              <input
                type="number"
                required
                placeholder="e.g. 450"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-navybrand-900 focus:ring-2 focus:ring-skybrand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Item Description</label>
            <input
              type="text"
              placeholder="Short description of ingredients or preparation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-skybrand-500"
            />
          </div>

          {/* Photo Upload / Image URL Input */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-skybrand-500" />
              <span>Attach Item Photo (Upload File or Image URL):</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="bg-sky-50 hover:bg-sky-100 border border-sky-200 text-skybrand-700 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer block text-center transition-colors">
                  Choose Photo File
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div>
                <input
                  type="url"
                  placeholder="Or paste image URL (https://...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-skybrand-500"
                />
              </div>
            </div>

            {imageUrl && (
              <div className="flex items-center gap-3 pt-2">
                <img src={imageUrl} alt="Preview" className="w-16 h-12 object-cover rounded-lg border border-slate-200" />
                <span className="text-[11px] text-emerald-700 font-bold">✓ Image attached</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-skybrand-500 hover:bg-skybrand-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-colors"
            >
              Add Item to Public Menu
            </button>
          </div>
        </form>
      )}

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menuItems.map((item) => (
          <div 
            key={item.id}
            className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
              item.isAvailable 
                ? 'bg-white border-slate-200 shadow-soft' 
                : 'bg-slate-50 border-slate-300 opacity-80'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-navybrand-900 text-base">
                  {item.nameEn}
                </span>
                <span className="text-xs font-mono font-bold text-skybrand-700 bg-sky-100 px-2 py-0.5 rounded">
                  {item.price} ETB
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium">
                {item.nameAm} • <span className="capitalize text-skybrand-700 font-semibold">{item.category}</span>
              </p>

              <div className="flex items-center gap-1.5 pt-1 text-[11px] font-bold">
                {item.isAvailable ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Publicly Visible</span>
                  </span>
                ) : (
                  <span className="text-rose-600 flex items-center gap-1">
                    <EyeOff className="w-3.5 h-3.5 text-rose-500" />
                    <span>Hidden (Out of Stock)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Actions: Toggle & Delete */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleAvailability(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  item.isAvailable
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
                title="Toggle Available / Out of Stock"
              >
                {item.isAvailable ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                <span>{item.isAvailable ? t.admin.toggleAvailable : t.admin.toggleOutOfStock}</span>
              </button>

              <button
                onClick={() => handleDeleteItem(item.id, item.nameEn)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Delete Item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
