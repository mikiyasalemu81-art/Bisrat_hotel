import React, { useState, useMemo } from 'react';
import { 
  BedDouble, 
  Utensils, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertCircle,
  FileText,
  DollarSign,
  Tag,
  Hash,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { 
  updateRoomReservationStatus, 
  deleteRoomReservation,
  updateFoodReservationStatus,
  deleteFoodReservation
} from '../utils/database';

export default function ReservationsManager({
  roomReservations = [],
  setRoomReservations,
  foodReservations = [],
  setFoodReservations,
  lang = 'en',
  onRefresh
}) {
  // Active Tab: 'rooms' | 'food'
  const [activeSubTab, setActiveSubTab] = useState('rooms');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  const triggerNotice = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleManualRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        triggerNotice('✓ Refreshed latest reservations from server.');
      } catch (e) {
        console.warn(e);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Format date helper
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  /* ========================================================================= */
  /* ROOM RESERVATIONS LOGIC                                                   */
  /* ========================================================================= */
  const handleRoomStatusChange = async (id, newStatus) => {
    try {
      const updated = await updateRoomReservationStatus(id, newStatus);
      if (setRoomReservations) setRoomReservations(updated);
      triggerNotice(`Room reservation status set to "${newStatus}" & saved to server.`);
    } catch (err) {
      alert('Failed to update status on server: ' + err.message);
    }
  };

  const handleRoomDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room reservation from the database?')) return;
    try {
      const updated = await deleteRoomReservation(id);
      if (setRoomReservations) setRoomReservations(updated);
      triggerNotice('Room reservation deleted from server.');
    } catch (err) {
      alert('Failed to delete reservation: ' + err.message);
    }
  };

  // Filtered and sorted room reservations (most recent first)
  const filteredRoomReservations = useMemo(() => {
    let list = [...(roomReservations || [])];

    // Sort most recent first
    list.sort((a, b) => {
      const timeA = a.dateSubmitted ? new Date(a.dateSubmitted).getTime() : 0;
      const timeB = b.dateSubmitted ? new Date(b.dateSubmitted).getTime() : 0;
      return timeB - timeA;
    });

    if (statusFilter !== 'all') {
      list = list.filter(r => (r.status || '').toLowerCase() === statusFilter.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => 
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.phone && r.phone.includes(q)) ||
        (r.id && r.id.toLowerCase().includes(q)) ||
        (r.roomName && r.roomName.toLowerCase().includes(q))
      );
    }

    return list;
  }, [roomReservations, statusFilter, searchQuery]);

  /* ========================================================================= */
  /* FOOD RESERVATIONS LOGIC                                                   */
  /* ========================================================================= */
  const handleFoodStatusChange = async (id, newStatus) => {
    try {
      const updated = await updateFoodReservationStatus(id, newStatus);
      if (setFoodReservations) setFoodReservations(updated);
      triggerNotice(`Food reservation status set to "${newStatus}" & saved to server.`);
    } catch (err) {
      alert('Failed to update status on server: ' + err.message);
    }
  };

  const handleFoodDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this food reservation from the database?')) return;
    try {
      const updated = await deleteFoodReservation(id);
      if (setFoodReservations) setFoodReservations(updated);
      triggerNotice('Food reservation deleted from server.');
    } catch (err) {
      alert('Failed to delete reservation: ' + err.message);
    }
  };

  // Filtered and sorted food reservations (most recent first)
  const filteredFoodReservations = useMemo(() => {
    let list = [...(foodReservations || [])];

    // Sort most recent first
    list.sort((a, b) => {
      const timeA = a.dateSubmitted ? new Date(a.dateSubmitted).getTime() : 0;
      const timeB = b.dateSubmitted ? new Date(b.dateSubmitted).getTime() : 0;
      return timeB - timeA;
    });

    if (statusFilter !== 'all') {
      list = list.filter(f => (f.status || '').toLowerCase() === statusFilter.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(f => 
        (f.name && f.name.toLowerCase().includes(q)) ||
        (f.phone && f.phone.includes(q)) ||
        (f.id && f.id.toLowerCase().includes(q)) ||
        (f.menuItemNames && f.menuItemNames.toLowerCase().includes(q)) ||
        (f.notes && f.notes.toLowerCase().includes(q))
      );
    }

    return list;
  }, [foodReservations, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner & Tab Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8EFE9] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B4D3E] bg-[#1B4D3E]/10 border border-[#1B4D3E]/20 px-3 py-0.5 rounded-full mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#1B4D3E]" />
            <span>Server Database Tables</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#1A1C19]">
            Guest Reservations Management
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Two distinct persistent database tables: Room Bookings and Restaurant Food Reservations.
          </p>
        </div>

        {/* Action Notice */}
        {actionNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Refresh button */}
        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-2xs transition-colors cursor-pointer self-start md:self-auto"
          title="Reload latest from database server"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#1B4D3E] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Server Data'}</span>
        </button>
      </div>

      {/* Two Separate Lists / Tabs Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Tab Buttons: Room Reservations vs Food Reservations */}
        <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-2xl border border-stone-200">
          <button
            type="button"
            onClick={() => { setActiveSubTab('rooms'); setStatusFilter('all'); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'rooms'
                ? 'bg-[#1B4D3E] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BedDouble className="w-4 h-4" />
            <span>Room Reservations</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              activeSubTab === 'rooms' ? 'bg-[#C5A059] text-[#1A1C19]' : 'bg-stone-200 text-stone-700'
            }`}>
              {roomReservations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveSubTab('food'); setStatusFilter('all'); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'food'
                ? 'bg-[#1B4D3E] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Food Reservations</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              activeSubTab === 'food' ? 'bg-[#C5A059] text-[#1A1C19]' : 'bg-stone-200 text-stone-700'
            }`}>
              {foodReservations.length}
            </span>
          </button>
        </div>

        {/* Filter Controls (Search + Status) */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${activeSubTab === 'rooms' ? 'guest or room...' : 'guest or dish...'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-stone-200 rounded-xl pl-8 pr-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1B4D3E] w-48 sm:w-60 shadow-2xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#1B4D3E] shadow-2xs"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

      </div>

      {/* =================================================================== */}
      {/* TAB 1: ROOM RESERVATIONS TABLE                                      */}
      {/* =================================================================== */}
      {activeSubTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-base text-[#1A1C19] flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-[#1B4D3E]" />
              <span>Database Table: <code>room_reservations</code> ({filteredRoomReservations.length} records)</span>
            </h4>
            <span className="text-xs text-stone-500">Sorted by most recent submissions</span>
          </div>

          {filteredRoomReservations.length > 0 ? (
            <div className="bg-white rounded-2xl border border-[#E8EFE9] shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700 border-collapse">
                  <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Guest Name & Ref</th>
                      <th className="py-3.5 px-4">Phone & Email</th>
                      <th className="py-3.5 px-4">Date Submitted</th>
                      <th className="py-3.5 px-4">Check-In / Nights</th>
                      <th className="py-3.5 px-4">Guests</th>
                      <th className="py-3.5 px-4">Room & Payment</th>
                      <th className="py-3.5 px-4">Total Price</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredRoomReservations.map((res) => {
                      const isConfirmed = res.status?.toLowerCase() === 'confirmed';
                      const isCancelled = res.status?.toLowerCase() === 'cancelled';
                      const isPending = !isConfirmed && !isCancelled;

                      return (
                        <tr key={res.id} className="hover:bg-stone-50/60 transition-colors">
                          {/* Name & Ref */}
                          <td className="py-3.5 px-4">
                            <strong className="block text-sm font-serif text-[#1A1C19]">{res.name}</strong>
                            <span className="font-mono text-[10px] text-[#1B4D3E] font-bold bg-[#1B4D3E]/10 px-1.5 py-0.5 rounded">
                              {res.id}
                            </span>
                          </td>

                          {/* Phone & Contact */}
                          <td className="py-3.5 px-4">
                            <a href={`tel:${res.phone}`} className="font-mono font-bold text-[#1A1C19] hover:text-[#1B4D3E] hover:underline flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#1B4D3E]" />
                              <span>{res.phone}</span>
                            </a>
                            {res.email && (
                              <span className="text-[10px] text-stone-500 block truncate max-w-[140px]">{res.email}</span>
                            )}
                          </td>

                          {/* Date Submitted */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-stone-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-stone-400" />
                              <span>{formatDateTime(res.dateSubmitted)}</span>
                            </div>
                          </td>

                          {/* Check-In Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 font-bold text-stone-800">
                              <Calendar className="w-3 h-3 text-[#1B4D3E]" />
                              <span>{res.checkInDate || res.checkIn || 'N/A'}</span>
                            </div>
                            <span className="text-[10px] text-stone-500 block">
                              {res.nights || 1} Night{Number(res.nights) > 1 ? 's' : ''}
                            </span>
                          </td>

                          {/* Number of Guests */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="bg-stone-100 border border-stone-200 font-bold px-2 py-0.5 rounded text-stone-800">
                              {res.guests || 1} Guest{Number(res.guests) > 1 ? 's' : ''}
                            </span>
                          </td>

                          {/* Room & Payment */}
                          <td className="py-3.5 px-4">
                            <strong className="block text-stone-900">{res.roomName}</strong>
                            <span className="text-[10px] text-stone-500 uppercase">{res.paymentMethod}</span>
                          </td>

                          {/* Total Price */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                              {Number(res.totalPrice).toLocaleString()} ETB
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              isConfirmed ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              isCancelled ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                              'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {res.status || 'Pending'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isConfirmed && (
                                <button
                                  type="button"
                                  onClick={() => handleRoomStatusChange(res.id, 'Confirmed')}
                                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                  title="Confirm Reservation"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {!isCancelled && (
                                <button
                                  type="button"
                                  onClick={() => handleRoomStatusChange(res.id, 'Cancelled')}
                                  className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                                  title="Cancel Reservation"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRoomDelete(res.id)}
                                className="p-1.5 rounded-lg bg-stone-100 text-stone-500 hover:text-red-700 hover:bg-red-50 border border-stone-200 transition-colors"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
              <BedDouble className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-600">No room reservations found.</p>
              <p className="text-xs text-stone-400 mt-1">Room reservations submitted by guests will appear here in real-time.</p>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: FOOD RESERVATIONS TABLE                                      */}
      {/* =================================================================== */}
      {activeSubTab === 'food' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-base text-[#1A1C19] flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#1B4D3E]" />
              <span>Database Table: <code>food_reservations</code> ({filteredFoodReservations.length} records)</span>
            </h4>
            <span className="text-xs text-stone-500">Sorted by most recent submissions</span>
          </div>

          {filteredFoodReservations.length > 0 ? (
            <div className="bg-white rounded-2xl border border-[#E8EFE9] shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700 border-collapse">
                  <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Guest Name & Ref</th>
                      <th className="py-3.5 px-4">Phone Number</th>
                      <th className="py-3.5 px-4">Date / Time Submitted</th>
                      <th className="py-3.5 px-4">Requested Menu Item(s)</th>
                      <th className="py-3.5 px-4">Table / Area</th>
                      <th className="py-3.5 px-4">Notes & Special Requests</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredFoodReservations.map((fRes) => {
                      const isConfirmed = fRes.status?.toLowerCase() === 'confirmed';
                      const isCancelled = fRes.status?.toLowerCase() === 'cancelled';
                      const isCompleted = fRes.status?.toLowerCase() === 'completed';
                      const isPending = !isConfirmed && !isCancelled && !isCompleted;

                      return (
                        <tr key={fRes.id} className="hover:bg-stone-50/60 transition-colors">
                          {/* Guest Name & Ref */}
                          <td className="py-3.5 px-4">
                            <strong className="block text-sm font-serif text-[#1A1C19]">{fRes.name}</strong>
                            <span className="font-mono text-[10px] text-[#1B4D3E] font-bold bg-[#1B4D3E]/10 px-1.5 py-0.5 rounded">
                              {fRes.id}
                            </span>
                          </td>

                          {/* Phone Number */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <a href={`tel:${fRes.phone}`} className="font-mono font-bold text-[#1A1C19] hover:text-[#1B4D3E] hover:underline flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#1B4D3E]" />
                              <span>{fRes.phone}</span>
                            </a>
                          </td>

                          {/* Date / Time Submitted */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-stone-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-stone-400" />
                              <span>{formatDateTime(fRes.dateSubmitted)}</span>
                            </div>
                          </td>

                          {/* Menu Item(s) Requested */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <Utensils className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                              <strong className="text-stone-900 font-medium">
                                {fRes.menuItemNames || 'Signature Dish'}
                              </strong>
                            </div>
                          </td>

                          {/* Table Number */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {fRes.tableNumber ? (
                              <span className="inline-flex items-center gap-1 bg-[#1B4D3E]/10 text-[#1B4D3E] font-bold px-2 py-0.5 rounded text-[11px]">
                                <Hash className="w-3 h-3" />
                                <span>{fRes.tableNumber}</span>
                              </span>
                            ) : (
                              <span className="text-stone-400 italic">Unassigned</span>
                            )}
                          </td>

                          {/* Notes / Special Requests */}
                          <td className="py-3.5 px-4 max-w-xs">
                            {fRes.notes ? (
                              <span className="text-stone-800 italic block line-clamp-2" title={fRes.notes}>
                                "{fRes.notes}"
                              </span>
                            ) : (
                              <span className="text-stone-400 italic">None</span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              isConfirmed ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              isCompleted ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                              isCancelled ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                              'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {fRes.status || 'Pending'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isConfirmed && !isCompleted && (
                                <button
                                  type="button"
                                  onClick={() => handleFoodStatusChange(fRes.id, 'Confirmed')}
                                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                  title="Confirm Reservation"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {!isCompleted && isConfirmed && (
                                <button
                                  type="button"
                                  onClick={() => handleFoodStatusChange(fRes.id, 'Completed')}
                                  className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                                  title="Mark Prepared / Completed"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                                </button>
                              )}
                              {!isCancelled && (
                                <button
                                  type="button"
                                  onClick={() => handleFoodStatusChange(fRes.id, 'Cancelled')}
                                  className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                                  title="Cancel Reservation"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleFoodDelete(fRes.id)}
                                className="p-1.5 rounded-lg bg-stone-100 text-stone-500 hover:text-red-700 hover:bg-red-50 border border-stone-200 transition-colors"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
              <Utensils className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-600">No food reservations found.</p>
              <p className="text-xs text-stone-400 mt-1">When customers tap "Reserve" on any dish on the public menu, orders appear here in real-time.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
