import React, { useState } from 'react';
import { Star, ShieldCheck, MessageSquarePlus, UserCheck, CheckCircle2 } from 'lucide-react';
import { translations } from '../translations';

export default function ReviewsSection({ 
  reviews = [], 
  lang,
  onAddReview 
}) {
  const t = translations[lang] || translations.en;

  const [showForm, setShowForm] = useState(false);
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const approvedReviews = reviews.filter(r => r.status === 'approved');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!author || !comment) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      author,
      location: "Adama Guest",
      rating,
      date: "Just now",
      isVerified: true,
      status: "approved", // Automatically approve for seamless demo
      comment
    };

    onAddReview(newRev);
    setSubmittedSuccess(true);
    setAuthor('');
    setComment('');
    setTimeout(() => {
      setSubmittedSuccess(false);
      setShowForm(false);
    }, 2500);
  };

  return (
    <section id="reviews" className="py-16 bg-[#1A1A1A] text-white border-y border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#C8A24A] bg-[#C8A24A]/20 border border-[#C8A24A]/40 px-3 py-1 rounded-full mb-3">
              Bisrat Hotel Guest Experience
            </span>
            <h2 className="fluid-section-title font-serif font-bold text-white mb-2">
              {t.reviews.title}
            </h2>
            <p className="text-slate-300 text-sm">
              {t.reviews.subtitle}
            </p>
          </div>

          {/* Rating Badge & Leave Review Trigger */}
          <div className="flex items-center gap-4 bg-[#242424] p-4 rounded-2xl border border-[#C8A24A]/30 shadow-lg">
            <div className="text-center pr-4 border-r border-[#333333]">
              <span className="font-serif text-3xl font-bold text-[#C8A24A]">4.9</span>
              <div className="flex text-[#C8A24A] text-xs mt-0.5">
                {'★'.repeat(5)}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Overall Rating</p>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-[#C8A24A] hover:bg-[#B58E38] text-[#1A1A1A] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-colors border border-[#D8B96D]"
            >
              <MessageSquarePlus className="w-4 h-4 text-[#1A1A1A]" />
              <span>{t.reviews.leaveReview}</span>
            </button>
          </div>
        </div>

        {/* Leave Review Form Modal / Drawer */}
        {showForm && (
          <div className="mb-10 bg-[#242424] border border-[#C8A24A]/40 p-6 rounded-3xl max-w-xl mx-auto animate-fade-in text-white shadow-2xl">
            {submittedSuccess ? (
              <div className="text-center py-4 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="font-bold text-white text-sm">{t.reviews.reviewSubmitted}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#C8A24A]">
                  {t.reviews.leaveReview}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t.reviews.yourName} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Almaz Bekele"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-[#C8A24A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {t.reviews.rating}
                    </label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-3 py-2 text-sm text-[#C8A24A] focus:ring-2 focus:ring-[#C8A24A] focus:outline-none font-bold"
                    >
                      <option value={5}>★★★★★ (5/5 Excellent)</option>
                      <option value={4}>★★★★☆ (4/5 Very Good)</option>
                      <option value={3}>★★★☆☆ (3/5 Good)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t.reviews.yourReview} *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Share your experience at Bisrat Hotel..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-[#C8A24A] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-[#333333] rounded-xl"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="bg-[#C8A24A] hover:bg-[#B58E38] text-[#1A1A1A] font-bold px-5 py-2 rounded-xl text-xs shadow-md border border-[#D8B96D]"
                  >
                    {t.reviews.submitReview}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {approvedReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#242424] rounded-2xl p-6 border border-[#C8A24A]/20 shadow-xl hover:border-[#C8A24A]/50 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Stars & Verified Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-[#C8A24A] text-sm">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#C8A24A] text-[#C8A24A]" />
                    ))}
                  </div>

                  {rev.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      <UserCheck className="w-3 h-3 text-emerald-400" />
                      <span>{t.reviews.verifiedBadge}</span>
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic mb-4">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-[#333333] flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{rev.author}</p>
                  <p className="text-[10px] text-slate-400">{rev.location}</p>
                </div>
                <span className="text-[10px] text-slate-400">{rev.date}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
