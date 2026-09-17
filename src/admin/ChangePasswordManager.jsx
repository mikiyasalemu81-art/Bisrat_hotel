import React, { useState } from 'react';
import { 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Save, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { updateAdminPassword, getAdminPassword } from '../utils/database';

export default function ChangePasswordManager({
  adminPassword,
  setAdminPassword,
  lang = 'en'
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword) {
      setErrorMsg('Please enter your current password (Step 1).');
      return;
    }

    if (!newPassword || newPassword.trim().length < 4) {
      setErrorMsg('New password must be at least 4 characters long (Step 2).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation password do not match (Step 3).');
      return;
    }

    setIsLoading(true);

    try {
      // 3-step validation & persistent write to backend server
      const result = await updateAdminPassword(currentPassword, newPassword);

      if (setAdminPassword) {
        setAdminPassword(newPassword.trim());
      }

      setSuccessMsg('✓ Password updated successfully on the server! Your new password takes effect immediately for login from any device.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password on server. Please verify current password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      
      {/* Section Header */}
      <div className="text-center space-y-2 pb-2">
        <div className="w-14 h-14 rounded-2xl bg-[#1B4D3E]/10 text-[#1B4D3E] flex items-center justify-center mx-auto border border-[#1B4D3E]/20 shadow-xs">
          <ShieldCheck className="w-8 h-8 text-[#1B4D3E]" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-[#1A1C19]">
          Change Admin Portal Password
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Update your administrative master password. All changes are saved directly to the database server and apply immediately on all computers and phones.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-[#E8EFE9] shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Step Indicator Header */}
        <div className="grid grid-cols-3 gap-2 border-b border-stone-100 pb-5 text-center">
          <div className="space-y-1">
            <span className="w-6 h-6 rounded-full bg-[#1B4D3E] text-white text-xs font-bold inline-flex items-center justify-center">1</span>
            <p className="text-[11px] font-bold text-stone-700">Current Password</p>
          </div>
          <div className="space-y-1">
            <span className="w-6 h-6 rounded-full bg-[#1B4D3E] text-white text-xs font-bold inline-flex items-center justify-center">2</span>
            <p className="text-[11px] font-bold text-stone-700">New Password</p>
          </div>
          <div className="space-y-1">
            <span className="w-6 h-6 rounded-full bg-[#1B4D3E] text-white text-xs font-bold inline-flex items-center justify-center">3</span>
            <p className="text-[11px] font-bold text-stone-700">Confirm Password</p>
          </div>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-start gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* STEP 1: Current Password */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#1B4D3E]" />
                <span>Step 1: Enter Current Password *</span>
              </span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                required
                placeholder="Enter current admin password..."
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setErrorMsg(''); }}
                className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-800 focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none pr-11"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                title={showCurrent ? "Hide password" : "Show password"}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* STEP 2: New Password */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#1B4D3E]" />
                <span>Step 2: Enter New Password *</span>
              </span>
              <span className="text-[10px] text-stone-400">Min. 4 characters</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                required
                placeholder="Enter strong new password..."
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setErrorMsg(''); }}
                className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-800 focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none pr-11"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                title={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* STEP 3: Confirm New Password */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#1B4D3E]" />
                <span>Step 3: Confirm New Password *</span>
              </span>
              {newPassword && confirmPassword && (
                <span className={`text-[10px] font-bold ${
                  newPassword === confirmPassword ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {newPassword === confirmPassword ? '✓ Passwords match' : 'Passwords do not match'}
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                placeholder="Re-type new password to confirm..."
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrorMsg(''); }}
                className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-800 focus:ring-2 focus:ring-[#1B4D3E] focus:outline-none pr-11"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                title={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1B4D3E] hover:bg-[#153D31] text-white font-bold py-3.5 rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 border border-[#13382D] active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
                  <span>Updating Password on Server...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#C5A059]" />
                  <span>Save New Password to Server</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
