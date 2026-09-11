import React, { useState } from 'react';
import { Bed, Edit, Save, ToggleLeft, ToggleRight, CheckCircle2 } from 'lucide-react';
import { translations } from '../translations';
import { getOptimizedImageUrl } from '../utils/imageUrl';

export default function RoomManager({ 
  rooms, 
  setRooms, 
  lang 
}) {
  const t = translations[lang] || translations.en;

  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');

  const toggleRoomAvailability = (id) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, isAvailable: !r.isAvailable } : r));
  };

  const startEditPrice = (room) => {
    setEditingId(room.id);
    setEditPrice(room.price);
  };

  const savePrice = (id) => {
    const updatedPrice = Number(editPrice);
    if (isNaN(updatedPrice) || updatedPrice <= 0) return;

    const updatedRooms = rooms.map(r => r.id === id ? { ...r, price: updatedPrice } : r);
    setRooms(updatedRooms);
    try {
      localStorage.setItem('bisrat_rooms', JSON.stringify(updatedRooms));
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('bisrat_hotel_sync');
        channel.postMessage({ type: 'ROOMS_UPDATE', rooms: updatedRooms });
        channel.close();
      }
    } catch (e) {}
    setEditingId(null);
    setSuccessMsg('Price updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-serif text-xl font-bold text-navybrand-900">
            {t.admin.manageRooms}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Update real-time pricing and room availability for online guests.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.map((room) => {
          const roomName = t.rooms[room.nameKey] || room.nameKey;

          return (
            <div 
              key={room.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft flex flex-col justify-between"
            >
              <div>
                {/* Room Header & Image Thumbnail */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <img 
                        src={getOptimizedImageUrl(room.image || `/images/${room.placeholderSlot}`)} 
                        alt={roomName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-navybrand-900 text-base">
                        {roomName}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {room.capacity} Guests • {room.bedType}
                      </p>
                    </div>
                  </div>

                  {/* Availability Toggle */}
                  <button
                    onClick={() => toggleRoomAvailability(room.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                      room.isAvailable
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {room.isAvailable ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-slate-500" />}
                    <span>{room.isAvailable ? 'Available' : 'Booked'}</span>
                  </button>
                </div>

                {/* Editable Price Field */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Nightly Rate (ETB):</span>

                  {editingId === room.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-28 bg-white border border-skybrand-400 rounded-lg px-2.5 py-1 text-xs font-bold text-navybrand-900 focus:ring-2 focus:ring-skybrand-500 focus:outline-none"
                      />
                      <button
                        onClick={() => savePrice(room.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg text-xs font-bold transition-colors"
                        title="Save New Rate"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-skybrand-700 text-lg">
                        {room.price.toLocaleString()} ETB
                      </span>
                      <button
                        onClick={() => startEditPrice(room)}
                        className="bg-white hover:bg-slate-100 text-slate-700 p-1.5 rounded-lg border border-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Edit Price"
                      >
                        <Edit className="w-3.5 h-3.5 text-skybrand-600" />
                        <span>Edit Rate</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 text-[10px] font-mono text-slate-400">
                Photo Asset: {room.image || `/images/${room.placeholderSlot}`}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
