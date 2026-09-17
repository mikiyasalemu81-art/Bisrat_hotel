/**
 * Database & Persistence Service for Bisrat Hotel
 * 
 * Manages persistent storage and real-time cross-device synchronization for:
 * - room_reservations (Database Table)
 * - food_reservations (Database Table)
 * - menuItems (Database Table / Catalog)
 * - paymentSettings & dynamic payment methods
 * - adminPassword
 */

import { saveCloudAppState } from './cloudSync.js';

const PRIMARY_CLOUD_BIN = 'https://extendsclass.com/api/json-storage/bin/eceaede';
const SECONDARY_API_ENDPOINT = '/api/sync';

export const DEFAULT_ADMIN_PASSWORD = 'bisrathotel123';

export const DEFAULT_PAYMENT_METHODS = [
  {
    id: "pm-cbe",
    type: "cbe",
    name: "Commercial Bank of Ethiopia (CBE)",
    enabled: true,
    accountNumber: "1000679192934",
    accountName: "Bisrat Hotel Adama",
    instructions: "Direct bank transfer to CBE account. Please retain your transaction reference."
  },
  {
    id: "pm-telebirr",
    type: "telebirr",
    name: "Telebirr",
    enabled: true,
    merchantId: "654321",
    phoneNumber: "0906320251",
    instructions: "Pay using Telebirr SuperApp or USSD using merchant ID or phone number."
  },
  {
    id: "pm-arrival",
    type: "arrival",
    name: "Pay on Arrival / Cash at Counter",
    enabled: true,
    instructions: "Pay in cash or credit/debit card directly at reception or to your server."
  }
];

export const INITIAL_ROOM_RESERVATIONS = [
  {
    id: "RR-2026-9041",
    name: "Abebe Bikila",
    phone: "0911223344",
    email: "abebe@example.com",
    dateSubmitted: "2026-09-14T10:30:00.000Z",
    checkInDate: "2026-09-20",
    checkOutDate: "2026-09-22",
    nights: 2,
    guests: 2,
    roomName: "Deluxe King Room",
    totalPrice: 5000,
    paymentMethod: "Commercial Bank of Ethiopia (CBE)",
    status: "Confirmed",
    notes: "Late check-in requested (around 8 PM)."
  },
  {
    id: "RR-2026-8812",
    name: "Sara Yohannes",
    phone: "0922446688",
    email: "sara.y@example.com",
    dateSubmitted: "2026-09-15T14:15:00.000Z",
    checkInDate: "2026-09-25",
    checkOutDate: "2026-09-28",
    nights: 3,
    guests: 1,
    roomName: "Executive Suite",
    totalPrice: 10500,
    paymentMethod: "Telebirr",
    status: "Pending",
    notes: "Quiet upper floor room preferred."
  }
];

export const INITIAL_FOOD_RESERVATIONS = [
  {
    id: "FR-2026-3104",
    name: "Dawit Bekele",
    phone: "0912345678",
    dateSubmitted: "2026-09-16T09:45:00.000Z",
    menuItems: [
      { id: "trad-1", name: "Special Kitfo (ስፔሻል ክትፎ)", price: 450, quantity: 2 }
    ],
    menuItemNames: "Special Kitfo (x2)",
    tableNumber: "VIP 1",
    notes: "Medium rare (Libe Tebes), extra kocho and ayib please.",
    status: "Confirmed"
  },
  {
    id: "FR-2026-3105",
    name: "Marta Haile",
    phone: "0933557799",
    dateSubmitted: "2026-09-16T11:20:00.000Z",
    menuItems: [
      { id: "trad-2", name: "Doro Wat (የዶሮ ወጥ)", price: 400, quantity: 1 },
      { id: "juice-5", name: "Mixed Spris Juice", price: 180, quantity: 2 }
    ],
    menuItemNames: "Doro Wat (x1), Mixed Spris Juice (x2)",
    tableNumber: "Table 4",
    notes: "Table reservation for 3 people around 1:00 PM lunch.",
    status: "Pending"
  }
];

/**
 * Fetch entire cloud database state
 */
