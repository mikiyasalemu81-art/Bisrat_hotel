import React, { useState } from 'react';
import { 
  Utensils, 
  BedDouble, 
  CreditCard, 
  KeyRound, 
  LogOut, 
  RefreshCw, 
  CheckCircle2, 
  Globe,
  Sparkles,
  ShieldCheck,
  CalendarCheck
} from 'lucide-react';
import ReservationsManager from './ReservationsManager';
import MenuManager from './MenuManager';
import PaymentMethodsManager from './PaymentMethodsManager';
import ChangePasswordManager from './ChangePasswordManager';
import { translations } from '../translations';
import { getOptimizedImageUrl } from '../utils/imageUrl';
import { saveCloudAppState } from '../utils/cloudSync';

export default function AdminDashboard({ 
  menuItems = [], 
  setMenuItems, 
  roomReservations = [],
  setRoomReservations,
  foodReservations = [],
  setFoodReservations,
  paymentSettings = {},
  setPaymentSettings,
  adminPassword,
  setAdminPassword,
  photos = {}, 
  setPhotos, 
  lang = 'en',
  onLogout,
  onRefreshAll
}) {
  const t = translations[lang] || translations.en;

  // The 4 mandatory sections: 'reservations' | 'menu' | 'payments' | 'password'
  const [activeSection, setActiveSection] = useState('reservations');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  // 1. Atomic Stock Toggle Handler (stamps updatedAt, saves locally & immediately invokes cloud sync)
  const handleToggleStock = async (id) => {
    const now = Date.now();
    const updatedMenu = menuItems.map(item => {
      if (item.id === id) {
        const nextVal = item.isAvailable === false ? true : false;
        return {
          ...item,
          isAvailable: nextVal,
          isActive: nextVal,
          updatedAt: now
        };
      }
      return item;
    });

    setMenuItems(updatedMenu);
    try {
      localStorage.setItem('bisrat_menu', JSON.stringify(updatedMenu));
      localStorage.setItem('bisrat_menu_ts', String(now));
    } catch (e) {
      console.warn('Failed to save menu locally:', e);
    }

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('bisrat_hotel_sync');
        channel.postMessage({ type: 'MENU_UPDATE', menuItems: updatedMenu, updatedAt: now });
        channel.close();
      }
    } catch (e) {}

    try {
      return await saveCloudAppState('menuItems', updatedMenu, paymentSettings?.cloudStorage);
    } catch (err) {
      console.error('[AdminDashboard] Cloud sync error on stock toggle:', err);
      throw err;
    }
  };

  // 2. Atomic Menu Item Save Handler (price, details, photo)
  const handleSaveMenuItem = async (updatedItem) => {
    const now = Date.now();
    const itemWithTs = {
      ...updatedItem,
      updatedAt: now
    };
    const exists = menuItems.some(i => i.id === updatedItem.id);
    const updatedMenu = exists
      ? menuItems.map(i => i.id === updatedItem.id ? itemWithTs : i)
      : [itemWithTs, ...menuItems];

    setMenuItems(updatedMenu);
    try {
      localStorage.setItem('bisrat_menu', JSON.stringify(updatedMenu));
      localStorage.setItem('bisrat_menu_ts', String(now));
    } catch (e) {
      console.warn('Failed to save menu locally:', e);
    }

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('bisrat_hotel_sync');
        channel.postMessage({ type: 'MENU_UPDATE', menuItems: updatedMenu, updatedAt: now, imgSyncTs: now });
        channel.close();
      }
    } catch (e) {}

    try {
      return await saveCloudAppState('menuItems', updatedMenu, paymentSettings?.cloudStorage);
    } catch (err) {
      console.error('[AdminDashboard] Cloud sync error on menu item save:', err);
      throw err;
    }
  };

  // 3. Menu Item Delete Handler
  const handleDeleteMenuItem = async (id) => {
    const now = Date.now();
    const updatedMenu = menuItems.filter(i => i.id !== id);
    setMenuItems(updatedMenu);
    try {
      localStorage.setItem('bisrat_menu', JSON.stringify(updatedMenu));
      localStorage.setItem('bisrat_menu_ts', String(now));
    } catch (e) {}

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('bisrat_hotel_sync');
        channel.postMessage({ type: 'MENU_UPDATE', menuItems: updatedMenu, updatedAt: now });
        channel.close();
      }
    } catch (e) {}

    try {
      return await saveCloudAppState('menuItems', updatedMenu, paymentSettings?.cloudStorage);
    } catch (err) {
      console.error('[AdminDashboard] Cloud sync error on menu delete:', err);
      throw err;
    }
  };

  // 4. Atomic Payment Settings Handler
  const handleUpdatePaymentSettings = async (updatedSettings) => {
    const now = Date.now();
    const settingsWithTs = {
      ...updatedSettings,
      updatedAt: now
    };

    if (setPaymentSettings) setPaymentSettings(settingsWithTs);
    try {
      localStorage.setItem('bisrat_payment_settings', JSON.stringify(settingsWithTs));
      localStorage.setItem('bisrat_payment_ts', String(now));
    } catch (e) {
      console.warn('Failed to save payment settings locally:', e);
    }

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('bisrat_hotel_sync');
        channel.postMessage({ type: 'PAYMENT_SETTINGS_UPDATE', paymentSettings: settingsWithTs, updatedAt: now });
        channel.close();
      }
    } catch (e) {}

    try {
      return await saveCloudAppState('paymentSettings', settingsWithTs, paymentSettings?.cloudStorage);
    } catch (err) {
      console.error('[AdminDashboard] Cloud sync error on payment settings save:', err);
      throw err;
    }
  };

  const handleManualRefresh = async () => {
    if (onRefreshAll) {
      setIsRefreshing(true);
      try {
        await onRefreshAll();
        setRefreshSuccess(true);
        setTimeout(() => setRefreshSuccess(false), 3000);
      } catch (err) {
        console.warn('Manual refresh warning:', err);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const totalReservationsCount = (roomReservations?.length || 0) + (foodReservations?.length || 0);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      
      {/* Top Banner */}
      <div className="bg-[#1B4D3E] text-white border border-[#13382D] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
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
              <h1 className="font-serif text-2xl font-bold text-white tracking-tight">
                Bisrat Hotel Administration
              </h1>
              <span className="bg-[#C5A059] text-[#1A1C19] text-[10px] font-black px-2 py-0.5 rounded uppercase">
                Admin
              </span>
            </div>
            <p className="text-xs text-[#C5A059] font-medium mt-0.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Persistent Central Database • Multi-Device Live Synchronization</span>
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-end md:self-auto">
          {refreshSuccess && (
            <span className="bg-emerald-800/90 text-emerald-200 border border-emerald-500/50 text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Synced!</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="bg-[#13382D] hover:bg-[#0E2A22] text-stone-200 hover:text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 border border-[#C5A059]/30 transition-colors cursor-pointer"
            title="Reload latest state from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C5A059] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Server'}</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 bg-[#13382D] hover:bg-[#0E2A22] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors border border-[#C5A059]/40 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-[#C5A059]" />
            <span>{t.admin.logout}</span>
          </button>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 4 PRIMARY SECTIONS NAVIGATION TAB BAR                               */}
      {/* 1. Reservations  2. Menu  3. Payment Settings  4. Change Password   */}
      {/* =================================================================== */}
      <div className="bg-white p-2 rounded-2xl border border-[#E8EFE9] shadow-2xs">
        <nav className="grid grid-cols-2 md:grid-cols-4 gap-2">
          
          {/* SECTION 1: RESERVATIONS */}
          <button
            type="button"
            onClick={() => setActiveSection('reservations')}
            className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeSection === 'reservations'
                ? 'bg-[#1B4D3E] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <CalendarCheck className={`w-4 h-4 ${activeSection === 'reservations' ? 'text-[#C5A059]' : 'text-stone-500'}`} />
            <span>Reservations</span>
            {totalReservationsCount > 0 && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                activeSection === 'reservations' ? 'bg-[#C5A059] text-[#1A1C19]' : 'bg-stone-100 text-stone-700'
              }`}>
                {totalReservationsCount}
              </span>
            )}
          </button>

          {/* SECTION 2: MENU */}
          <button
            type="button"
            onClick={() => setActiveSection('menu')}
            className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeSection === 'menu'
                ? 'bg-[#1B4D3E] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Utensils className={`w-4 h-4 ${activeSection === 'menu' ? 'text-[#C5A059]' : 'text-stone-500'}`} />
            <span>Menu (CRUD)</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              activeSection === 'menu' ? 'bg-[#C5A059] text-[#1A1C19]' : 'bg-stone-100 text-stone-700'
            }`}>
              {menuItems.length}
            </span>
          </button>

          {/* SECTION 3: PAYMENT SETTINGS */}
          <button
            type="button"
            onClick={() => setActiveSection('payments')}
            className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeSection === 'payments'
                ? 'bg-[#1B4D3E] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <CreditCard className={`w-4 h-4 ${activeSection === 'payments' ? 'text-[#C5A059]' : 'text-stone-500'}`} />
            <span>Payment Settings</span>
          </button>

          {/* SECTION 4: CHANGE PASSWORD */}
          <button
            type="button"
            onClick={() => setActiveSection('password')}
            className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeSection === 'password'
                ? 'bg-[#1B4D3E] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <KeyRound className={`w-4 h-4 ${activeSection === 'password' ? 'text-[#C5A059]' : 'text-stone-500'}`} />
            <span>Change Password</span>
          </button>

        </nav>
      </div>

      {/* =================================================================== */}
      {/* ACTIVE SECTION CONTENT PANEL                                        */}
      {/* =================================================================== */}
      <div className="bg-[#FDFCF7] p-6 sm:p-8 rounded-3xl border border-[#E8EFE9] shadow-sm min-h-[500px]">
        
        {/* 1. RESERVATIONS SECTION */}
        {activeSection === 'reservations' && (
          <ReservationsManager
            roomReservations={roomReservations}
            setRoomReservations={setRoomReservations}
            foodReservations={foodReservations}
            setFoodReservations={setFoodReservations}
            lang={lang}
            onRefresh={handleManualRefresh}
          />
        )}

        {/* 2. MENU SECTION (Functional CRUD, Active/Inactive Toggle, Cloudinary upload) */}
        {activeSection === 'menu' && (
          <MenuManager 
            menuItems={menuItems} 
            setMenuItems={setMenuItems} 
            onToggleStock={handleToggleStock}
            onSaveMenuItem={handleSaveMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
            photos={photos}
            setPhotos={setPhotos}
            paymentSettings={paymentSettings}
            lang={lang} 
          />
        )}

        {/* 3. PAYMENT SETTINGS SECTION (Dynamic Methods CRUD, Fields, Toggle) */}
        {activeSection === 'payments' && (
          <PaymentMethodsManager
            paymentSettings={paymentSettings}
            setPaymentSettings={setPaymentSettings}
            onUpdatePaymentSettings={handleUpdatePaymentSettings}
            lang={lang}
          />
        )}

        {/* 4. CHANGE PASSWORD SECTION (3-Step Flow Saved to Backend) */}
        {activeSection === 'password' && (
          <ChangePasswordManager
            adminPassword={adminPassword}
            setAdminPassword={setAdminPassword}
            lang={lang}
          />
        )}

      </div>

    </div>
  );
}
