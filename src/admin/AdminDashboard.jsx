import React, { useState } from 'react';
import { Bed, Calendar, Utensils, Star, Camera, LogOut, ShieldCheck, Sparkles, CreditCard } from 'lucide-react';
import RoomManager from './RoomManager';
import BookingManager from './BookingManager';
import MenuManager from './MenuManager';
import ReviewManager from './ReviewManager';
import PhotoManager from './PhotoManager';
import GalleryManager from './GalleryManager';
import FacilityManager from './FacilityManager';
import PaymentSettingsManager from './PaymentSettingsManager';
import { translations } from '../translations';
import { getOptimizedImageUrl } from '../utils/imageUrl';

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
  gallery,
  setGallery,
  facilities,
  setFacilities,
  paymentSettings,
  setPaymentSettings,
  adminPassword,
  setAdminPassword,
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
    { id: 'photos', label: "Hero Carousel & Gallery", icon: Camera },
  ];

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-[#1B4D3E] text-white border border-[#13382D] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#C5A059] bg-[#13382D] p-0.5 shadow-md shrink-0">
            <img 
              src={getOptimizedImageUrl("/logo.png")} 
              onError={(e) => { e.currentTarget.src = "/images/logo.jpg"; }}
              alt="Bisrat Hotel Logo" 
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl font-bold text-white">
                {t.admin.title} — Bisrat Hotel Adama
              </h2>
              <span className="hidden sm:inline-block bg-[#C5A059] text-[#1A1C19] text-[10px] font-black px-2 py-0.5 rounded uppercase">
                Admin
              </span>
            </div>
            <p className="text-xs text-[#C5A059] font-medium mt-0.5">
              Live Operational & Payment Dashboard • Adama, Ethiopia
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-[#13382D] hover:bg-[#0E2A22] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors border border-[#C5A059]/40"
        >
          <LogOut className="w-4 h-4 text-[#C5A059]" />
          <span>{t.admin.logout}</span>
        </button>
      </div>

      {/* Admin Tab Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-white p-2 rounded-2xl border border-[#E8EFE9] shadow-sm">
        {adminTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                isSelected
                  ? 'bg-[#1B4D3E] text-white shadow-md border border-[#13382D]'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-[#C5A059]' : 'text-stone-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-[#FDFCF7] p-6 sm:p-8 rounded-3xl border border-[#E8EFE9] shadow-sm">
        {adminTab === 'menu' && (
          <MenuManager 
            menuItems={menuItems} 
            setMenuItems={setMenuItems} 
            photos={photos}
            setPhotos={setPhotos}
            paymentSettings={paymentSettings}
            lang={lang} 
          />
        )}

        {adminTab === 'rooms' && (
          <RoomManager 
            rooms={rooms} 
            setRooms={setRooms} 
            paymentSettings={paymentSettings}
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
            adminPassword={adminPassword}
            setAdminPassword={setAdminPassword}
          />
        )}

        {adminTab === 'reviews' && (
          <ReviewManager 
            reviews={reviews} 
            setReviews={setReviews} 
          />
        )}

        {adminTab === 'photos' && (
          <GalleryManager 
            gallery={gallery}
            setGallery={setGallery}
            photos={photos} 
            setPhotos={setPhotos} 
            paymentSettings={paymentSettings}
            lang={lang}
          />
        )}
      </div>

    </div>
  );
}
