import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HeroSection from './components/HeroSection';
import Highlights from './components/Highlights';
import RoomsSection from './components/RoomsSection';
import MenuSection from './components/MenuSection';
import GallerySection from './components/GallerySection';
import ReviewsSection from './components/ReviewsSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';

import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';

import { initialRooms } from './data/roomsData';
import { initialMenuItems } from './data/menuData';
import { initialGallery } from './data/galleryData';
import { initialReviews } from './data/reviewsData';
import { loadAllPhotosFromStorage } from './utils/imageStorage';
import { setImageSyncTimestamp } from './utils/imageUrl';
import { fetchCloudAppState, saveCloudAppState } from './utils/cloudSync';

/**
 * Smart merge function: preserves the complete authentic menu catalog and photos
 * while overlaying any admin modifications (availability, price, custom photo, details)
 * so dishes can never be accidentally erased or lost across devices.
 */
function mergeCatalogWithRemote(baseCatalog, remoteList) {
  if (!Array.isArray(remoteList) || remoteList.length === 0) return baseCatalog;

  const remoteById = new Map();
  const remoteByName = new Map();
  remoteList.forEach(item => {
    if (item && item.id) remoteById.set(String(item.id), item);
    if (item && item.nameEn) remoteByName.set(item.nameEn.toLowerCase().trim(), item);
  });

  // 1. Overlay admin changes onto all authentic catalog dishes
  const merged = baseCatalog.map(baseItem => {
    const override = remoteById.get(String(baseItem.id)) || remoteByName.get(baseItem.nameEn?.toLowerCase().trim());
    if (!override) return baseItem;

    return {
      ...baseItem,
      price: typeof override.price === 'number' && override.price > 0 ? override.price : (Number(override.price) || baseItem.price),
      isAvailable: override.isAvailable !== undefined ? override.isAvailable : baseItem.isAvailable,
      imageUrl: override.imageUrl || override.image_url || override.customImage || baseItem.imageUrl,
      customImage: override.customImage || override.imageUrl || baseItem.customImage,
      nameEn: override.nameEn || baseItem.nameEn,
      nameAm: override.nameAm || baseItem.nameAm,
      nameOr: override.nameOr || baseItem.nameOr,
      description: override.description || baseItem.description,
      updatedAt: override.updatedAt || baseItem.updatedAt
    };
  });

  // 2. Preserve any newly added custom dishes created in admin dashboard
  remoteList.forEach(item => {
    if (!item || !item.id) return;
    const exists = baseCatalog.some(b => 
      String(b.id) === String(item.id) || 
      (b.nameEn && item.nameEn && b.nameEn.toLowerCase().trim() === item.nameEn.toLowerCase().trim())
    );
    if (!exists) {
      merged.unshift(item);
    }
  });

  return merged;
}

