import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';
import { translations } from '../translations';

export default function AdminLogin({ lang, onLoginSuccess, adminPassword }) {
  const t = translations[lang] || translations.en;

  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validPassword = adminPassword || localStorage.getItem('bisrat_admin_password') || 'bisrathotel123';
    if (password === validPassword) {
      setError(false);
      onLoginSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="py-16 px-4 flex flex-col items-center justify-center min-h-[65vh] bg-[#FDFCF7]">
      
      {/* Logo above login box */}
      <div className="mb-6 flex flex-col items-center text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg border-2 border-[#C5A059] bg-[#1B4D3E] p-1 mb-3">
          <img 
            src="/logo.png" 
            onError={(e) => { e.currentTarget.src = "/images/logo.jpg"; }}
            alt="Bisrat Hotel Logo" 
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <h1 className="font-serif text-xl font-bold text-[#1A1C19]">
          Bisrat Hotel • ብስራት ሆቴል
        </h1>
        <p className="text-xs text-slate-500 font-medium">Administration Portal</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-[#E8EFE9] max-w-md w-full p-8 text-center animate-fade-in">
        
        <div className="w-12 h-12 rounded-2xl bg-[#1B4D3E]/10 text-[#1B4D3E] flex items-center justify-center mx-auto mb-4 border border-[#1B4D3E]/20">
          <ShieldCheck className="w-7 h-7 text-[#1B4D3E]" />
        </div>

        <h2 className="font-serif text-2xl font-bold text-[#1A1C19] mb-1">
          {t.admin.title}
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          {t.admin.subtitle}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-[#1B4D3E]" />
              {t.admin.passwordLabel}
            </label>
            <input
              type="password"
              required
              placeholder="Enter admin password..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className="w-full bg-[#FDFCF7] border border-stone-300 rounded-xl px-4 py-3 text-sm text-[#1A1C19] focus:ring-2 focus:ring-[#1B4D3E] focus:border-[#1B4D3E] focus:outline-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{t.admin.wrongPassword}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#1B4D3E] hover:bg-[#153D31] text-white font-bold py-3.5 rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 border border-[#13382D] active:scale-[0.99]"
          >
            <Lock className="w-4 h-4 text-[#C5A059]" />
            <span>{t.admin.loginBtn}</span>
          </button>

        </form>

      </div>
    </div>
  );
}
