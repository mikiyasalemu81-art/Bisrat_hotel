import React, { useState } from 'react';
import { CreditCard, Phone, Hash, Save, CheckCircle, Smartphone, Building2, Utensils, Lock, KeyRound } from 'lucide-react';

export default function PaymentSettingsManager({ 
  paymentSettings, 
  setPaymentSettings,
  adminPassword,
  setAdminPassword
}) {
  const [formData, setFormData] = useState({
    tableNumber: paymentSettings?.tableNumber || "12",
    phoneNumber: paymentSettings?.phoneNumber || "0906320251",
    landlinePhone: paymentSettings?.landlinePhone || "0222112555",
    cbeAccountNumber: paymentSettings?.cbeAccountNumber || "1000123456789",
    cbeAccountName: paymentSettings?.cbeAccountName || "Bisrat Hotel Adama",
    telebirrShortcode: paymentSettings?.telebirrShortcode || "654321",
    enableTelebirr: paymentSettings?.paymentMethods?.telebirr ?? true,
    enableCbe: paymentSettings?.paymentMethods?.cbe ?? true,
    enableArrival: paymentSettings?.paymentMethods?.arrival ?? true,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Change Password state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);

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
      },
    };
    setPaymentSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="border-b border-[#E8E0D2] pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#C8A24A]" />
            <span>Payment & Contact Settings</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Configure hotel payment accounts (CBE, Telebirr), contact phone numbers, dining table reference numbers, and active payment methods.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold animate-bounce">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Dining & Contact Config */}
        <div className="bg-[#F4EFE6] p-5 rounded-2xl border border-[#E8E0D2] space-y-4">
          <h4 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[#C8A24A]" />
            <span>Table Number & Reception Contact</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-[#C8A24A]" />
                Default Table Number
              </label>
              <input
                type="text"
                name="tableNumber"
                value={formData.tableNumber}
                onChange={handleChange}
                placeholder="e.g. Table 12"
                className="w-full bg-white border border-[#E8E0D2] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#C8A24A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#C8A24A]" />
                Mobile / Order Phone
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="e.g. 0906320251"
                className="w-full bg-white border border-[#E8E0D2] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#C8A24A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#C8A24A]" />
                Reception Landline
              </label>
              <input
                type="text"
                name="landlinePhone"
                value={formData.landlinePhone}
                onChange={handleChange}
                placeholder="e.g. 022 211 2555"
                className="w-full bg-white border border-[#E8E0D2] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#C8A24A] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: CBE Bank & Telebirr Account Details */}
        <div className="bg-[#F4EFE6] p-5 rounded-2xl border border-[#E8E0D2] space-y-4">
          <h4 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-600" />
            <span>Bank & Mobile Transfer Accounts</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                CBE Account Number
              </label>
              <input
                type="text"
                name="cbeAccountNumber"
                value={formData.cbeAccountNumber}
                onChange={handleChange}
                placeholder="e.g. 1000123456789"
                className="w-full bg-white border border-[#E8E0D2] rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-purple-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                CBE Account Holder Name
              </label>
              <input
                type="text"
                name="cbeAccountName"
                value={formData.cbeAccountName}
                onChange={handleChange}
                placeholder="e.g. Bisrat Hotel"
                className="w-full bg-white border border-[#E8E0D2] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-[#C8A24A]" />
                Telebirr Shortcode / Merchant ID
              </label>
              <input
                type="text"
                name="telebirrShortcode"
                value={formData.telebirrShortcode}
                onChange={handleChange}
                placeholder="e.g. 654321"
                className="w-full bg-white border border-[#E8E0D2] rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-[#977227] focus:ring-2 focus:ring-[#C8A24A] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Enabled Payment Method Options */}
        <div className="bg-[#F4EFE6] p-5 rounded-2xl border border-[#E8E0D2] space-y-4">
          <h4 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Active Payment Options for Guest Checkout</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Telebirr Toggle */}
            <label className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center justify-between transition-all ${
              formData.enableTelebirr ? 'bg-[#FAF2E1] border-[#C8A24A]' : 'bg-white border-[#E8E0D2]'
            }`}>
              <div>
                <span className="font-bold text-xs text-[#977227] bg-white px-2 py-0.5 rounded border border-[#C8A24A]/40">
                  Telebirr
                </span>
                <p className="text-xs font-semibold text-slate-800 mt-1">Enable Telebirr Payment</p>
              </div>
              <input
                type="checkbox"
                name="enableTelebirr"
                checked={formData.enableTelebirr}
                onChange={handleChange}
                className="w-5 h-5 rounded text-[#C8A24A] focus:ring-[#C8A24A]"
              />
            </label>

            {/* CBE Toggle */}
            <label className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center justify-between transition-all ${
              formData.enableCbe ? 'bg-purple-50 border-purple-500' : 'bg-white border-[#E8E0D2]'
            }`}>
              <div>
                <span className="font-bold text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  CBE Birr
                </span>
                <p className="text-xs font-semibold text-slate-800 mt-1">Enable Bank Transfer</p>
              </div>
              <input
                type="checkbox"
                name="enableCbe"
                checked={formData.enableCbe}
                onChange={handleChange}
                className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500"
              />
            </label>

            {/* Pay on Arrival Toggle */}
            <label className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center justify-between transition-all ${
              formData.enableArrival ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-[#E8E0D2]'
            }`}>
              <div>
                <span className="font-bold text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Pay on Arrival
                </span>
                <p className="text-xs font-semibold text-slate-800 mt-1">Enable Cash/Front Desk</p>
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

        {/* Section 4: Security & Admin Password Update */}
        <div className="bg-[#F4EFE6] p-5 rounded-2xl border border-[#E8E0D2] space-y-4">
          <h4 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#C8A24A]" />
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
                  className="w-full bg-white border border-[#E8E0D2] rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-[#C8A24A] focus:outline-none"
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
                  className="w-full bg-white border border-[#E8E0D2] rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-[#C8A24A] focus:outline-none"
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
                  className="w-full bg-white border border-[#E8E0D2] rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-[#C8A24A] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handlePasswordChange}
                className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#262626] text-white font-bold px-5 py-2.5 rounded-xl text-xs border border-[#C8A24A]/40 shadow-sm transition-all"
              >
                <KeyRound className="w-4 h-4 text-[#C8A24A]" />
                <span>Update Admin Password</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#C8A24A] hover:bg-[#B58E38] text-[#1A1A1A] font-bold px-8 py-3 rounded-xl shadow-md transition-all transform active:scale-95 text-sm border border-[#D8B96D]"
          >
            <Save className="w-4 h-4 text-[#1A1A1A]" />
            <span>Save Payment & Contact Settings</span>
          </button>
        </div>

      </form>
    </div>
  );
}