export default function App() {
  // Trilingual Language State (remembers choice)
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('bisrat_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('bisrat_lang', lang);
  }, [lang]);

  // Persistent 3-Tab Main Navigation ('home' | 'menu' | 'admin')
  const [activeTab, setActiveTab] = useState('home');

  // Payment & Contact Settings State
  const [paymentSettings, setPaymentSettings] = useState(() => {
    const version = localStorage.getItem('bisrat_payment_version');
    const saved = localStorage.getItem('bisrat_payment_settings');
    const parsed = (saved && version === '3.0') ? JSON.parse(saved) : {};
    return {
      activeTables: Array.isArray(parsed.activeTables) && parsed.activeTables.length > 0 
        ? parsed.activeTables 
        : ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "VIP 1", "VIP 2", "Terrace 1"],
      tableNumber: parsed.tableNumber || "1",
      phoneNumber: parsed.phoneNumber || "0906320251",
      landlinePhone: parsed.landlinePhone || "022 211 2555",
      cbeAccountNumber: "1000679192934",
      cbeAccountName: "Bisrat Hotel",
      paymentMethods: {
        cbe: true,
        arrival: true,
      },
      cloudStorage: {
        provider: parsed.cloudStorage?.provider || "cloudinary",
        cloudName: parsed.cloudStorage?.cloudName || "trkihe9m",
        uploadPreset: parsed.cloudStorage?.uploadPreset || "bisrat_unsigned",
        supabaseUrl: parsed.cloudStorage?.supabaseUrl || "",
        supabaseKey: parsed.cloudStorage?.supabaseKey || "",
        supabaseBucket: parsed.cloudStorage?.supabaseBucket || "bisrat-hotel",
        imgbbApiKey: parsed.cloudStorage?.imgbbApiKey || "8cf91a329d638beae098d6f966144e59",
      }
    };
  });
  useEffect(() => {
    localStorage.setItem('bisrat_payment_settings', JSON.stringify(paymentSettings));
    localStorage.setItem('bisrat_payment_version', '3.0');
  }, [paymentSettings]);

  // Rooms Data State
  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem('bisrat_rooms');
    return saved ? JSON.parse(saved) : initialRooms;
  });
  useEffect(() => {
    localStorage.setItem('bisrat_rooms', JSON.stringify(rooms));
  }, [rooms]);

  // Menu Items State (Full 111-dish catalog preserved with admin overrides)
  const [menuItems, setMenuItems] = useState(() => {
    try {
      const version = localStorage.getItem('bisrat_menu_version');
      if (version === '5.0') {
        const saved = localStorage.getItem('bisrat_menu');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return mergeCatalogWithRemote(initialMenuItems, parsed);
          }
        }
      }
    } catch (e) {
      console.warn("Notice reading saved menu:", e);
    }
    return initialMenuItems;
  });
  useEffect(() => {
    localStorage.setItem('bisrat_menu', JSON.stringify(menuItems));
    localStorage.setItem('bisrat_menu_version', '5.0');
  }, [menuItems]);

  // Real-time synchronization across browser tabs and customer devices
  useEffect(() => {
    let channel = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('bisrat_hotel_sync');
        channel.onmessage = (event) => {
          if (event.data?.imgSyncTs) {
            setImageSyncTimestamp(event.data.imgSyncTs);
          }
          if (event.data?.type === 'MENU_UPDATE' && Array.isArray(event.data.menuItems)) {
            setMenuItems(prev => mergeCatalogWithRemote(initialMenuItems, event.data.menuItems));
          }
          if (event.data?.type === 'PHOTOS_UPDATE' && event.data.photos) {
            setPhotos(prev => ({ ...prev, ...event.data.photos }));
          }
          if (event.data?.type === 'GALLERY_UPDATE' && Array.isArray(event.data.gallery)) {
            setGallery(event.data.gallery);
          }
          if (event.data?.type === 'ROOMS_UPDATE' && Array.isArray(event.data.rooms)) {
            setRooms(event.data.rooms);
          }
          if (event.data?.type === 'IMG_SYNC' && event.data.timestamp) {
            setImageSyncTimestamp(event.data.timestamp);
          }
          if (event.data?.type === 'PAYMENT_SETTINGS_UPDATE' && event.data.paymentSettings) {
            setPaymentSettings(event.data.paymentSettings);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel sync init:', e);
    }

    const handleStorage = (e) => {
      if (e.key === 'bisrat_menu' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setMenuItems(parsed);
        } catch {}
      }
      if (e.key === 'bisrat_photos' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed) setPhotos(prev => ({ ...prev, ...parsed }));
        } catch {}
      }
      if (e.key === 'bisrat_gallery' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setGallery(parsed);
        } catch {}
      }
      if (e.key === 'bisrat_img_sync_ts' && e.newValue) {
        setImageSyncTimestamp(e.newValue);
      }
      if (e.key === 'bisrat_payment_settings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed) setPaymentSettings(parsed);
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channel) channel.close();
    };
  }, []);

  // Facilities / Amenities State
  const [facilities, setFacilities] = useState(() => {
    const saved = localStorage.getItem('bisrat_facilities');
    return saved ? JSON.parse(saved) : [
      {
        id: "fac-1",
        iconType: "Wifi",
        title: "High-Speed WiFi",
        desc: "Uninterrupted fiber optic internet throughout the hotel premises.",
        bg: "bg-sky-50 text-skybrand-600 border-sky-100"
      },
      {
        id: "fac-2",
        iconType: "Utensils",
        title: "Gourmet Restaurant & Bar",
        desc: "Traditional Ethiopian cuisine & international dishes prepared fresh daily.",
        bg: "bg-blue-50 text-blue-600 border-blue-100"
      },
      {
        id: "fac-3",
        iconType: "Car",
        title: "Ample Secure Parking",
        desc: "24/7 guarded private parking for your vehicle's safety.",
        bg: "bg-emerald-50 text-emerald-600 border-emerald-100"
      },
      {
        id: "fac-4",
        iconType: "Zap",
        title: "24/7 Power Backup",
        desc: "Automatic heavy-duty generators ensure zero power interruptions.",
        bg: "bg-amber-50 text-amber-600 border-amber-100"
      }
    ];
  });
  useEffect(() => {
    localStorage.setItem('bisrat_facilities', JSON.stringify(facilities));
  }, [facilities]);

  // Bookings Data State
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('bisrat_bookings');
    return saved ? JSON.parse(saved) : [
      {
        id: "BH-2026-9041",
        roomName: "Deluxe King Room",
        guestName: "Abebe Bikila",
        phone: "0911223344",
        email: "abebe@example.com",
        checkIn: "2026-09-10",
        checkOut: "2026-09-12",
        nights: 2,
        guests: 2,
        totalPrice: 5000,
        paymentMethod: "cbe",
        status: "Confirmed",
        createdAt: "2026-09-08"
      }
    ];
  });
  useEffect(() => {
    localStorage.setItem('bisrat_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Reviews Data State
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('bisrat_reviews');
    return saved ? JSON.parse(saved) : initialReviews;
  });
  useEffect(() => {
    localStorage.setItem('bisrat_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Photo Upload Manager State (Persistent Storage via IndexedDB + localStorage)
  const [photos, setPhotos] = useState(() => {
    try {
      const saved = localStorage.getItem('bisrat_photos');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    loadAllPhotosFromStorage().then(loadedPhotos => {
      if (loadedPhotos && Object.keys(loadedPhotos).length > 0) {
        setPhotos(prev => ({ ...prev, ...loadedPhotos }));
      }
    });
  }, []);

  // Hotel Public Gallery State (Persistent Storage & Cloud Sync)
  const [gallery, setGallery] = useState(() => {
    try {
      const version = localStorage.getItem('bisrat_gallery_version');
      const saved = localStorage.getItem('bisrat_gallery');
      if (version === '2.0' && saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed to load gallery from storage:", e);
    }
    localStorage.setItem('bisrat_gallery_version', '2.0');
    localStorage.setItem('bisrat_gallery', JSON.stringify(initialGallery));
    return initialGallery;
  });

  useEffect(() => {
    try {
      localStorage.setItem('bisrat_gallery', JSON.stringify(gallery));
      localStorage.setItem('bisrat_gallery_version', '2.0');
    } catch (e) {}
  }, [gallery]);

  // Automatic Cloud Network Sync across all devices (phones, computers, customers)
  useEffect(() => {
    let isMounted = true;

    const syncWithCloud = async () => {
      try {
        const cloudRes = await fetchCloudAppState(paymentSettings?.cloudStorage);
        if (isMounted && cloudRes.success && cloudRes.data) {
          const remote = cloudRes.data;

          if (Array.isArray(remote.menuItems) && remote.menuItems.length > 0) {
            setMenuItems(prev => {
              const updated = mergeCatalogWithRemote(initialMenuItems, remote.menuItems);
              try { localStorage.setItem('bisrat_menu', JSON.stringify(updated)); } catch (e) {}
              return updated;
            });
          }
          if (remote.photos && typeof remote.photos === 'object' && Object.keys(remote.photos).length > 0) {
            setPhotos(prev => ({ ...prev, ...remote.photos }));
            try { localStorage.setItem('bisrat_photos', JSON.stringify(remote.photos)); } catch (e) {}
          }
          if (Array.isArray(remote.gallery) && remote.gallery.length > 0) {
            setGallery(remote.gallery);
            try { localStorage.setItem('bisrat_gallery', JSON.stringify(remote.gallery)); } catch (e) {}
          }
          if (Array.isArray(remote.rooms) && remote.rooms.length > 0) {
            setRooms(remote.rooms);
            try { localStorage.setItem('bisrat_rooms', JSON.stringify(remote.rooms)); } catch (e) {}
          }
          if (Array.isArray(remote.facilities) && remote.facilities.length > 0) {
            setFacilities(remote.facilities);
            try { localStorage.setItem('bisrat_facilities', JSON.stringify(remote.facilities)); } catch (e) {}
          }
          if (Array.isArray(remote.reviews) && remote.reviews.length > 0) {
            setReviews(remote.reviews);
            try { localStorage.setItem('bisrat_reviews', JSON.stringify(remote.reviews)); } catch (e) {}
          }
          if (remote.paymentSettings && typeof remote.paymentSettings === 'object') {
            setPaymentSettings(prev => ({
              ...prev,
              ...remote.paymentSettings,
              cloudStorage: prev.cloudStorage?.supabaseUrl ? prev.cloudStorage : (remote.paymentSettings.cloudStorage || prev.cloudStorage)
            }));
          }
          if (remote.updatedAt) {
            setImageSyncTimestamp(remote.updatedAt);
          }
        }
      } catch (err) {
        console.warn('[App] Remote cloud synchronization notice:', err);
      }
    };

    // 1. Initial cloud sync on mount
    syncWithCloud();

    // 2. Poll cloud periodically (every 15s) for live cross-device updates
    const interval = setInterval(syncWithCloud, 15000);

    // 3. Sync on tab focus or visibility change (e.g. user opens phone or switches back to tab)
    const handleFocus = () => syncWithCloud();
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    // 4. Same-device multi-tab live sync
    let bc = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('bisrat_hotel_sync');
        bc.onmessage = () => syncWithCloud();
      }
    } catch (e) {}

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      if (bc) bc.close();
    };
  }, [
    paymentSettings?.cloudStorage?.supabaseUrl, 
    paymentSettings?.cloudStorage?.supabaseKey,
    paymentSettings?.cloudStorage?.cloudName,
    paymentSettings?.cloudStorage?.uploadPreset
  ]);

  // Admin Auth & Password State
  const [isAdminAuth, setIsAdminAuth] = useState(() => {
    return localStorage.getItem('bisrat_admin_auth') === 'true';
  });

  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem('bisrat_admin_password') || 'bisrathotel123';
  });
  useEffect(() => {
    localStorage.setItem('bisrat_admin_password', adminPassword);
  }, [adminPassword]);

  const handleAdminLogin = () => {
    setIsAdminAuth(true);
    localStorage.setItem('bisrat_admin_auth', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdminAuth(false);
    localStorage.removeItem('bisrat_admin_auth');
    setActiveTab('home');
  };

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);

  const handleOpenBooking = (room = null) => {
    setSelectedRoomForBooking(room || rooms[0]);
    setIsBookingOpen(true);
  };

  const handleBookingSubmit = (newBooking) => {
    setBookings([newBooking, ...bookings]);
  };

  const handleAddReview = (newReview) => {
    const updated = [newReview, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem('bisrat_reviews', JSON.stringify(updated));
    } catch (e) {}
    saveCloudAppState('reviews', updated).catch(() => {});
  };

  return (
    <div className="w-full max-w-[100vw] overflow-x-clip min-h-screen flex flex-col bg-[#FDFCF7] text-[#1A1C19] selection:bg-[#C5A059] selection:text-[#1B4D3E] pb-16 sm:pb-20">
      
      {/* Pinned Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        onBookClick={() => handleOpenBooking()}
      />

      {/* Spacer to offset fixed Header */}
      <div className="h-14 sm:h-16 shrink-0" aria-hidden="true" />

      {/* Main Content Area based on 3-Tab Bar */}
      <main className="flex-1 w-full max-w-[100vw] overflow-x-clip">
        
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="animate-fade-in">
            <HeroSection
              lang={lang}
              photos={photos}
              paymentSettings={paymentSettings}
              onBookClick={() => handleOpenBooking()}
              onExploreMenuClick={() => setActiveTab('menu')}
            />

            <Highlights lang={lang} facilities={facilities} />

            <RoomsSection
              rooms={rooms}
              photos={photos}
              lang={lang}
              onSelectRoom={(room) => handleOpenBooking(room)}
            />

            <GallerySection
              gallery={gallery}
              photos={photos}
              lang={lang}
            />

            <ReviewsSection
              reviews={reviews}
              lang={lang}
              onAddReview={handleAddReview}
            />

            <ContactSection lang={lang} />
          </div>
        )}

        {/* TAB 2: RESTAURANT & BAR MENU */}
        {activeTab === 'menu' && (
          <div className="animate-fade-in">
            <MenuSection
              menuItems={menuItems}
              photos={photos}
              lang={lang}
              paymentSettings={paymentSettings}
            />
          </div>
        )}

        {/* TAB 3: ADMIN PORTAL */}
        {activeTab === 'admin' && (
          <div className="animate-fade-in">
            {!isAdminAuth ? (
              <AdminLogin
                lang={lang}
                onLoginSuccess={handleAdminLogin}
                adminPassword={adminPassword}
              />
            ) : (
              <AdminDashboard
                rooms={rooms}
                setRooms={setRooms}
                bookings={bookings}
                setBookings={setBookings}
                menuItems={menuItems}
                setMenuItems={setMenuItems}
                reviews={reviews}
                setReviews={setReviews}
                photos={photos}
                setPhotos={setPhotos}
                gallery={gallery}
                setGallery={setGallery}
                facilities={facilities}
                setFacilities={setFacilities}
                paymentSettings={paymentSettings}
                setPaymentSettings={setPaymentSettings}
                adminPassword={adminPassword}
                setAdminPassword={setAdminPassword}
                lang={lang}
                onLogout={handleAdminLogout}
              />
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer
        lang={lang}
        setLang={setLang}
        setActiveTab={setActiveTab}
      />

      {/* Fixed Compact Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
      />

      {/* Interactive Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedRoom={selectedRoomForBooking}
        rooms={rooms}
        lang={lang}
        paymentSettings={paymentSettings}
        onBookingSubmit={handleBookingSubmit}
      />

    </div>
  );
}
