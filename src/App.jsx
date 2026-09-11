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
    const saved = localStorage.getItem('bisrat_payment_settings');
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      activeTables: Array.isArray(parsed.activeTables) && parsed.activeTables.length > 0 
        ? parsed.activeTables 
        : ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "VIP 1", "VIP 2", "Terrace 1"],
      tableNumber: parsed.tableNumber || "1",
      phoneNumber: parsed.phoneNumber || "0906320251",
      landlinePhone: parsed.landlinePhone || "022 211 2555",
      cbeAccountNumber: parsed.cbeAccountNumber || "1000123456789",
      cbeAccountName: parsed.cbeAccountName || "Bisrat Hotel Adama",
      telebirrShortcode: parsed.telebirrShortcode || "654321",
      paymentMethods: {
        telebirr: parsed.paymentMethods?.telebirr ?? true,
        cbe: parsed.paymentMethods?.cbe ?? true,
        arrival: parsed.paymentMethods?.arrival ?? (parsed.paymentMethods?.cash ?? true),
        cash: parsed.paymentMethods?.cash ?? (parsed.paymentMethods?.arrival ?? true),
      },
      cloudStorage: parsed.cloudStorage || {
        provider: "cloudinary",
        cloudName: "dhd620bca",
        uploadPreset: "bisrat_unsigned",
      }
    };
  });
  useEffect(() => {
    localStorage.setItem('bisrat_payment_settings', JSON.stringify(paymentSettings));
  }, [paymentSettings]);

  // Rooms Data State
  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem('bisrat_rooms');
    return saved ? JSON.parse(saved) : initialRooms;
  });
  useEffect(() => {
    localStorage.setItem('bisrat_rooms', JSON.stringify(rooms));
  }, [rooms]);

  // Menu Items State (Live Out-of-Stock sync & versioned migration to full catalog)
  const [menuItems, setMenuItems] = useState(() => {
    const version = localStorage.getItem('bisrat_menu_version');
    const saved = localStorage.getItem('bisrat_menu');
    if (version === '2.3' && saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 100) {
          return parsed;
        }
      } catch (e) {
        console.warn("Failed to parse saved menu, reverting to catalog:", e);
      }
    }
    localStorage.setItem('bisrat_menu_version', '2.3');
    localStorage.setItem('bisrat_menu', JSON.stringify(initialMenuItems));
    return initialMenuItems;
  });
  useEffect(() => {
    localStorage.setItem('bisrat_menu', JSON.stringify(menuItems));
    localStorage.setItem('bisrat_menu_version', '2.3');
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
            setMenuItems(event.data.menuItems);
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
        paymentMethod: "telebirr",
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
      const saved = localStorage.getItem('bisrat_gallery');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed to load gallery from storage:", e);
    }
    return initialGallery;
  });

  useEffect(() => {
    try {
      localStorage.setItem('bisrat_gallery', JSON.stringify(gallery));
    } catch (e) {}
  }, [gallery]);

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
    setReviews([newReview, ...reviews]);
  };

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden min-h-screen flex flex-col bg-[#FDFCF7] text-[#1A1C19] selection:bg-[#C5A059] selection:text-[#1B4D3E] pb-16 sm:pb-20">
      
      {/* Sticky Header with Logo, Trilingual Switcher, Reception Phone, and Book Button */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        onBookClick={() => handleOpenBooking()}
      />

      {/* Main Content Area based on 3-Tab Bar */}
      <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
        
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