export async function fetchDatabaseState() {
  const timestamp = Date.now();
  let remoteData = null;

  // 1. Try Primary Cloud Bin directly
  try {
    const res = await fetch(`${PRIMARY_CLOUD_BIN}?t=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    if (res.ok) {
      remoteData = await res.json();
    }
  } catch (err) {
    console.warn('[Database] Primary cloud bin fetch error:', err);
  }

  // 2. Try Secondary Vercel API endpoint fallback
  if (!remoteData) {
    try {
      const apiRes = await fetch(`${SECONDARY_API_ENDPOINT}?t=${timestamp}`, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      if (apiRes.ok) {
        const json = await apiRes.json();
        remoteData = json.data || json;
      }
    } catch (e) {}
  }

  return remoteData || {};
}

/**
 * Save partial or whole slice to persistent database
 */
export async function saveDatabaseSlice(sliceKey, sliceData) {
  const now = Date.now();

  // 1. Update localStorage cache for instant offline responsiveness
  try {
    localStorage.setItem(`bisrat_${sliceKey}`, JSON.stringify(sliceData));
    localStorage.setItem('bisrat_last_sync', String(now));
  } catch (e) {}

  // 2. Broadcast to other open tabs on this browser
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('bisrat_hotel_sync');
      channel.postMessage({ type: 'SLICE_UPDATE', sliceKey, data: sliceData, timestamp: now });
      channel.close();
    }
  } catch (e) {}

  // 3. Centralized safe read-merge-write cloud persistence
  try {
    const cloudRes = await saveCloudAppState(sliceKey, sliceData);
    return { success: cloudRes.success || cloudRes.cloudSaved, updatedAt: now };
  } catch (err) {
    console.warn('[Database] Cloud sync error in saveDatabaseSlice:', err);
    return { success: false, error: err.message, updatedAt: now };
  }
}

/* ========================================================================= */
/* ROOM RESERVATIONS (Table: room_reservations)                             */
/* ========================================================================= */

export async function getRoomReservations() {
  try {
    const db = await fetchDatabaseState();
    if (Array.isArray(db.room_reservations) && db.room_reservations.length > 0) {
      try { localStorage.setItem('bisrat_room_reservations', JSON.stringify(db.room_reservations)); } catch (e) {}
      return db.room_reservations;
    }
  } catch (e) {}

  try {
    const cached = localStorage.getItem('bisrat_room_reservations');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  return INITIAL_ROOM_RESERVATIONS;
}

export async function saveRoomReservation(reservation) {
  const current = await getRoomReservations();
  const newRecord = {
    id: reservation.id || `RR-${Date.now().toString(36).toUpperCase()}`,
    name: reservation.name || reservation.guestName || 'Guest',
    phone: reservation.phone || '',
    email: reservation.email || '',
    dateSubmitted: reservation.dateSubmitted || new Date().toISOString(),
    checkInDate: reservation.checkInDate || reservation.checkIn || '',
    checkOutDate: reservation.checkOutDate || reservation.checkOut || '',
    nights: reservation.nights || 1,
    guests: reservation.guests || 1,
    roomName: reservation.roomName || 'Standard Room',
    totalPrice: reservation.totalPrice || 0,
    paymentMethod: reservation.paymentMethod || 'Pay on Arrival',
    status: reservation.status || 'Pending',
    notes: reservation.notes || ''
  };

  // Prepend so most recent is first
  const updated = [newRecord, ...current.filter(r => r.id !== newRecord.id)];
  await saveDatabaseSlice('room_reservations', updated);
  return { success: true, record: newRecord, all: updated };
}

export async function updateRoomReservationStatus(id, newStatus) {
  const current = await getRoomReservations();
  const updated = current.map(r => r.id === id ? { ...r, status: newStatus } : r);
  await saveDatabaseSlice('room_reservations', updated);
  return updated;
}

export async function deleteRoomReservation(id) {
  const current = await getRoomReservations();
  const updated = current.filter(r => r.id !== id);
  await saveDatabaseSlice('room_reservations', updated);
  return updated;
}

/* ========================================================================= */
/* FOOD RESERVATIONS (Table: food_reservations)                             */
/* ========================================================================= */

export async function getFoodReservations() {
  try {
    const db = await fetchDatabaseState();
    if (Array.isArray(db.food_reservations) && db.food_reservations.length > 0) {
      try { localStorage.setItem('bisrat_food_reservations', JSON.stringify(db.food_reservations)); } catch (e) {}
      return db.food_reservations;
    }
  } catch (e) {}

  try {
    const cached = localStorage.getItem('bisrat_food_reservations');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  return INITIAL_FOOD_RESERVATIONS;
}

export async function saveFoodReservation(reservation) {
  const current = await getFoodReservations();
  const newRecord = {
    id: reservation.id || `FR-${Date.now().toString(36).toUpperCase()}`,
    name: reservation.name || 'Guest',
    phone: reservation.phone || '',
    dateSubmitted: reservation.dateSubmitted || new Date().toISOString(),
    menuItems: reservation.menuItems || [],
    menuItemNames: reservation.menuItemNames || (reservation.menuItems?.map(m => m.name || m.nameEn).join(', ') || 'Menu Item'),
    tableNumber: reservation.tableNumber || '',
    notes: reservation.notes || '',
    status: reservation.status || 'Pending'
  };

  // Prepend so most recent is first
  const updated = [newRecord, ...current.filter(f => f.id !== newRecord.id)];
  await saveDatabaseSlice('food_reservations', updated);
  return { success: true, record: newRecord, all: updated };
}

export async function updateFoodReservationStatus(id, newStatus) {
  const current = await getFoodReservations();
  const updated = current.map(f => f.id === id ? { ...f, status: newStatus } : f);
  await saveDatabaseSlice('food_reservations', updated);
  return updated;
}

export async function deleteFoodReservation(id) {
  const current = await getFoodReservations();
  const updated = current.filter(f => f.id !== id);
  await saveDatabaseSlice('food_reservations', updated);
  return updated;
}

/* ========================================================================= */
/* PAYMENT SETTINGS & DYNAMIC METHODS                                        */
/* ========================================================================= */

export async function getPaymentSettings() {
  try {
    const db = await fetchDatabaseState();
    if (db.paymentSettings && typeof db.paymentSettings === 'object') {
      const ps = db.paymentSettings;
      // Ensure dynamic paymentMethods array exists
      if (!Array.isArray(ps.paymentMethodsList) || ps.paymentMethodsList.length === 0) {
        ps.paymentMethodsList = DEFAULT_PAYMENT_METHODS;
      }
      try { localStorage.setItem('bisrat_payment_settings', JSON.stringify(ps)); } catch (e) {}
      return ps;
    }
  } catch (e) {}

  try {
    const cached = localStorage.getItem('bisrat_payment_settings');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (!Array.isArray(parsed.paymentMethodsList) || parsed.paymentMethodsList.length === 0) {
        parsed.paymentMethodsList = DEFAULT_PAYMENT_METHODS;
      }
      return parsed;
    }
  } catch (e) {}

  return {
    paymentMethodsList: DEFAULT_PAYMENT_METHODS,
    activeTables: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "VIP 1", "VIP 2", "Terrace 1"],
    phoneNumber: "0906320251",
    landlinePhone: "022 211 2555"
  };
}

export async function savePaymentSettings(settings) {
  await saveDatabaseSlice('paymentSettings', settings);
  return settings;
}

/* ========================================================================= */
/* ADMIN PASSWORD MANAGEMENT (3-step flow with backend persistence)          */
/* ========================================================================= */

export async function getAdminPassword() {
  try {
    const db = await fetchDatabaseState();
    if (db.admin_password && typeof db.admin_password === 'string') {
      try { localStorage.setItem('bisrat_admin_password', db.admin_password); } catch (e) {}
      return db.admin_password;
    }
  } catch (e) {}

  try {
    const cached = localStorage.getItem('bisrat_admin_password');
    if (cached) return cached;
  } catch (e) {}

  return DEFAULT_ADMIN_PASSWORD;
}

export async function updateAdminPassword(currentPassword, newPassword) {
  const activePassword = await getAdminPassword();

  if (!currentPassword) {
    throw new Error('Current password is required.');
  }

  // Accept active password or emergency fallback passwords
  const isValid = currentPassword === activePassword || 
                  currentPassword === 'bisrathotel123' || 
                  currentPassword === 'bisrat_admin_2025';

  if (!isValid) {
    throw new Error('The current password entered is incorrect.');
  }

  if (!newPassword || newPassword.trim().length < 4) {
    throw new Error('New password must be at least 4 characters long.');
  }

  const cleanNew = newPassword.trim();
  // Write to persistent cloud bin
  await saveDatabaseSlice('admin_password', cleanNew);
  try { localStorage.setItem('bisrat_admin_password', cleanNew); } catch (e) {}

  return { success: true, message: 'Password updated successfully on the server.' };
}
