import React, { useState, useEffect } from 'react';
import { 
  X, 
  Utensils, 
  Phone, 
  Hash, 
  CreditCard, 
  Building2, 
  Smartphone, 
  CheckCircle2, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  Copy, 
  Check, 
  PhoneCall, 
  ShieldCheck 
} from 'lucide-react';

export default function CustomerPaymentDrawer({
  isOpen,
  onClose,
  orderItems = [],
  onUpdateQuantity,
  onClearOrder,
  paymentSettings = {},
  lang = 'en'
}) {
  const activeTables = Array.isArray(paymentSettings?.activeTables) && paymentSettings.activeTables.length > 0
    ? paymentSettings.activeTables
    : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'VIP 1', 'VIP 2', 'Terrace 1'];

  const defaultTable = paymentSettings?.tableNumber || activeTables[0] || '1';
  const frontDeskPhone = paymentSettings?.phoneNumber || '0906320251';
  const cbeAccount = paymentSettings?.cbeAccountNumber || '1000123456789';
  const cbeName = paymentSettings?.cbeAccountName || 'Bisrat Hotel Adama';
  const telebirrCode = paymentSettings?.telebirrShortcode || '654321';
  const enabledMethods = paymentSettings?.paymentMethods || { telebirr: true, cbe: true, arrival: true, cash: true };

  const [selectedTable, setSelectedTable] = useState(defaultTable);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cbe');
  const [copiedCbe, setCopiedCbe] = useState(false);
  const [copiedTele, setCopiedTele] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  useEffect(() => {
    if (defaultTable) {
      setSelectedTable(defaultTable);
    }
  }, [defaultTable]);

  useEffect(() => {
    if (enabledMethods.cbe) {
      setPaymentMethod('cbe');
    } else if (enabledMethods.telebirr) {
      setPaymentMethod('telebirr');
    } else {
      setPaymentMethod('cash');
    }
  }, [enabledMethods.cbe, enabledMethods.telebirr, enabledMethods.cash, enabledMethods.arrival]);

  if (!isOpen) return null;

  const totalAmount = orderItems.reduce((sum, entry) => {
    const price = Number(entry.item?.price) || 0;
    return sum + price * (entry.quantity || 1);
  }, 0);

  const totalItemCount = orderItems.reduce((sum, entry) => sum + (entry.quantity || 1), 0);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'cbe') {
      setCopiedCbe(true);
      setTimeout(() => setCopiedCbe(false), 2500);
    } else {
      setCopiedTele(true);
      setTimeout(() => setCopiedTele(false), 2500);
    }
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      alert('Your order is empty. Please add items from the menu first.');
      return;
    }

    const orderRef = 'BH-ORD-' + Math.floor(100000 + Math.random() * 900000);
    const confirmed = {
      orderId: orderRef,
      table: selectedTable,
      guestName: guestName || 'Dining Guest',
      guestPhone: guestPhone || frontDeskPhone,
      items: [...orderItems],
      totalAmount,
      paymentMethod,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setOrderConfirmed(confirmed);
    if (onClearOrder) onClearOrder();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div 
        className="w-full max-w-lg bg-[#FDFCF7] h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-[#E8EFE9]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="bg-[#1B4D3E] text-white p-4 sm:p-5 flex items-center justify-between sticky top-0 z-20 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C5A059] text-[#1A1C19] flex items-center justify-center font-bold shadow-xs">
              <ShoppingBag className="w-5 h-5 text-[#1A1C19]" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-white">
                Dining Order & Payment
              </h2>
              <p className="text-xs text-[#C5A059] font-medium">
                Bisrat Hotel Adama • Restaurant & Bar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            aria-label="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        {!orderConfirmed ? (
          <form onSubmit={handlePlaceOrder} className="p-4 sm:p-6 space-y-6 flex-1">
            
            {/* 1. Select Active Table */}
            <div className="bg-white p-4 rounded-2xl border border-[#E8EFE9] shadow-xs space-y-2.5">
              <label className="block text-xs font-bold text-[#1A1C19] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-[#1B4D3E]" />
                  <span>Select Active Dining Table:</span>
                </span>
                <span className="text-[11px] text-[#1B4D3E] font-semibold">
                  {activeTables.length} Active Tables
                </span>
              </label>

              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#1A1C19] focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none"
              >
                {activeTables.map((tbl) => (
                  <option key={tbl} value={tbl}>
                    Table {tbl}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Order Items List */}
            <div className="bg-white p-4 rounded-2xl border border-[#E8EFE9] shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h3 className="font-serif font-bold text-sm text-[#1A1C19] flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-[#1B4D3E]" />
                  <span>Your Dishes & Drinks ({totalItemCount})</span>
                </h3>
                {orderItems.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearOrder}
                    className="text-[11px] text-rose-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {orderItems.length > 0 ? (
                <div className="divide-y divide-stone-100 max-h-56 overflow-y-auto pr-1">
                  {orderItems.map((entry) => {
                    const dish = entry.item;
                    const qty = entry.quantity || 1;
                    const lineTotal = (Number(dish.price) || 0) * qty;

                    return (
                      <div key={dish.id} className="py-2.5 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-serif font-bold text-xs sm:text-sm text-stone-900 truncate">
                            {dish.nameEn}
                          </p>
                          <p className="text-[11px] text-stone-500 font-mono">
                            {dish.price} ETB each
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1 bg-[#FDFCF7] border border-stone-200 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(dish.id, -1)}
                              className="w-5 h-5 rounded hover:bg-stone-200 flex items-center justify-center text-stone-700"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center text-xs font-bold font-mono">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(dish.id, 1)}
                              className="w-5 h-5 rounded hover:bg-stone-200 flex items-center justify-center text-stone-700"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-mono font-bold text-xs sm:text-sm text-[#1B4D3E] min-w-[55px] text-right">
                            {lineTotal.toLocaleString()} ETB
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-stone-500">
                  <p>Your order is currently empty.</p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Click "Add to Order" on any dish or beverage in the menu to add it here.
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-sm font-bold text-stone-900">
                <span>Total Order Amount:</span>
                <span className="font-serif text-base text-[#1B4D3E]">
                  {totalAmount.toLocaleString()} ETB
                </span>
              </div>
            </div>

            {/* 3. Direct Contact Info */}
            <div className="bg-[#1B4D3E]/5 p-3.5 rounded-2xl border border-[#1B4D3E]/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#1A1C19]">
                <PhoneCall className="w-4 h-4 text-[#1B4D3E] shrink-0" />
                <div>
                  <span className="font-bold block">Front-Desk Assistance:</span>
                  <span className="text-[11px] text-slate-500">Need special preparation?</span>
                </div>
              </div>
              <a
                href={`tel:${frontDeskPhone}`}
                className="font-mono font-bold text-xs text-[#1B4D3E] bg-white border border-[#1B4D3E]/30 px-3 py-1.5 rounded-xl hover:bg-[#1B4D3E] hover:text-white transition-colors shadow-2xs"
              >
                {frontDeskPhone}
              </a>
            </div>

            {/* 4. Payment Method Selection (Dynamically Populated from Admin Settings) */}
            <div className="bg-white p-4 rounded-2xl border border-[#E8EFE9] shadow-xs space-y-3">
              <label className="block text-xs font-bold text-[#1A1C19] flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#1B4D3E]" />
                <span>Select Payment Method:</span>
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                
                {/* CBE Mobile Banking Option */}
                {enabledMethods.cbe && (
                  <div
                    onClick={() => setPaymentMethod('cbe')}
                    className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === 'cbe' 
                        ? 'bg-[#1B4D3E]/10 border-[#1B4D3E] shadow-xs' 
                        : 'bg-[#FDFCF7] border-[#E8EFE9] hover:border-[#1B4D3E]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#1B4D3E]" />
                        <span className="font-bold text-xs text-[#1A1C19]">
                          Commercial Bank of Ethiopia (CBE Mobile Banking)
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'cbe'}
                        onChange={() => setPaymentMethod('cbe')}
                        className="text-[#1B4D3E] focus:ring-[#1B4D3E]"
                      />
                    </div>

                    {paymentMethod === 'cbe' && (
                      <div className="mt-2 pt-2 border-t border-[#1B4D3E]/20 text-xs text-[#1A1C19] space-y-1.5 animate-fade-in">
                        <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-[#E8EFE9] font-mono font-bold">
                          <span>CBE Acc: {cbeAccount}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(cbeAccount, 'cbe');
                            }}
                            className="text-[11px] text-[#1B4D3E] hover:underline flex items-center gap-1 font-bold"
                          >
                            {copiedCbe ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedCbe ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-stone-600">
                          Account Name: <strong>{cbeName}</strong>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Telebirr Option */}
                {enabledMethods.telebirr && (
                  <div
                    onClick={() => setPaymentMethod('telebirr')}
                    className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === 'telebirr' 
                        ? 'bg-[#1B4D3E]/10 border-[#1B4D3E] shadow-xs' 
                        : 'bg-[#FDFCF7] border-[#E8EFE9] hover:border-[#1B4D3E]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-[#1B4D3E]" />
                        <span className="font-bold text-xs text-[#1B4D3E]">
                          Telebirr Mobile Payment
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'telebirr'}
                        onChange={() => setPaymentMethod('telebirr')}
                        className="text-[#1B4D3E] focus:ring-[#1B4D3E]"
                      />
                    </div>

                    {paymentMethod === 'telebirr' && (
                      <div className="mt-2 pt-2 border-t border-[#1B4D3E]/20 text-xs text-[#1A1C19] space-y-1.5 animate-fade-in">
                        <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-[#1B4D3E]/30 font-mono font-bold">
                          <span>Shortcode / Merchant ID: {telebirrCode}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(telebirrCode, 'tele');
                            }}
                            className="text-[11px] text-[#1B4D3E] hover:underline flex items-center gap-1"
                          >
                            {copiedTele ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedTele ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-stone-600">
                          Transfer to merchant shortcode & show receipt to your server.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Cash at Counter Option */}
                {(enabledMethods.arrival || enabledMethods.cash) && (
                  <div
                    onClick={() => setPaymentMethod('cash')}
                    className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === 'cash' 
                        ? 'bg-[#1B4D3E]/10 border-[#1B4D3E] shadow-xs' 
                        : 'bg-[#FDFCF7] border-[#E8EFE9] hover:border-[#1B4D3E]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#1B4D3E]" />
                        <span className="font-bold text-xs text-[#1A1C19]">
                          Cash at Counter / Pay on Table
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                        className="text-[#1B4D3E] focus:ring-[#1B4D3E]"
                      />
                    </div>
                    {paymentMethod === 'cash' && (
                      <p className="text-[11px] text-[#1B4D3E] mt-1.5 pt-1.5 border-t border-[#1B4D3E]/20">
                        Pay cash directly to your server or at the main reception counter upon service.
                      </p>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* Guest Details (Optional) */}
            <div className="bg-white p-4 rounded-2xl border border-[#E8EFE9] shadow-xs space-y-3">
              <label className="block text-xs font-bold text-[#1A1C19]">
                Guest Contact (Optional for billing receipt):
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-[#FDFCF7] border border-[#E8EFE9] rounded-xl px-3 py-2 text-xs text-[#1A1C19] focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full bg-[#FDFCF7] border border-[#E8EFE9] rounded-xl px-3 py-2 text-xs text-[#1A1C19] focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none"
                />
              </div>
            </div>

            {/* Confirm Button: Key CTA in Warm Champagne Gold with Charcoal text */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={orderItems.length === 0}
                className="w-full bg-[#C5A059] hover:bg-[#B08B42] disabled:opacity-50 text-[#1A1C19] font-black py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform active:scale-98 text-base flex items-center justify-center gap-2 border border-[#C5A059] cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5 text-[#1A1C19]" />
                <span>Confirm Order for Table {selectedTable} • {totalAmount.toLocaleString()} ETB</span>
              </button>
            </div>

          </form>
        ) : (
          /* Confirmation Receipt Screen */
          <div className="p-6 sm:p-8 text-center space-y-6 flex-1 flex flex-col justify-center animate-fade-in">
            <div className="w-16 h-16 bg-[#1B4D3E]/10 text-[#1B4D3E] border-2 border-[#1B4D3E]/30 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-[#1B4D3E]" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1B4D3E] bg-[#1B4D3E]/10 px-3 py-1 rounded-full">
                Order Sent to Kitchen & Bar
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1C19] mt-2">
                Table {orderConfirmed.table} Order Confirmed!
              </h3>
              <p className="text-xs text-stone-500 mt-1 font-mono">
                Reference: {orderConfirmed.orderId} • {orderConfirmed.timestamp}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8EFE9] text-left text-xs space-y-2.5 shadow-sm max-w-sm mx-auto w-full">
              <div className="flex justify-between pb-2 border-b border-[#E8EFE9] font-semibold">
                <span className="text-stone-500">Dining Table:</span>
                <span className="font-bold text-[#1B4D3E]">Table {orderConfirmed.table}</span>
              </div>

              <div className="space-y-1 py-1">
                {orderConfirmed.items.map((entry) => (
                  <div key={entry.item.id} className="flex justify-between text-stone-700">
                    <span>{entry.quantity}x {entry.item.nameEn}</span>
                    <span className="font-mono">{((Number(entry.item.price) || 0) * entry.quantity).toLocaleString()} ETB</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-2 border-t border-[#E8EFE9] font-bold text-sm text-[#1A1C19]">
                <span>Total Due:</span>
                <span className="font-serif text-base text-[#1B4D3E]">
                  {orderConfirmed.totalAmount.toLocaleString()} ETB
                </span>
              </div>

              <div className="flex justify-between pt-1 text-[11px] text-stone-500">
                <span>Payment Mode:</span>
                <span className="capitalize font-bold text-[#1A1C19]">
                  {orderConfirmed.paymentMethod === 'cbe' ? 'CBE Bank Transfer' : orderConfirmed.paymentMethod === 'telebirr' ? 'Telebirr Shortcode' : 'Cash on Table'}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
              Your meal will be served promptly to <strong>Table {orderConfirmed.table}</strong>. For inquiries, reach reception at <strong>{frontDeskPhone}</strong>.
            </p>

            <button
              type="button"
              onClick={() => {
                setOrderConfirmed(null);
                onClose();
              }}
              className="bg-[#1B4D3E] hover:bg-[#163E32] text-white font-bold py-3 px-8 rounded-xl text-sm transition-all shadow-md mx-auto cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
}