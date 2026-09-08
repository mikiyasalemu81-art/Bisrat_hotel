import React, { useState } from 'react';
import { Calendar, User, Phone, CheckCircle, Clock, XCircle, Search } from 'lucide-react';

export default function BookingManager({ bookings, setBookings }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const updateStatus = (id, newStatus) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = filterStatus === 'all' || b.status.toLowerCase() === filterStatus.toLowerCase();
    const query = search.toLowerCase();
    const matchesSearch = b.guestName.toLowerCase().includes(query) || b.id.toLowerCase().includes(query) || b.phone.includes(query);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-navybrand-900">
            Incoming Guest Bookings
          </h3>
          <p className="text-xs text-slate-500">
            View, confirm, or modify reservations submitted via website
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guest or ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-skybrand-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div 
              key={b.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-skybrand-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    {b.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                    b.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {b.status}
                  </span>
                </div>

                <h4 className="font-serif text-lg font-bold text-navybrand-900">
                  {b.guestName} ({b.guests} Guests)
                </h4>

                <p className="text-xs text-slate-600">
                  Room: <strong className="text-slate-800">{b.roomName}</strong> • {b.checkIn} to {b.checkOut} ({b.nights} night/s)
                </p>

                <p className="text-xs text-slate-500 flex items-center gap-2 pt-1">
                  <Phone className="w-3.5 h-3.5 text-skybrand-500" />
                  <a href={`tel:${b.phone}`} className="font-bold text-slate-700 hover:underline">{b.phone}</a>
                  <span>• Payment: <strong className="uppercase text-skybrand-700">{b.paymentMethod}</strong></span>
                </p>
              </div>

              {/* Price & Action Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col items-end justify-between gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Total Revenue</span>
                  <span className="font-serif font-bold text-lg text-emerald-700">
                    {b.totalPrice?.toLocaleString()} ETB
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateStatus(b.id, 'Confirmed')}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 border border-emerald-200"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Confirm</span>
                  </button>

                  <button
                    onClick={() => updateStatus(b.id, 'Cancelled')}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 border border-rose-200"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-500">No reservations found matching filter.</p>
        </div>
      )}

    </div>
  );
}
