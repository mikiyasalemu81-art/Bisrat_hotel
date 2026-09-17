import React, { useState } from 'react';
import { 
  CreditCard, 
  Building2, 
  Smartphone, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  Hash, 
  Utensils, 
  Info,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { DEFAULT_PAYMENT_METHODS, savePaymentSettings } from '../utils/database';
import { saveCloudAppState } from '../utils/cloudSync';

export default function PaymentMethodsManager({
  paymentSettings = {},
  setPaymentSettings,
  onUpdatePaymentSettings,
  lang = 'en'
}) {
  // Extract payment methods list or fallback
  const initialMethods = Array.isArray(paymentSettings?.paymentMethodsList) && paymentSettings.paymentMethodsList.length > 0
    ? paymentSettings.paymentMethodsList
    : DEFAULT_PAYMENT_METHODS;

  const [methods, setMethods] = useState(initialMethods);

  // Operational settings
  const [activeTables, setActiveTables] = useState(() => {
    return Array.isArray(paymentSettings?.activeTables) && paymentSettings.activeTables.length > 0
      ? paymentSettings.activeTables
      : ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "VIP 1", "VIP 2", "Terrace 1"];
  });

  const [phoneNumber, setPhoneNumber] = useState(paymentSettings?.phoneNumber || "0906320251");
  const [landlinePhone, setLandlinePhone] = useState(paymentSettings?.landlinePhone || "022 211 2555");
  const [newTableInput, setNewTableInput] = useState('');

  // Modal State for Add / Edit Method
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethodId, setEditingMethodId] = useState(null);
  const [methodName, setMethodName] = useState('');
  const [methodType, setMethodType] = useState('cbe');
  const [methodEnabled, setMethodEnabled] = useState(true);

  // Dynamic Type-Specific Fields
  const [merchantId, setMerchantId] = useState('');
  const [telebirrPhone, setTelebirrPhone] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [instructions, setInstructions] = useState('');

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingMethodId(null);
    setMethodName('');
    setMethodType('cbe');
    setMethodEnabled(true);
    setMerchantId('');
    setTelebirrPhone(phoneNumber || '');
    setAccountNumber('');
    setAccountName('Bisrat Hotel Adama');
    setBankName('');
    setInstructions('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (m) => {
    setEditingMethodId(m.id);
    setMethodName(m.name || '');
    setMethodType(m.type || 'cbe');
    setMethodEnabled(m.enabled !== false);
    setMerchantId(m.merchantId || '');
    setTelebirrPhone(m.phoneNumber || '');
    setAccountNumber(m.accountNumber || '');
    setAccountName(m.accountName || '');
    setBankName(m.bankName || '');
    setInstructions(m.instructions || '');
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMethodId(null);
  };

  // Quick Toggle Enable/Disable
  const handleToggleEnable = async (id) => {
    const updated = methods.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m);
    setMethods(updated);
    await persistSettings(updated, activeTables, phoneNumber, landlinePhone);
  };

  // Delete Method
  const handleDeleteMethod = async (id) => {
    if (methods.length <= 1) {
      alert('You must retain at least one payment method.');
      return;
    }
    if (!window.confirm('Are you sure you want to remove this payment method?')) return;
    const updated = methods.filter(m => m.id !== id);
    setMethods(updated);
    await persistSettings(updated, activeTables, phoneNumber, landlinePhone);
  };

  // Save Modal Form (Add or Edit)
  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!methodName.trim()) {
      alert('Please enter a payment method name.');
      return;
    }

    const newMethodObj = {
      id: editingMethodId || `pm-${Date.now().toString(36)}`,
      name: methodName.trim(),
      type: methodType,
      enabled: methodEnabled,
      // Method-specific fields based on type
      ...(methodType === 'telebirr' && {
        merchantId: merchantId.trim(),
        phoneNumber: telebirrPhone.trim(),
        instructions: instructions.trim() || 'Pay via Telebirr merchant ID or phone.'
      }),
      ...(methodType === 'cbe' && {
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        instructions: instructions.trim() || 'Transfer to Commercial Bank of Ethiopia (CBE).'
      }),
      ...(methodType === 'bank' && {
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        instructions: instructions.trim()
      }),
      ...(methodType === 'arrival' && {
        instructions: instructions.trim() || 'Pay on arrival in cash or card directly to your server or reception.'
      }),
      ...(methodType === 'custom' && {
        instructions: instructions.trim()
      })
    };

    let updatedList;
    if (editingMethodId) {
      updatedList = methods.map(m => m.id === editingMethodId ? newMethodObj : m);
    } else {
      updatedList = [...methods, newMethodObj];
    }

    setMethods(updatedList);
    handleCloseModal();
    await persistSettings(updatedList, activeTables, phoneNumber, landlinePhone);
  };

  // Table Management
  const handleAddTable = (e) => {
    if (e) e.preventDefault();
    const clean = newTableInput.trim();
    if (!clean) return;
    if (activeTables.includes(clean)) {
      alert(`Table "${clean}" is already configured.`);
      return;
    }
    const updated = [...activeTables, clean];
    setActiveTables(updated);
    setNewTableInput('');
    persistSettings(methods, updated, phoneNumber, landlinePhone);
  };

  const handleRemoveTable = (tableToRemove) => {
    if (activeTables.length <= 1) {
      alert('At least one table must remain active.');
      return;
    }
    const updated = activeTables.filter(t => t !== tableToRemove);
    setActiveTables(updated);
    persistSettings(methods, updated, phoneNumber, landlinePhone);
  };

  // Persist all settings to server
  const persistSettings = async (methodsList, tbls, phone, landline) => {
    setIsSaving(true);
    try {
      const now = Date.now();
      const updatedSettings = {
        ...paymentSettings,
        paymentMethodsList: methodsList,
        activeTables: tbls,
        phoneNumber: phone,
        landlinePhone: landline,
        updatedAt: now,
        // Legacy compatibility keys so existing components don't break
        paymentMethods: {
          cbe: Boolean(methodsList.find(m => m.type === 'cbe' && m.enabled)),
          arrival: Boolean(methodsList.find(m => m.type === 'arrival' && m.enabled)),
          telebirr: Boolean(methodsList.find(m => m.type === 'telebirr' && m.enabled))
        }
      };

      if (onUpdatePaymentSettings) {
        await onUpdatePaymentSettings(updatedSettings);
      } else {
        if (setPaymentSettings) setPaymentSettings(updatedSettings);
        try {
          localStorage.setItem('bisrat_payment_settings', JSON.stringify(updatedSettings));
          localStorage.setItem('bisrat_payment_ts', String(now));
        } catch (e) {}
        await saveCloudAppState('paymentSettings', updatedSettings, paymentSettings?.cloudStorage);
      }

      await savePaymentSettings(updatedSettings).catch(() => {});

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Payment settings save error:', err);
      alert('Failed to save settings to server: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    await persistSettings(methods, activeTables, phoneNumber, landlinePhone);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8EFE9] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B4D3E] bg-[#1B4D3E]/10 border border-[#1B4D3E]/20 px-3 py-0.5 rounded-full mb-1">
            <CreditCard className="w-3.5 h-3.5 text-[#1B4D3E]" />
            <span>Dynamic Checkout Configuration</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#1A1C19]">
            Payment Settings & Methods
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Add, edit, or remove dynamic payment options. Controls what customers see during checkout and room reservations.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-300 px-4 py-2 rounded-xl text-xs font-bold animate-fade-in shadow-2xs">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>✓ Saved to Database & Synced Live!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleGeneralSubmit} className="space-y-8">

        {/* ================================================================= */}
        {/* SECTION 1: DYNAMIC PAYMENT METHODS (Add, Edit, Remove, Toggle)   */}
        {/* ================================================================= */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8EFE9] shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div>
              <h4 className="font-serif font-bold text-base text-[#1A1C19] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#1B4D3E]" />
                <span>Configured Payment Methods ({methods.length})</span>
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                Toggle the switch to show or hide each method on the live customer checkout drawer and booking modal.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="bg-[#1B4D3E] hover:bg-[#153D31] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer self-start sm:self-auto active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#C5A059]" />
              <span>Add Payment Method</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {methods.map((m) => {
              const isEnabled = m.enabled !== false;

              return (
                <div
                  key={m.id}
                  className={`rounded-2xl border-2 p-4 transition-all flex flex-col justify-between space-y-3 ${
                    isEnabled
                      ? 'bg-[#FDFCF7] border-[#1B4D3E]/30 shadow-2xs'
                      : 'bg-stone-50 border-stone-200 opacity-60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-[#1B4D3E] bg-[#1B4D3E]/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {m.type === 'cbe' ? 'Bank / CBE' : m.type === 'telebirr' ? 'Telebirr Mobile' : m.type === 'arrival' ? 'Pay on Arrival' : m.type}
                        </span>
                        <h5 className="font-serif font-bold text-base text-[#1A1C19] mt-1">
                          {m.name}
                        </h5>
                      </div>

                      {/* Visibility Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleEnable(m.id)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold ${
                          isEnabled
                            ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                            : 'text-stone-500 bg-stone-200 hover:bg-stone-300 border border-stone-300'
                        }`}
                        title={isEnabled ? 'Click to hide from customer site' : 'Click to show on customer site'}
                      >
                        {isEnabled ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Live</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Method Specific Field Values */}
                    <div className="text-xs text-stone-600 space-y-1 bg-white p-3 rounded-xl border border-stone-200/80">
                      {m.type === 'cbe' && (
                        <>
                          <p>Acc Number: <strong className="font-mono text-stone-900">{m.accountNumber || 'N/A'}</strong></p>
                          <p>Account Name: <strong className="text-stone-900">{m.accountName || 'N/A'}</strong></p>
                        </>
                      )}
                      {m.type === 'telebirr' && (
                        <>
                          {m.merchantId && <p>Merchant ID: <strong className="font-mono text-stone-900">{m.merchantId}</strong></p>}
                          {m.phoneNumber && <p>Phone / Acc: <strong className="font-mono text-stone-900">{m.phoneNumber}</strong></p>}
                        </>
                      )}
                      {m.type === 'bank' && (
                        <>
                          <p>Bank: <strong className="text-stone-900">{m.bankName || 'Bank'}</strong></p>
                          <p>Acc Number: <strong className="font-mono text-stone-900">{m.accountNumber}</strong></p>
                          <p>Acc Name: <strong className="text-stone-900">{m.accountName}</strong></p>
                        </>
                      )}
                      {m.type === 'arrival' && (
                        <p className="italic text-stone-500">{m.instructions || 'Pay directly upon dining or check-in.'}</p>
                      )}
                      {m.type === 'custom' && (
                        <p className="italic text-stone-500">{m.instructions || 'Custom payment flow.'}</p>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(m)}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteMethod(m.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================================================================= */}
        {/* SECTION 2: DINING TABLES MANAGEMENT                              */}
        {/* ================================================================= */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8EFE9] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <h4 className="font-serif font-bold text-base text-[#1A1C19] flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#1B4D3E]" />
                <span>Active Dining Tables ({activeTables.length})</span>
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                Table options available in customer checkout and food reservation forms.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            {activeTables.map((tbl) => (
              <span
                key={tbl}
                className="inline-flex items-center gap-1.5 bg-[#1B4D3E]/10 border border-[#1B4D3E]/30 text-[#1B4D3E] text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs"
              >
                <Hash className="w-3 h-3" />
                <span>Table {tbl}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTable(tbl)}
                  className="w-4 h-4 rounded-full hover:bg-[#1B4D3E] hover:text-white flex items-center justify-center transition-colors text-stone-500 cursor-pointer"
                  title={`Remove Table ${tbl}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-md pt-1">
            <input
              type="text"
              placeholder="e.g. 15, VIP 3, Terrace 2..."
              value={newTableInput}
              onChange={(e) => setNewTableInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTable();
                }
              }}
              className="flex-1 bg-[#FDFCF7] border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddTable}
              className="bg-[#1B4D3E] hover:bg-[#153D31] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Add Table</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* SECTION 3: FRONT-DESK RECEPTION CONTACT PHONE NUMBERS            */}
        {/* ================================================================= */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8EFE9] shadow-2xs space-y-4">
          <h4 className="font-serif font-bold text-base text-[#1A1C19] flex items-center gap-2 border-b border-stone-100 pb-3">
            <Phone className="w-4 h-4 text-[#1B4D3E]" />
            <span>Front-Desk Direct Reception Phone Numbers</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#1B4D3E]" />
                <span>Front-Desk Mobile / Direct Dial</span>
              </label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0906320251"
                className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-stone-800 focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#1B4D3E]" />
                <span>Hotel Reception Landline</span>
              </label>
              <input
                type="text"
                value={landlinePhone}
                onChange={(e) => setLandlinePhone(e.target.value)}
                placeholder="022 211 2555"
                className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-stone-800 focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Global Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-[#C5A059] hover:bg-[#b59049] text-[#1A1C19] font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-95 text-xs sm:text-sm border border-[#C5A059] flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#1A1C19]" />
            <span>{isSaving ? 'Saving to Database...' : 'Save Payment & Operational Settings'}</span>
          </button>
        </div>

      </form>

      {/* =================================================================== */}
      {/* MODAL: ADD / EDIT PAYMENT METHOD (With Method-Specific Fields)       */}
      {/* =================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-lg w-full p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="font-serif font-bold text-lg text-[#1A1C19] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#1B4D3E]" />
                <span>{editingMethodId ? 'Edit Payment Method' : 'Add New Payment Method'}</span>
              </h4>
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              
              {/* Method Label / Name */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Payment Method Name / Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CBE Birr, Telebirr, Awash Bank, Pay on Arrival"
                  value={methodName}
                  onChange={(e) => setMethodName(e.target.value)}
                  className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-stone-900 focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none"
                />
              </div>

              {/* Method Type Selector */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Payment Method Type
                </label>
                <select
                  value={methodType}
                  onChange={(e) => setMethodType(e.target.value)}
                  className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#1B4D3E] focus:ring-2 focus:ring-[#1B4D3E]"
                >
                  <option value="cbe">Commercial Bank of Ethiopia (CBE)</option>
                  <option value="telebirr">Telebirr (Merchant ID / Phone)</option>
                  <option value="bank">Other Commercial Bank</option>
                  <option value="arrival">Pay on Arrival / Cash at Counter</option>
                  <option value="custom">Custom Payment Method</option>
                </select>
              </div>

              {/* =========================================================== */}
              {/* METHOD-SPECIFIC FIELDS ACCORDING TO USER PROMPT #3          */}
              {/* =========================================================== */}
              
              {/* 1. TELEBIRR FIELDS: Merchant ID and Phone Number */}
              {methodType === 'telebirr' && (
                <div className="bg-[#1B4D3E]/5 p-3.5 rounded-xl border border-[#1B4D3E]/20 space-y-3">
                  <span className="font-bold text-[#1B4D3E] block">Telebirr Configuration:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Merchant ID / Short Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 654321"
                        value={merchantId}
                        onChange={(e) => setMerchantId(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 font-mono font-bold text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Telebirr Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 0906320251"
                        value={telebirrPhone}
                        onChange={(e) => setTelebirrPhone(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 font-mono font-bold text-stone-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. CBE FIELDS: Account Number and Account Name */}
              {methodType === 'cbe' && (
                <div className="bg-[#1B4D3E]/5 p-3.5 rounded-xl border border-[#1B4D3E]/20 space-y-3">
                  <span className="font-bold text-[#1B4D3E] block">CBE Account Configuration:</span>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      CBE Account Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1000679192934"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 font-mono font-bold text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Account Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bisrat Hotel Adama"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 font-semibold text-stone-800"
                    />
                  </div>
                </div>
              )}

              {/* 3. OTHER BANK FIELDS: Bank Name, Account Number, Account Name */}
              {methodType === 'bank' && (
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-3">
                  <span className="font-bold text-stone-800 block">Bank Account Details:</span>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Bank Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Awash Bank, Dashen Bank, Bank of Oromia"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 font-semibold text-stone-800"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Account Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 01320492810"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 font-mono font-bold text-stone-800"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Account Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bisrat Hotel"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 font-semibold text-stone-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. INSTRUCTIONS / NOTES (for Arrival, Custom, or optional instructions) */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Customer Instructions / Notice
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please present transaction receipt or reference code upon arrival..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl p-3 text-xs text-stone-800 focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none"
                />
              </div>

              {/* 5. VISIBILITY TOGGLE (Show/Hide on Live Site) */}
              <div className="pt-2 border-t border-stone-100">
                <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                  <div>
                    <span className="font-bold text-stone-800 block">Show on Live Site</span>
                    <span className="text-[11px] text-stone-500">
                      When enabled, customers can choose this method at checkout and booking.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={methodEnabled}
                    onChange={(e) => setMethodEnabled(e.target.checked)}
                    className="w-5 h-5 rounded text-[#1B4D3E] focus:ring-[#1B4D3E]"
                  />
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#1B4D3E] hover:bg-[#153D31] text-white font-bold px-6 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Save className="w-4 h-4 text-[#C5A059]" />
                  <span>Save Method</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
