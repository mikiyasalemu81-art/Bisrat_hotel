import React, { useState } from 'react';
import { Bed, Calendar, Utensils, Star, Camera, LogOut, ShieldCheck, Sparkles, CreditCard } from 'lucide-react';
import RoomManager from './RoomManager';
import BookingManager from './BookingManager';
import MenuManager from './MenuManager';
import ReviewManager from './ReviewManager';
import PhotoManager from './PhotoManager';
import FacilityManager from './FacilityManager';
import PaymentSettingsManager from './PaymentSettingsManager';
import { translations } from '../translations';

export default function AdminDashboard({ 
  rooms, 
  setRooms, 
  bookings, 
  setBookings, 
  menuItems, 
  setMenuItems, 
  reviews, 
  setReviews, 
  photos, 
  setPhotos, 
  facilities,
  setFacilities,
  paymentSettings,
  setPaymentSettings,
  lang,
  onLogout 
}) {
  const t = translations[lang] || translations.en;

  const [adminTab, setAdminTab] = useState('menu');

  const adminTabs = [
    { id: 'menu', label: t.admin.tabMenu, icon: Utensils },
    { id: 'rooms', label: t.admin.tabRooms, icon: Bed },
    { id: 'facilities', label: "Facilities & Amenities", icon: Sparkles },
    { id: 'bookings', label: t.admin.tabBookings, icon: Calendar },
    { id: 'paymentSettings', label: "Payment & Contact Settings", icon: CreditCard },
    { id: 'reviews', label: t.admin.tabReviews, icon: Star },
    { id: 'photos', label: t.admin.tabPhotos, icon: Camera },
  ];

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-[#1A1A1A] text-white border border-[#C8A24A]/30 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#C8A24A] text-[#1A1A1A] flex items-center justify-center shadow-md border border-[#D8B96D]">
            <ShieldCheck className="w-7 h-7 text-[#1A1A1A]" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold">
              {t.admin.title} — Bisrat Hotel Adama
            </h2>
            <p className="text-xs text-[#C8A24A] font-medium">
              Live Management Dashboard • Adama, Ethiopia
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-[#262626] hover:bg-[#333333] text-slate-200 font-bold px-4 py-2 rounded-xl text-xs transition-colors border border-[#C8A24A]/30"
        >
          <LogOut className="w-4 h-4 text-[#C8A24A]" />
          <span>{t.admin.logout}</span>
        </button>
      </div>

      {/* Admin Tab Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-[#F4EFE6] p-2 rounded-2xl border border-[#E8E0D2] shadow-soft">
        {adminTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                isSelected
                  ? 'bg-[#C8A24A] text-[#1A1A1A] shadow-md border border-[#D8B96D]'
                  : 'text-slate-700 hover:bg-[#E8E0D2]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-[#FAF7F0] p-6 sm:p-8 rounded-3xl border border-[#E8E0D2] shadow-soft">
        {adminTab === 'menu' && (
          <MenuManager 
            menuItems={menuItems} 
            setMenuItems={setMenuItems} 
            lang={lang} 
          />
        )}

        {adminTab === 'rooms' && (
          <RoomManager 
            rooms={rooms} 
            setRooms={setRooms} 
            lang={lang} 
          />
        )}

        {adminTab === 'facilities' && (
          <FacilityManager 
            facilities={facilities} 
            setFacilities={setFacilities} 
          />
        )}

        {adminTab === 'bookings' && (
          <BookingManager 
            bookings={bookings} 
            setBookings={setBookings} 
          />
        )}

        {adminTab === 'paymentSettings' && (
          <PaymentSettingsManager 
            paymentSettings={paymentSettings} 
            setPaymentSettings={setPaymentSettings} 
          />
        )}

        {adminTab === 'reviews' && (
          <ReviewManager 
            reviews={reviews} 
            setReviews={setReviews} 
          />
        )}

        {adminTab === 'photos' && (
          <PhotoManager 
            photos={photos} 
            setPhotos={setPhotos} 
          />
        )}
      </div>

    </div>
  );
}
