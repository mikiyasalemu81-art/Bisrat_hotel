import React from 'react';
import { Star, CheckCircle, EyeOff, Trash2 } from 'lucide-react';

export default function ReviewManager({ reviews, setReviews }) {
  const toggleReviewStatus = (id) => {
    setReviews(reviews.map(r => {
      if (r.id === id) {
        return { ...r, status: r.status === 'approved' ? 'hidden' : 'approved' };
      }
      return r;
    }));
  };

  const deleteReview = (id) => {
    setReviews(reviews.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-xl font-bold text-navybrand-900">
          Reviews & Testimonials Moderation
        </h3>
        <p className="text-xs text-slate-500">
          Approve or hide guest reviews submitted through the website
        </p>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div 
            key={r.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              r.status === 'approved' ? 'bg-white border-slate-200 shadow-soft' : 'bg-slate-50 border-slate-300 opacity-70'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-navybrand-900 text-sm">{r.author}</span>
                <span className="text-amber-400 text-xs">{'★'.repeat(r.rating)}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  r.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {r.status.toUpperCase()}
                </span>
              </div>

              <p className="text-xs text-slate-700 italic">"{r.comment}"</p>
              <p className="text-[10px] text-slate-400">{r.location} • {r.date}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleReviewStatus(r.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  r.status === 'approved' 
                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {r.status === 'approved' ? 'Hide Review' : 'Approve'}
              </button>

              <button
                onClick={() => deleteReview(r.id)}
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
