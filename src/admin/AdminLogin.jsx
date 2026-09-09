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
    <div className="py-16 px-4 flex items-center justify-center min-h-[60vh] bg-[#FAF7F0]">
      <div className="bg-[#F4EFE6] rounded-3xl shadow-2xl border border-[#E8E0D2] max-w-md w-full p-8 text-center animate-fade-in">
        
        <div className="w-14 h-14 rounded-2xl bg-[#FAF2E1] text-[#C8A24A] flex items-center justify-center mx-auto mb-4 border border-[#C8A24A]/40">
          <ShieldCheck className="w-8 h-8 text-[#C8A24A]" />
        </div>

        <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] mb-1">
          {t.admin.title}
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          {t.admin.subtitle}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-[#C8A24A]" />
              {t.admin.passwordLabel}
            </label>
            <input
              type="password"
              required
              placeholder="Enter password..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className="w-full bg-white border border-[#E8E0D2] rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-[#C8A24A] focus:outline-none"
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
            className="w-full bg-[#C8A24A] hover:bg-[#B58E38] text-[#1A1A1A] font-bold py-3 rounded-xl text-sm shadow-md transition-colors flex items-center justify-center gap-2 border border-[#D8B96D]"
          >
            <Lock className="w-4 h-4 text-[#1A1A1A]" />
            <span>{t.admin.loginBtn}</span>
          </button>

        </form>

      </div>
    </div>
  );
}
