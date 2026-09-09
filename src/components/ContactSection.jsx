import React, { useState } from 'react';
import { MapPin, Phone, MessageSquare, Send, CheckCircle2, PhoneCall, Building2 } from 'lucide-react';
import LocalGuide from './LocalGuide';
import { translations } from '../translations';

// Simple SVG TikTok Icon
const TikTokIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-2.89-2.89c.28 0 .56.04.83.12V9.41a6.34 6.34 0 0 0-.83-.05A6.33 6.33 0 1 0 15.82 15.7V8.5a8.28 8.28 0 0 0 4.77 1.51V6.56a4.84 4.84 0 0 1-1-.13z"/>
  </svg>
);

export default function ContactSection({ lang }) {
  const t = translations[lang] || translations.en;

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!name || !message) return;
    setSent(true);
    setName('');
    setMessage('');
    setTimeout(() => setSent(false), 4000);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Bisrat Hotel (Adama)! I would like to inquire about room availability and reservations.`
  );
  const whatsappUrl = `https://wa.me/251906320251?text=${whatsappMessage}`;

  return (
    <section id="contact" className="py-16 lg:py-24 bg-[#FAF7F0] border-t border-[#E8E0D2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#C8A24A] bg-[#FAF2E1] border border-[#C8A24A]/40 px-3 py-1 rounded-full mb-3">
            Reach Out to Bisrat Hotel
          </span>
          <h2 className="fluid-section-title font-serif font-bold text-[#1A1A1A] mb-3">
            {t.contact.title}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            {t.contact.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Contact Cards, TikTok, WhatsApp & Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Location Card */}
              <div className="bg-[#F4EFE6] p-4 rounded-2xl border border-[#E8E0D2] shadow-soft">
                <div className="w-9 h-9 rounded-xl bg-[#FAF2E1] text-[#C8A24A] flex items-center justify-center mb-2">
                  <MapPin className="w-4 h-4 text-[#C8A24A]" />
                </div>
                <h3 className="text-[11px] font-bold text-slate-500 uppercase">{t.contact.addressTitle}</h3>
                <p className="font-serif text-sm font-bold text-[#1A1A1A] mt-0.5">
                  {t.contact.addressVal}
                </p>
              </div>

              {/* Mobile Phone Card */}
              <div className="bg-[#F4EFE6] p-4 rounded-2xl border border-[#E8E0D2] shadow-soft">
                <div className="w-9 h-9 rounded-xl bg-[#FAF2E1] text-[#C8A24A] flex items-center justify-center mb-2">
                  <Phone className="w-4 h-4 text-[#C8A24A]" />
                </div>
                <h3 className="text-[11px] font-bold text-slate-500 uppercase">{t.contact.mobileTitle}</h3>
                <a 
                  href="tel:0906320251" 
                  className="font-serif text-base font-bold text-[#C8A24A] hover:underline block mt-0.5"
                >
                  0906320251
                </a>
              </div>

              {/* Reception Landline Card */}
              <div className="bg-[#F4EFE6] p-4 rounded-2xl border border-[#E8E0D2] shadow-soft">
                <div className="w-9 h-9 rounded-xl bg-[#FAF2E1] text-[#C8A24A] flex items-center justify-center mb-2">
                  <Building2 className="w-4 h-4 text-[#C8A24A]" />
                </div>
                <h3 className="text-[11px] font-bold text-slate-500 uppercase">{t.contact.landlineTitle}</h3>
                <a 
                  href="tel:0222112555" 
                  className="font-serif text-base font-bold text-[#1A1A1A] hover:underline block mt-0.5"
                >
                  022 211 2555
                </a>
              </div>

            </div>

            {/* Social & Messaging Row: WhatsApp + TikTok */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* WhatsApp Click-to-Chat */}
              <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-xs">{t.contact.whatsappTitle}</h4>
                    <p className="text-[10px] text-emerald-800">Direct booking inquiry</p>
                  </div>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl text-xs shrink-0"
                >
                  Chat
                </a>
              </div>

              {/* TikTok Profile Badge */}
              <a
                href="https://www.tiktok.com/@bisrat_hotel"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1A1A1A] hover:bg-[#262626] text-white p-4 rounded-2xl flex items-center justify-between gap-3 border border-[#C8A24A]/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#262626] text-[#C8A24A] flex items-center justify-center shrink-0 border border-[#C8A24A]/40">
                    <TikTokIcon className="w-5 h-5 text-[#C8A24A]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Follow on TikTok</h4>
                    <p className="text-[10px] text-[#C8A24A] font-mono">@bisrat_hotel</p>
                  </div>
                </div>

                <span className="bg-[#C8A24A] text-[#1A1A1A] text-[10px] font-bold px-2.5 py-1 rounded-lg">
                  Follow
                </span>
              </a>

            </div>

            {/* Contact Form */}
            <div className="bg-[#F4EFE6] p-6 sm:p-8 rounded-3xl border border-[#E8E0D2] shadow-soft">
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A] mb-4">
                {t.contact.formTitle}
              </h3>

              {sent ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{t.contact.msgSent}</span>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.contact.name} *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-white border border-[#E8E0D2] rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-[#C8A24A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.contact.message} *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message or inquiry..."
                      className="w-full bg-white border border-[#E8E0D2] rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-[#C8A24A] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#C8A24A] hover:bg-[#B58E38] text-[#1A1A1A] font-bold py-3 px-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 border border-[#D8B96D]"
                  >
                    <Send className="w-4 h-4 text-[#1A1A1A]" />
                    <span>{t.contact.sendMessage}</span>
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Right Column: Embedded Map & Local Guide */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-[#F4EFE6] p-2 rounded-3xl border border-[#E8E0D2] shadow-soft overflow-hidden">
              <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-slate-100">
                <iframe
                  title="Bisrat Hotel Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15783.693356877284!2d39.261899!3d8.539823!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b850fefefefef%3A0x0!2sAdama%2C%20Ethiopia!5e0!3m2!1sen!2set!4v1700000000000!5m2!1sen!2set"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>
              <div className="p-3 text-center">
                <p className="text-xs font-bold text-[#1A1A1A]">
                  Bisrat Hotel (ብስራት ሆቴል) • Adama, Ethiopia
                </p>
                <p className="text-[11px] text-slate-500">
                  Map Code: G7P4+PC Adama
                </p>
              </div>
            </div>

            <LocalGuide lang={lang} />

          </div>

        </div>

      </div>
    </section>
  );
}
