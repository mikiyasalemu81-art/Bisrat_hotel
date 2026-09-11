import React, { useState } from 'react';
import { CreditCard, Phone, Hash, Save, CheckCircle, Smartphone, Building2, Utensils, Lock, KeyRound, Plus, X, Cloud, RefreshCw, Layers } from 'lucide-react';
import { uploadToCloudStorage } from '../utils/imageStorage';

export default function PaymentSettingsManager({ 
  paymentSettings, 
  setPaymentSettings,
  adminPassword,
  setAdminPassword
}) {
  const initialActiveTables = Array.isArray(paymentSettings?.activeTables) && paymentSettings.activeTables.length > 0
    ? paymentSettings.activeTables
    : ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "VIP 1", "VIP 2", "Terrace 1"];

  const [formData, setFormData] = useState({
    activeTables: initialActiveTables,
    tableNumber: paymentSettings?.tableNumber || "1",
    phoneNumber: paymentSettings?.phoneNumber || "0906320251",
    landlinePhone: paymentSettings?.landlinePhone || "022 211 2555",
    cbeAccountNumber: paymentSettings?.cbeAccountNumber || "1000123456789",
    cbeAccountName: paymentSettings?.cbeAccountName || "Bisrat Hotel Adama",
    telebirrShortcode: paymentSettings?.telebirrShortcode || "654321",
    enableTelebirr: paymentSettings?.paymentMethods?.telebirr ?? true,
    enableCbe: paymentSettings?.paymentMethods?.cbe ?? true,
    enableArrival: paymentSettings?.paymentMethods?.arrival ?? (paymentSettings?.paymentMethods?.cash ?? true),
    // Cloud storage bucket settings
    cloudProvider: paymentSettings?.cloudStorage?.provider || 'cloudinary',
    cloudName: paymentSettings?.cloudStorage?.cloudName || 'dhd620bca',
    uploadPreset: paymentSettings?.cloudStorage?.uploadPreset || 'bisrat_unsigned',
    supabaseUrl: paymentSettings?.cloudStorage?.supabaseUrl || '',
    supabaseKey: paymentSettings?.cloudStorage?.supabaseKey || '',
    supabaseBucket: paymentSettings?.cloudStorage?.supabaseBucket || 'bisrat-hotel',
  });

  const [newTableInput, setNewTableInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testingCloud, setTestingCloud] = useState(false);
  const [cloudTestMsg, setCloudTestMsg] = useState('');

  // Change Password state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);

  const handleAddTable = (e) => {
    if (e) e.preventDefault();
    const clean = newTableInput.trim();
    if (!clean) return;
    if (formData.activeTables.includes(clean)) {
      alert(`Table "${clean}" is already in the list.`);
      return;
    }
    setFormData(prev => ({
      ...prev,
      activeTables: [...prev.activeTables, clean]
    }));
    setNewTableInput('');
  };

  const handleRemoveTable = (tableToRemove) => {
    if (formData.activeTables.length <= 1) {
      alert('You must have at least one active table configured.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      activeTables: prev.activeTables.filter(t => t !== tableToRemove),
      tableNumber: prev.tableNumber === tableToRemove ? prev.activeTables.find(t => t !== tableToRemove) : prev.tableNumber
    }));
  };

  const handleResetTables = () => {
    const standard = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "VIP 1", "VIP 2", "Terrace 1"];
    setFormData(prev => ({
      ...prev,
      activeTables: standard,
      tableNumber: "1"
    }));
  };

  const handleTestCloud = async () => {
    setTestingCloud(true);
    setCloudTestMsg('');
    try {
      // Test dummy tiny 1x1 transparent PNG binary
      const testBlob = new Blob(
        [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 11, 73, 68, 65, 84, 120, 156, 99, 96, 0, 0, 0, 2, 0, 1, 229, 39, 222, 252, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130])],
        { type: 'image/png' }
      );
      const res = await uploadToCloudStorage(testBlob, {
        provider: formData.cloudProvider,
        cloudName: formData.cloudName,
        uploadPreset: formData.uploadPreset,
        supabaseUrl: formData.supabaseUrl,
        supabaseKey: formData.supabaseKey,
        supabaseBucket: formData.supabaseBucket,
      });

      setCloudTestMsg(`✓ Cloud Storage Connected! Verified public HTTPS URL: ${res.url}`);
    } catch (err) {
      setCloudTestMsg(`Cloud connection notice: ${err.message}. (Public CDN fallback remains active)`);
    } finally {
      setTestingCloud(false);
    }
  };

  const handlePasswordChange = () => {
    const activePassword = adminPassword || localStorage.getItem('bisrat_admin_password') || 'bisrathotel123';
    if (!currentPwd) {
      setPwdError('Please enter your current password.');
      return;
    }
    if (currentPwd !== activePassword) {
      setPwdError('Current password is incorrect.');
      return;
    }
    if (!newPwd || newPwd.length < 4) {
      setPwdError('New password must be at least 4 characters long.');
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError('New password and confirmation do not match.');
      return;
    }

    if (setAdminPassword) {
      setAdminPassword(newPwd);
    }
    localStorage.setItem('bisrat_admin_password', newPwd);
    setPwdError('');
    setPwdSuccess(true);
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
    setTimeout(() => setPwdSuccess(false), 4000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setSavedSuccess(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = {
      ...paymentSettings,
      activeTables: formData.activeTables,
      tableNumber: formData.tableNumber,
      phoneNumber: formData.phoneNumber,
      landlinePhone: formData.landlinePhone,
      cbeAccountNumber: formData.cbeAccountNumber,
      cbeAccountName: formData.cbeAccountName,
      telebirrShortcode: formData.telebirrShortcode,
      paymentMethods: {
        telebirr: formData.enableTelebirr,
        cbe: formData.enableCbe,
        arrival: formData.enableArrival,
        cash: formData.enableArrival,
      },
      cloudStorage: {
        provider: formData.cloudProvider,
        cloudName: formData.cloudName,
        uploadPreset: formData.uploadPreset,
        supabaseUrl: formData.supabaseUrl,
        supabaseKey: formData.supabaseKey,
        supabaseBucket: formData.supabaseBucket,
      }
    };
    setPaymentSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1C19] flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#1B4D3E]" />
            <span>Operational & Payment Controls</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Configure active table numbers, hotel front-desk direct contact, CBE & Telebirr accounts, active checkout payment methods, and cloud storage bucket sync.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-300 px-4 py-2 rounded-xl text-xs font-bold animate-bounce shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved & Synced Live!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Table Management (Active Dining Table Numbers) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8EFE9] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <h4 className="font-bold text-sm text-[#1A1C19] flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#1B4D3E]" />
                <span>Table Management</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure active tables available for dining orders in the customer checkout drawer.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetTables}
              className="text-[11px] text-[#1B4D3E] font-bold hover:underline self-start sm:self-auto"
            >
              Reset to Defaults (1-12, VIP, Terrace)
            </button>
          </div>

          {/* Table Tags / Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Active Dining Tables ({formData.activeTables.length}):
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.activeTables.map((tbl) => (
                <span
                  key={tbl}
                  className="inline-flex items-center gap-1.5 bg-[#1B4D3E]/10 border border-[#1B4D3E]/30 text-[#1B4D3E] text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs"
                >
                  <Hash className="w-3 h-3 text-[#1B4D3E]" />
                  <span>Table {tbl}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTable(tbl)}
                    className="w-4 h-4 rounded-full hover:bg-[#1B4D3E] hover:text-white flex items-center justify-center transition-colors text-stone-500"
                    title={`Remove Table ${tbl}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add New Table Input */}
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                placeholder="Enter table number/name (e.g. 15, VIP 3)..."
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
                className="bg-[#1B4D3E] hover:bg-[#153D31] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Add Table</span>
              </button>
            </div>
          </div>

          {/* Default Table Selection */}
          <div className="pt-2 border-t border-stone-100 max-w-xs">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Default Table Selection
            </label>
            <select
              name="tableNumber"
              value={formData.tableNumber}
              onChange={handleChange}
              className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-[#1B4D3E]"
            >
              {formData.activeTables.map((tbl) => (
                <option key={tbl} value={tbl}>
                  Table {tbl}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 2: Direct Contact (Reception & Front-Desk) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8EFE9] shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-[#1A1C19] flex items-center gap-2 border-b border-stone-100 pb-3">
            <Phone className="w-4 h-4 text-[#1B4D3E]" />
            <span>Direct Contact & Front-Desk Phone Numbers</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#1B4D3E]" />
                Mobile / Front-Desk Direct Contact *
              </label>
              <input
                type="text"
                required
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="e.g. 0906320251"
                className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-stone-800 focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Displayed in header, checkout drawer one-tap dial, and reservation receipts.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#1B4D3E]" />
                Reception Landline
              </label>
              <input
                type="text"
                name="landlinePhone"
                value={formData.landlinePhone}
                onChange={handleChange}
                placeholder="e.g. 022 211 2555"
                className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-stone-800 focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Hotel main line for room service and customer inquiries.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Payment Methods & Accounts */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8EFE9] shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-[#1A1C19] flex items-center gap-2 border-b border-stone-100 pb-3">
            <Building2 className="w-4 h-4 text-[#1B4D3E]" />
            <span>Bank Accounts & Mobile Transfer Details</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Commercial Bank of Ethiopia (CBE) Account Number *
              </label>
              <input
                type="text"
                required
                name="cbeAccountNumber"
                value={formData.cbeAccountNumber}
                onChange={handleChange}
                placeholder="e.g. 1000123456789"
                className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-[#1A1C19] focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                CBE Account Holder Name *
              </label>
              <input
                type="text"
                required
                name="cbeAccountName"
                value={formData.cbeAccountName}
                onChange={handleChange}
                placeholder="e.g. Bisrat Hotel Adama"
                className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-stone-800 focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-[#1B4D3E]" />
                Telebirr Shortcode / Merchant ID
              </label>
              <input
                type="text"
                name="telebirrShortcode"
                value={formData.telebirrShortcode}
                onChange={handleChange}
                placeholder="e.g. 654321"
                className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-stone-900 focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Method Toggles */}
          <div className="pt-3 border-t border-stone-100">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Active Payment Methods for Customer Checkout Drawer:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* CBE Mobile Banking Toggle */}
              <label className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center justify-between transition-all ${
                formData.enableCbe ? 'bg-[#1B4D3E]/10 border-[#1B4D3E] shadow-xs' : 'bg-white border-stone-200 opacity-60'
              }`}>
                <div>
                  <span className="font-bold text-xs text-[#1B4D3E] bg-[#1B4D3E]/15 px-2 py-0.5 rounded">
                    CBE Mobile Banking
                  </span>
                  <p className="text-xs font-semibold text-stone-800 mt-1">Bank Direct Transfer</p>
                </div>
                <input
                  type="checkbox"
                  name="enableCbe"
                  checked={formData.enableCbe}
                  onChange={handleChange}
                  className="w-5 h-5 rounded text-[#1B4D3E] focus:ring-[#1B4D3E]"
                />
              </label>

              {/* Telebirr Toggle */}
              <label className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center justify-between transition-all ${
                formData.enableTelebirr ? 'bg-[#1B4D3E]/10 border-[#1B4D3E] shadow-xs' : 'bg-white border-stone-200 opacity-60'
              }`}>
                <div>
                  <span className="font-bold text-xs text-[#1B4D3E] bg-[#1B4D3E]/15 px-2 py-0.5 rounded">
                    Telebirr
                  </span>
                  <p className="text-xs font-semibold text-stone-800 mt-1">Merchant Shortcode</p>
                </div>
                <input
                  type="checkbox"
                  name="enableTelebirr"
                  checked={formData.enableTelebirr}
                  onChange={handleChange}
                  className="w-5 h-5 rounded text-[#1B4D3E] focus:ring-[#1B4D3E]"
                />
              </label>

              {/* Cash at Counter Toggle */}
              <label className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center justify-between transition-all ${
                formData.enableArrival ? 'bg-[#C5A059]/15 border-[#C5A059] shadow-xs' : 'bg-white border-stone-200 opacity-60'
              }`}>
                <div>
                  <span className="font-bold text-xs text-[#1A1C19] bg-[#C5A059]/30 px-2 py-0.5 rounded font-bold">
                    Cash at Counter
                  </span>
                  <p className="text-xs font-semibold text-stone-800 mt-1">Pay on Table / Counter</p>
                </div>
                <input
                  type="checkbox"
                  name="enableArrival"
                  checked={formData.enableArrival}
                  onChange={handleChange}
                  className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Section 4: Cloud Storage Bucket & Image Sync */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8EFE9] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <h4 className="font-bold text-sm text-[#1A1C19] flex items-center gap-2">
                <Cloud className="w-4 h-4 text-[#1B4D3E]" />
                <span>Cloud Storage Bucket & Sync Configuration</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Photos uploaded by admins are transmitted directly to a cloud bucket, returning permanent public HTTPS URLs accessible by all users on any device.
              </p>
            </div>
            <button
              type="button"
              onClick={handleTestCloud}
              disabled={testingCloud}
              className="bg-[#1B4D3E]/10 hover:bg-[#1B4D3E]/20 text-[#1B4D3E] text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingCloud ? 'animate-spin' : ''}`} />
              <span>{testingCloud ? 'Testing...' : 'Test Cloud Connection'}</span>
            </button>
          </div>

          {cloudTestMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-medium break-all">
              {cloudTestMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cloud Provider
              </label>
              <select
                name="cloudProvider"
                value={formData.cloudProvider}
                onChange={handleChange}
                className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-[#1B4D3E]"
              >
                <option value="cloudinary">Cloudinary (Unsigned Upload)</option>
                <option value="supabase">Supabase Storage</option>
              </select>
            </div>

            {formData.cloudProvider === 'cloudinary' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cloudinary Cloud Name
                  </label>
                  <input
                    type="text"
                    name="cloudName"
                    value={formData.cloudName}
                    onChange={handleChange}
                    placeholder="e.g. bisrat-hotel"
                    className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono text-stone-800 focus:ring-2 focus:ring-[#1B4D3E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Upload Preset (Unsigned)
                  </label>
                  <input
                    type="text"
                    name="uploadPreset"
                    value={formData.uploadPreset}
                    onChange={handleChange}
                    placeholder="e.g. bisrat_unsigned"
                    className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono text-stone-800 focus:ring-2 focus:ring-[#1B4D3E]"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Supabase URL
                  </label>
                  <input
                    type="text"
                    name="supabaseUrl"
                    value={formData.supabaseUrl}
                    onChange={handleChange}
                    placeholder="https://xyz.supabase.co"
                    className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono text-stone-800 focus:ring-2 focus:ring-[#1B4D3E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Supabase Bucket Name
                  </label>
                  <input
                    type="text"
                    name="supabaseBucket"
                    value={formData.supabaseBucket}
                    onChange={handleChange}
                    placeholder="bisrat-hotel"
                    className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono text-stone-800 focus:ring-2 focus:ring-[#1B4D3E]"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 5: Security & Admin Password Update */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8EFE9] shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-[#1A1C19] flex items-center gap-2 border-b border-stone-100 pb-3">
            <Lock className="w-4 h-4 text-[#1B4D3E]" />
            <span>Admin Portal Password Security</span>
          </h4>

          <div className="space-y-4">
            {pwdError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                {pwdError}
              </div>
            )}
            {pwdSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Admin Password updated successfully!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="Enter current password..."
                  value={currentPwd}
                  onChange={(e) => { setCurrentPwd(e.target.value); setPwdError(''); setPwdSuccess(false); }}
                  className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password..."
                  value={newPwd}
                  onChange={(e) => { setNewPwd(e.target.value); setPwdError(''); setPwdSuccess(false); }}
                  className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password..."
                  value={confirmPwd}
                  onChange={(e) => { setConfirmPwd(e.target.value); setPwdError(''); setPwdSuccess(false); }}
                  className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handlePasswordChange}
                className="flex items-center gap-2 bg-[#1B4D3E] hover:bg-[#153D31] text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition-all"
              >
                <KeyRound className="w-4 h-4 text-[#C5A059]" />
                <span>Update Admin Password</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#C5A059] hover:bg-[#b59049] text-[#1A1C19] font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-95 text-sm border border-[#C5A059]"
          >
            <Save className="w-4 h-4 text-[#1A1C19]" />
            <span>Save Operational & Payment Settings</span>
          </button>
        </div>

      </form>
    </div>
  );
}
