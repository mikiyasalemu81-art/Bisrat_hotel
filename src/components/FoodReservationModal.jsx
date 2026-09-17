import React, { useState } from 'react';
import { 
  X, 
  Utensils, 
  Clock, 
  Calendar, 
  User, 
  Phone, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  FileText, 
  ChevronRight,
  Loader2,
  Hash,
  ShoppingBag
} from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageUrl';
import { saveFoodReservation } from '../utils/database';

export default function FoodReservationModal({
  isOpen,
  onClose,
  item,
  lang = 'en',
  onReservationSuccess
}) {
  if (!isOpen || !item) return null;

  const displayName = lang === 'am' ? item.nameAm : lang === 'or' ? item.nameOr : item.nameEn;
  const secondaryName = lang !== 'en' ? item.nameEn : item.nameAm;

  const [quantity, setQuantity] = useState(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [diningTime, setDiningTime] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedReservation, setConfirmedReservation] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter your phone number so we can confirm your reservation.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const now = new Date();
      const refId = `FR-${Date.now().toString(36).toUpperCase()}`;

      const reservationData = {
        id: refId,
        name: fullName.trim(),
        phone: phone.trim(),
        dateSubmitted: now.toISOString(),
        menuItems: [
          {
            id: item.id,
            name: item.nameEn || displayName,
            nameAm: item.nameAm,
            price: item.price,
            quantity: quantity
          }
        ],
        menuItemNames: `${displayName} (x${quantity})`,
        tableNumber: tableNumber.trim() || 'Unassigned',
        notes: [
          diningTime ? `Requested time: ${diningTime}` : '',
          notes.trim()
        ].filter(Boolean).join(' • '),
        status: 'Pending'
      };

      const result = await saveFoodReservation(reservationData);
      setConfirmedReservation(result.record || reservationData);
      if (onReservationSuccess) {
        onReservationSuccess(result.record || reservationData);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit food reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setConfirmedReservation(null);
    setFullName('');
    setPhone('');
    setDiningTime('');
    setTableNumber('');
    setNotes('');
    setQuantity(1);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      
      <div className="bg-[#FDFCF7] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E8EFE9] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="bg-[#1B4D3E] text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C5A059] text-[#1A1C19] flex items-center justify-center font-bold shadow-sm shrink-0">
              <Utensils className="w-5 h-5 text-[#1A1C19]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-lg sm:text-xl text-white">
                  {lang === 'am' ? 'የምግብ ቅድመ-ትዕዛዝ ማረጋገጫ' : 'Food & Table Reservation'}
                </h2>
                <span className="bg-[#C5A059] text-[#1A1C19] text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  Bisrat Hotel
                </span>
              </div>
              <p className="text-xs text-[#C5A059]">
                {lang === 'am' ? 'ምርጥ የብስራት ሆቴል ባህላዊ እና ዘመናዊ ምግቦች' : 'Reserve dish & table in advance • Adama, Ethiopia'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {!confirmedReservation ? (
            /* ============================================================= */
            /* STEP 1: RESERVATION FORM                                      */
            /* ============================================================= */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Dish Preview Summary Banner */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8EFE9] shadow-2xs flex items-center gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                  {item.imageUrl ? (
                    <img
                      src={getOptimizedImageUrl(item.imageUrl, item.updatedAt)}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <Utensils className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-[#1B4D3E] bg-[#1B4D3E]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {item.category?.replace('_', ' ')}
                  </span>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#1A1C19] truncate mt-1">
                    {displayName}
                  </h3>
                  {secondaryName && secondaryName !== displayName && (
                    <p className="text-xs text-stone-600 truncate">{secondaryName}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-mono font-bold text-sm text-[#1B4D3E] bg-[#1B4D3E]/10 border border-[#1B4D3E]/20 px-2 py-0.5 rounded-lg">
                      {item.price} ETB
                    </span>
                    {quantity > 1 && (
                      <span className="text-xs text-stone-500 font-semibold">
                        Total: <strong className="text-stone-800">{item.price * quantity} ETB</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex flex-col items-center gap-1 bg-[#FDFCF7] border border-stone-200 rounded-xl p-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-700 font-bold hover:bg-stone-100 flex items-center justify-center text-sm"
                  >
                    -
                  </button>
                  <span className="font-bold text-xs text-stone-800">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-700 font-bold hover:bg-stone-100 flex items-center justify-center text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Guest Details Section */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8EFE9] shadow-2xs space-y-4">
                <h4 className="font-serif font-bold text-sm text-[#1A1C19] flex items-center gap-2 border-b border-stone-100 pb-2.5">
                  <User className="w-4 h-4 text-[#1B4D3E]" />
                  <span>{lang === 'am' ? 'የእንግዳ መረጃ' : 'Guest Contact Information'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {lang === 'am' ? 'ሙሉ ስም *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Abebe Bikila"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-stone-800 focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {lang === 'am' ? 'ስልክ ቁጥር *' : 'Phone Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0911223344"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-stone-800 focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#1B4D3E]" />
                      <span>{lang === 'am' ? 'የሚመጡበት ሰዓት' : 'Preferred Dining Time (Optional)'}</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Today at 7:30 PM, or Lunch 1:00 PM"
                      value={diningTime}
                      onChange={(e) => setDiningTime(e.target.value)}
                      className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-stone-800 focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-[#1B4D3E]" />
                      <span>{lang === 'am' ? 'የጠረጴዛ ምርጫ' : 'Table / Area Preference (Optional)'}</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. VIP room, Terrace, Table 4"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-stone-800 focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-[#1B4D3E]" />
                    <span>{lang === 'am' ? 'ልዩ ማስታወሻ ወይም ትዕዛዝ' : 'Special Requests / Notes'}</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Medium rare, extra injera, spicy sauce on side, birthday celebration setup..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl p-3 text-xs sm:text-sm text-stone-800 focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-5 py-3 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-colors"
                >
                  {lang === 'am' ? 'ይቅር' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#1B4D3E] hover:bg-[#153D31] text-white text-xs sm:text-sm font-bold px-7 py-3 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
                      <span>{lang === 'am' ? 'በመላክ ላይ...' : 'Submitting Reservation...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#C5A059]" />
                      <span>{lang === 'am' ? 'ትዕዛዙን አረጋግጥ' : 'Confirm Food Reservation'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          ) : (
            /* ============================================================= */
            /* STEP 2: SUCCESS CONFIRMATION                                  */
            /* ============================================================= */
            <div className="text-center py-6 px-2 space-y-5 animate-fade-in">
              
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-[11px] font-mono font-bold bg-[#1B4D3E]/10 text-[#1B4D3E] px-3 py-1 rounded-full border border-[#1B4D3E]/20">
                  Ref: {confirmedReservation.id}
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1A1C19] mt-3">
                  {lang === 'am' ? 'የምግብ ቅድመ-ትዕዛዝዎ ተመዝግቧል!' : 'Food Reservation Confirmed!'}
                </h3>
                <p className="text-xs text-stone-600 mt-1 max-w-md mx-auto">
                  {lang === 'am' 
                    ? 'ትዕዛዝዎ ወደ ብስራት ሆቴል ኪችን ተላልፏል። ምግቡን በሰዓቱ አዘጋጅተን እንጠብቅዎታለን!' 
                    : 'Our kitchen and dining staff at Bisrat Hotel have received your reservation and will have your table and dishes prepared.'}
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-white p-5 rounded-2xl border border-[#E8EFE9] text-left max-w-md mx-auto space-y-2.5 text-xs text-stone-700 shadow-2xs">
                <div className="flex justify-between border-b border-stone-100 pb-2">
                  <span className="text-stone-500">Dish Reserved:</span>
                  <strong className="text-stone-900">{confirmedReservation.menuItemNames}</strong>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-2">
                  <span className="text-stone-500">Guest Name:</span>
                  <strong className="text-stone-900">{confirmedReservation.name}</strong>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-2">
                  <span className="text-stone-500">Contact Phone:</span>
                  <strong className="text-stone-900">{confirmedReservation.phone}</strong>
                </div>
                {confirmedReservation.notes && (
                  <div className="border-b border-stone-100 pb-2">
                    <span className="text-stone-500 block mb-0.5">Notes:</span>
                    <span className="text-stone-800 italic">{confirmedReservation.notes}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1">
                  <span className="text-stone-500">Status:</span>
                  <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                    {confirmedReservation.status}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="bg-[#1B4D3E] hover:bg-[#153D31] text-white font-bold text-xs sm:text-sm px-8 py-3 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {lang === 'am' ? 'ወደ ዋናው ገጽ ተመለስ' : 'Return to Menu'}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
