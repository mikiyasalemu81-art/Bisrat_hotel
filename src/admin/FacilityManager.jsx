import React, { useState } from 'react';
import { Sparkles, Plus, Edit, Trash2, Save, X, CheckCircle2, Shield, Wifi, Utensils, Car, Zap, Coffee, Building2 } from 'lucide-react';

export default function FacilityManager({ facilities, setFacilities }) {
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [iconType, setIconType] = useState('Wifi');

  const availableIcons = ['Wifi', 'Utensils', 'Car', 'Zap', 'Coffee', 'Building2', 'Shield'];

  const handleAddFacility = (e) => {
    e.preventDefault();
    if (!title || !desc) return;

    const newFacility = {
      id: `fac-${Date.now()}`,
      title,
      desc,
      iconType,
      bg: "bg-sky-50 text-skybrand-600 border-sky-100"
    };

    setFacilities([...facilities, newFacility]);
    setTitle('');
    setDesc('');
    setShowAddForm(false);
    showSuccess("New hotel facility added successfully!");
  };

  const handleSaveEdit = (id) => {
    setFacilities(facilities.map(f => {
      if (f.id === id) {
        return { ...f, title, desc, iconType };
      }
      return f;
    }));
    setEditingId(null);
    showSuccess("Facility updated live!");
  };

  const startEdit = (fac) => {
    setEditingId(fac.id);
    setTitle(fac.title);
    setDesc(fac.desc);
    setIconType(fac.iconType || 'Wifi');
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this facility amenity?")) {
      setFacilities(facilities.filter(f => f.id !== id));
      showSuccess("Facility removed.");
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-navybrand-900">
            Hotel Facilities & Amenities Management
          </h3>
          <p className="text-xs text-slate-500">
            Add, edit, or remove key amenities displayed on the public website
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingId(null);
            setTitle('');
            setDesc('');
          }}
          className="bg-skybrand-500 hover:bg-skybrand-600 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Facility</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add New Facility Form */}
      {showAddForm && (
        <form onSubmit={handleAddFacility} className="bg-sky-50/70 border border-sky-200 p-5 rounded-2xl space-y-4 animate-fade-in">
          <h4 className="font-serif text-sm font-bold text-navybrand-900">Add Hotel Facility</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Facility Name *</label>
              <input
                type="text"
                required
                placeholder="e.g., 24/7 Power Backup, Fitness Center"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-skybrand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Icon</label>
              <select
                value={iconType}
                onChange={(e) => setIconType(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-skybrand-500"
              >
                {availableIcons.map(ic => (
                  <option key={ic} value={ic}>{ic}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
            <input
              type="text"
              required
              placeholder="Short description of this service or amenity"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-skybrand-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-skybrand-500 hover:bg-skybrand-600 text-white font-semibold px-4 py-1.5 rounded-xl text-xs"
            >
              Save Facility
            </button>
          </div>
        </form>
      )}

      {/* Facilities List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {facilities.map((fac) => (
          <div
            key={fac.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft flex items-start justify-between gap-4"
          >
            {editingId === fac.id ? (
              <div className="w-full space-y-3">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold"
                />
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs text-slate-500 hover:underline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveEdit(fac.id)}
                    className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-lg"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-navybrand-900 text-base">
                      {fac.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{fac.desc}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => startEdit(fac)}
                    className="p-1.5 text-slate-400 hover:text-skybrand-600 hover:bg-slate-100 rounded-lg"
                    title="Edit Facility"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(fac.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Delete Facility"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
