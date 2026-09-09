import React, { useState } from 'react';
import { X, Calendar, User, Phone, Mail, CreditCard, CheckCircle, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { translations } from '../translations';

export default function BookingModal({ 
  isOpen, 
  onClose, 
  selectedRoom, 
  rooms = [], 
  lang,
  paymentSettings = {},
  onBookingSubmit 
}) {
  if (!isOpen) return null;

  const t = translations[lang] || translations.en;

  const enabledMethods = paymentSettings?.paymentMethods || { telebirr: true, cbe: true, arrival: true };

  const [activeRoomId, setActiveRoomId] = useState(selectedRoom?.id || rooms[0]?.id || '');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [checkIn, setCheckIn] = useState(new Date().toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [guests, setGuests] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState(() => {
    if (enabledMethods.telebirr) return 'telebirr';
    if (enabledMethods.cbe) return 'cbe';
    return 'arrival';
  });
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const currentRoom = rooms.find(r => r.id === activeRoomId) || selectedRoom || rooms[0];

  // Calculate nights & price
  const calculateNights = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights();
  const totalPrice = (currentRoom?.price || 2500) * nights;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !phone) {
      alert("Please fill in your name and phone number.");
      return;
    }

    const refNumber = `BH-${Math.floor(100000 + Math.random() * 900000)}`;
    const newBooking = {
      id: refNumber,
      roomName: t.rooms[currentRoom.nameKey] || currentRoom.nameKey,
      guestName: fullName,
      phone,
      email,
      checkIn,
      checkOut,
      nights,
      guests,
      totalPrice,
      paymentMethod,
      status: 'Confirmed',
      createdAt: new Date().toLocaleDateString()
    };

    onBookingSubmit(newBooking);
    setConfirmedBooking(newBooking);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!confirmedBooking ? (
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1 text-xs font-bold text-[#C8A24A] bg-[#FAF2E1] border border-[#C8A24A]/40 px-3 py-1 rounded-full mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#C8A24A]" />
                <span>Bisrat Hotel Reservation</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
                {t.booking.modalTitle}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Room Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.hero.roomType}
                </label>
                <select
                  value={activeRoomId}
                  onChange={(e) => setActiveRoomId(e.target.value)}
                  className="w-full bg-[#FAF7F0] border border-[#E8E0D2] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#C8A24A] focus:outline-none"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {t.rooms[r.nameKey] || r.nameKey} — {r.price.toLocaleString()} ETB {t.rooms.night}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates & Guest Count */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#C8A24A]" />
                    {t.hero.checkIn}
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    required
                    className="w-full bg-[#FAF7F0] border border-[#E8E0D2] rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:ring-2 focus:ring-[#C8A24A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#C8A24A]" />
                    {t.hero.checkOut}
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    required
                    className="w-full bg-[#FAF7F0] border border-[#E8E0D2] rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:ring-2 focus:ring-[#C8A24A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#C8A24A]" />
                    {t.booking.guestsCount}
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full bg-[#FAF7F0] border border-[#E8E0D2] rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:ring-2 focus:ring-[#C8A24A] focus:outline-none"
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4 Guests</option>
                  </select>
                </div>
              </div>

              {/* Guest Personal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#C8A24A]" />
                    {t.booking.fullName} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.booking.fullNamePlaceholder}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#FAF7F0] border border-[#E8E0D2] rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-[#C8A24A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#C8A24A]" />
                    {t.booking.phoneLabel} *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={t.booking.phonePlaceholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#FAF7F0] border border-[#E8E0D2] rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-[#C8A24A] focus:outline-none"
                  />
                </div>
              </div>

              {/* Payment Methods Choice */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {t.booking.paymentTitle}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Telebirr Choice */}
                  {enabledMethods.telebirr && (
                    <div
                      onClick={() => setPaymentMethod('telebirr')}
                      className={`cursor-pointer rounded-2xl p-3.5 border-2 transition-all flex flex-col justify-between ${
                        paymentMethod === 'telebirr'
                          ? 'border-[#C8A24A] bg-[#FAF2E1] shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-[#977227] bg-[#FAF2E1] px-2 py-0.5 rounded border border-[#C8A24A]/30">
                          telebirr
                        </span>
                        <input 
                          type="radio" 
                          name="payment" 
                          checked={paymentMethod === 'telebirr'} 
                          onChange={() => setPaymentMethod('telebirr')}
                        />
                      </div>
                      <p className="text-xs font-semibold text-[#1A1A1A]">{t.booking.telebirr}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{t.booking.telebirrDesc}</p>
                    </div>
                  )}

                  {/* CBE Birr Choice */}
                  {enabledMethods.cbe && (
                    <div
                      onClick={() => setPaymentMethod('cbe')}
                      className={`cursor-pointer rounded-2xl p-3.5 border-2 transition-all flex flex-col justify-between ${
                        paymentMethod === 'cbe'
                          ? 'border-[#C8A24A] bg-[#FAF2E1] shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                          CBE Birr
                        </span>
                        <input 
                          type="radio" 
                          name="payment" 
                          checked={paymentMethod === 'cbe'} 
                          onChange={() => setPaymentMethod('cbe')}
                        />
                      </div>
                      <p className="text-xs font-semibold text-[#1A1A1A]">{t.booking.cbe}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{t.booking.cbeDesc}</p>
                    </div>
                  )}

                  {/* Pay on Arrival Choice */}
                  {enabledMethods.arrival && (
                    <div
                      onClick={() => setPaymentMethod('arrival')}
                      className={`cursor-pointer rounded-2xl p-3.5 border-2 transition-all flex flex-col justify-between ${
                        paymentMethod === 'arrival'
                          ? 'border-[#C8A24A] bg-[#FAF2E1] shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Building2 className="w-4 h-4 text-[#C8A24A]" />
                        <input 
                          type="radio" 
                          name="payment" 
                          checked={paymentMethod === 'arrival'} 
                          onChange={() => setPaymentMethod('arrival')}
                        />
                      </div>
                      <p className="text-xs font-semibold text-[#1A1A1A]">{t.booking.arrival}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{t.booking.arrivalDesc}</p>
                    </div>
                  )}

                </div>
              </div>

              {/* Payment Instructions Display */}
              {paymentMethod === 'telebirr' && enabledMethods.telebirr && (
                <div className="bg-[#FAF2E1] border border-[#C8A24A]/40 rounded-2xl p-4 text-xs text-slate-800 space-y-1">
                  <p className="font-bold text-[#1A1A1A]">{t.booking.telebirrInstrTitle}</p>
                  <p className="font-mono text-[#977227] bg-white px-2 py-1 rounded inline-block border border-[#C8A24A]/40 font-bold">
                    Shortcode / Merchant ID: {paymentSettings.telebirrShortcode || t.booking.telebirrShortcode}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">{t.booking.telebirrSteps}</p>
                </div>
              )}

              {paymentMethod === 'cbe' && enabledMethods.cbe && (
                <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-4 text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-purple-900">{t.booking.cbeInstrTitle}</p>
                  <p className="font-mono text-purple-900 bg-white px-2 py-1 rounded inline-block border border-purple-200 font-bold">
                    CBE Account #: {paymentSettings.cbeAccountNumber || t.booking.cbeAccNum}
                  </p>
                  <p className="text-[11px] text-purple-800 font-medium">
                    Account Name: {paymentSettings.cbeAccountName || "Bisrat Hotel"}
                  </p>
                </div>
              )}

              {/* Price Calculation Summary & Submit Button (Gold Background + Dark Text) */}
              <div className="bg-[#1A1A1A] text-white rounded-2xl p-4 flex items-center justify-between border border-[#C8A24A]/30">
                <div>
                  <p className="text-xs text-slate-300 font-medium">
                    {t.booking.totalPrice} ({nights} {t.booking.nightsCount})
                  </p>
                  <p className="text-xl font-serif font-bold text-[#C8A24A]">
                    {totalPrice.toLocaleString()} ETB
                  </p>
                </div>
                <button
                  type="submit"
                  className="bg-[#C8A24A] hover:bg-[#B58E38] text-[#1A1A1A] font-bold px-6 py-3 rounded-xl shadow-md transition-all text-sm flex items-center gap-2 border border-[#D8B96D]"
                >
                  <ShieldCheck className="w-4 h-4 text-[#1A1A1A]" />
                  <span>{t.booking.submitButton}</span>
                </button>
              </div>

            </form>
          </div>
        ) : (
          /* Confirmation State */
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h3 className="font-serif text-2xl font-bold text-navybrand-900">
              {t.booking.successTitle}
            </h3>

            <p className="text-sm text-slate-600">
              {t.booking.successMessage}
            </p>

            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 inline-block font-mono text-xl font-bold text-skybrand-700 tracking-wider">
              {confirmedBooking.id}
            </div>

            <div className="text-xs text-slate-500 max-w-md mx-auto space-y-1">
              <p>Room: <strong className="text-slate-800">{confirmedBooking.roomName}</strong></p>
              <p>Dates: <strong className="text-slate-800">{confirmedBooking.checkIn} → {confirmedBooking.checkOut} ({confirmedBooking.nights} night/s)</strong></p>
              <p>Total: <strong className="text-skybrand-700">{confirmedBooking.totalPrice.toLocaleString()} ETB</strong> ({confirmedBooking.paymentMethod.toUpperCase()})</p>
            </div>

            <p className="text-xs text-slate-500 italic bg-sky-50 p-3 rounded-xl border border-sky-100 max-w-md mx-auto">
              {t.booking.saveNotice} Direct Reception Line: <strong>0906320251</strong>
            </p>

            <button
              onClick={onClose}
              className="bg-navybrand-900 hover:bg-slate-800 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors"
            >
              Close Window
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
