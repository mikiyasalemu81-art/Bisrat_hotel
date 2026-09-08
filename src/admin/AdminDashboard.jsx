import React, { useState } from 'react';
import { Bed, Calendar, Utensils, Star, Camera, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import RoomManager from './RoomManager';
import BookingManager from './BookingManager';
import MenuManager from './MenuManager';
import ReviewManager from './ReviewManager';
import PhotoManager from './PhotoManager';
import FacilityManager from './FacilityManager';
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
    { id: 'reviews', label: t.admin.tabReviews, icon: Star },
    { id: 'photos', label: t.admin.tabPhotos, icon: Camera },
  ];

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-navybrand-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-skybrand-500 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold">
              {t.admin.title} — Bisrat Hotel Adama
            </h2>
            <p className="text-xs text-skybrand-300 font-medium">
              Live Management Dashboard • Adama, Ethiopia
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl text-xs transition-colors border border-slate-700"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.admin.logout}</span>
        </button>
      </div>

      {/* Admin Tab Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-white p-2 rounded-2xl border border-slate-200 shadow-soft">
        {adminTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                isSelected
                  ? 'bg-skybrand-500 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft">
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
