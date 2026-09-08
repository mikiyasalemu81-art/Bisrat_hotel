import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';
import { translations } from '../translations';

export default function AdminLogin({ lang, onLoginSuccess }) {
  const t = translations[lang] || translations.en;

  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'bisrathotel123') {
      setError(false);
      onLoginSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="py-16 px-4 flex items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-8 text-center animate-fade-in">
        
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-skybrand-600 flex items-center justify-center mx-auto mb-4 border border-sky-200">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h2 className="font-serif text-2xl font-bold text-navybrand-900 mb-1">
          {t.admin.title}
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          {t.admin.subtitle}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-skybrand-500" />
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-skybrand-500 focus:outline-none"
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
            className="w-full bg-navybrand-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl text-sm shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-skybrand-400" />
            <span>{t.admin.loginBtn}</span>
          </button>

          <p className="text-[11px] text-slate-400 italic pt-2">
            Default Password: <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">bisrathotel123</code>
          </p>

        </form>

      </div>
    </div>
  );
}
