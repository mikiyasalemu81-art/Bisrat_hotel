/**
 * Cross-Device Cloud Synchronization Engine for Bisrat Hotel
 * 
 * Synchronizes menu items, prices, dish availability (Sold Out), uploaded photos,
 * gallery, rooms, reviews, and operational settings across all phones, computers,
 * and customer devices across the internet without requiring manual user configuration.
 */

import { triggerGlobalImageRefresh } from './imageUrl.js';
import { getCloudinaryConfig } from './cloudinary.js';

// Dedicated Global Public Cloud State Bin
const DIRECT_BIN_URL = 'https://extendsclass.com/api/json-storage/bin/eceaede';
const PRIMARY_CLOUD_BIN = '/api/sync';
const SECONDARY_API_ENDPOINT = '/api/sync';
const LEGACY_API_ENDPOINT = '/api/menu';

/**
 * Retrieve current cloud storage & sync settings from local storage or defaults
 */
export function getCloudConfig(customConfig = {}) {
  const clConfig = getCloudinaryConfig(customConfig);
  let config = {
    provider: 'cloudinary',
    cloudName: clConfig.cloudName || 'trkihe9m',
    uploadPreset: clConfig.uploadPreset || 'bisrat_unsigned',
    primaryBinUrl: PRIMARY_CLOUD_BIN,
    supabaseUrl: '',
    supabaseKey: '',
    supabaseBucket: 'bisrat-hotel',
    imgbbApiKey: '8cf91a329d638beae098d6f966144e59',
    autoSync: true,
    ...customConfig
  };

  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('bisrat_payment_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.cloudStorage) {
          config = { 
            ...config, 
            ...parsed.cloudStorage,
            cloudName: parsed.cloudStorage.cloudName || config.cloudName,
            uploadPreset: parsed.cloudStorage.uploadPreset || config.uploadPreset
          };
        }
      }
    }
  } catch (e) {
    console.warn('[CloudSync] Error reading saved cloud config:', e);
  }

  return config;
}

/**
 * Check if cloud sync is currently configured (always true with built-in cloud persistence)
 */
export function isCloudConfigured(customConfig = {}) {
  return true;
}

/**
 * Fetch the latest shared application state from the cloud
 * Returns parsed state or null if not found
 */
export async function fetchCloudAppState(customConfig = {}) {
  const config = getCloudConfig(customConfig);
  const now = Date.now();

  // 1. Try Vercel Serverless / Local Vite proxy `/api/sync`
  try {
    const apiRes = await fetch(`${PRIMARY_CLOUD_BIN}?t=${now}`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    if (apiRes.ok) {
      const apiData = await apiRes.json();
      const stateObj = apiData?.data || apiData;
      if (stateObj && typeof stateObj === 'object' && (stateObj.menuItems || stateObj.paymentSettings || stateObj.reviews || stateObj.food_reservations)) {
        return { success: true, data: stateObj, source: 'api-sync' };
      }
    }
  } catch (apiErr) {}

  // 2. Direct fetch from ExtendsClass bin (accessible from any device globally)
  try {
    const binRes = await fetch(`${DIRECT_BIN_URL}?t=${now}`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });

    if (binRes.ok) {
      const binData = await binRes.json();
      if (binData && typeof binData === 'object' && (binData.menuItems || binData.paymentSettings || binData.reviews || binData.photos || binData.food_reservations)) {
        return { success: true, data: binData, source: 'cloud-storage-bin' };
      }
    }
  } catch (binErr) {
    console.warn('[CloudSync] Direct cloud bin fetch notice:', binErr);
  }

  // 3. Try Legacy API `/api/menu`
  try {
    const legRes = await fetch(`${LEGACY_API_ENDPOINT}?t=${now}`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    if (legRes.ok) {
      const legData = await legRes.json();
      const stateObj = legData?.data || legData;
      if (stateObj && typeof stateObj === 'object' && (stateObj.menuItems || stateObj.paymentSettings)) {
        return { success: true, data: stateObj, source: 'vercel-api-menu' };
      }
    }
  } catch (legErr) {}

  // 4. Supabase fallback (if custom credentials provided)
  if (config.supabaseUrl && config.supabaseKey) {
    const cleanUrl = config.supabaseUrl.replace(/\/$/, '');
    const bucket = config.supabaseBucket || 'bisrat-hotel';

    try {
      const storageUrl = `${cleanUrl}/storage/v1/object/public/${bucket}/app_state.json?t=${now}`;
      const res = await fetch(storageUrl, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      if (res.ok) {
        const cloudData = await res.json();
        if (cloudData && typeof cloudData === 'object') {
          return { success: true, data: cloudData, source: 'supabase-storage' };
        }
      }
    } catch (err) {}
  }

  return { success: false, data: null, error: 'No remote cloud state available' };
}

/**
 * Save updated application state to the cloud so all other devices see it
 * Accepts partial or full state payload
 */
export async function saveCloudAppState(sliceKey, sliceData, customConfig = {}) {
  const config = getCloudConfig(customConfig);

  // 1. Build targeted patch payload so we never overwrite untouched keys with empty defaults
  let patchPayload = {};

  if (typeof sliceKey === 'string' && sliceData !== undefined) {
    // Isolated slice save (e.g. 'paymentSettings', 'reviews', 'menuItems', 'photos')
    if (sliceKey === 'menuItems') {
      if (!Array.isArray(sliceData) || sliceData.length < 5) {
        console.warn('[CloudSync] Refusing to push empty or incomplete menu catalog to cloud:', sliceData);
        return { success: false, error: 'Cannot overwrite catalog with empty menu' };
      }
    }
    patchPayload[sliceKey] = sliceData;
    patchPayload.updatedAt = Date.now();
  } else if (sliceKey && typeof sliceKey === 'object' && sliceData === undefined) {
    // Multi-key object passed directly
    patchPayload = { ...sliceKey, updatedAt: Date.now() };
    if (patchPayload.menuItems && (!Array.isArray(patchPayload.menuItems) || patchPayload.menuItems.length < 5)) {
      delete patchPayload.menuItems;
    }
  } else {
    // Full sync from localStorage: only include slices that are actually present and non-empty
    try {
      const savedMenu = localStorage.getItem('bisrat_menu');
      const savedPhotos = localStorage.getItem('bisrat_photos');
      const savedGallery = localStorage.getItem('bisrat_gallery');
      const savedRooms = localStorage.getItem('bisrat_rooms');
      const savedSettings = localStorage.getItem('bisrat_payment_settings');
      const savedFacilities = localStorage.getItem('bisrat_facilities');
      const savedReviews = localStorage.getItem('bisrat_reviews');

      if (savedMenu) {
        const parsed = JSON.parse(savedMenu);
        if (Array.isArray(parsed) && parsed.length >= 5) patchPayload.menuItems = parsed;
      }
      if (savedPhotos) {
        const parsed = JSON.parse(savedPhotos);
        if (parsed && Object.keys(parsed).length > 0) patchPayload.photos = parsed;
      }
      if (savedGallery) {
        const parsed = JSON.parse(savedGallery);
        if (Array.isArray(parsed) && parsed.length > 0) patchPayload.gallery = parsed;
      }
      if (savedRooms) {
        const parsed = JSON.parse(savedRooms);
        if (Array.isArray(parsed) && parsed.length > 0) patchPayload.rooms = parsed;
      }
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed && Object.keys(parsed).length > 0) patchPayload.paymentSettings = parsed;
      }
      if (savedFacilities) {
        const parsed = JSON.parse(savedFacilities);
        if (Array.isArray(parsed) && parsed.length > 0) patchPayload.facilities = parsed;
      }
      if (savedReviews) {
        const parsed = JSON.parse(savedReviews);
        if (Array.isArray(parsed) && parsed.length > 0) patchPayload.reviews = parsed;
      }
      patchPayload.updatedAt = Date.now();
    } catch (e) {
      console.warn('[CloudSync] Error assembling local state:', e);
    }
  }

  // Sanitize any transient blob URLs that cannot sync across devices
  if (Array.isArray(patchPayload.menuItems)) {
    patchPayload.menuItems = patchPayload.menuItems.map(item => {
      let cleaned = { ...item };
      if (typeof cleaned.imageUrl === 'string' && cleaned.imageUrl.startsWith('blob:')) {
        cleaned.imageUrl = (cleaned.customImage && !cleaned.customImage.startsWith('blob:')) ? cleaned.customImage : '';
      }
      if (typeof cleaned.customImage === 'string' && cleaned.customImage.startsWith('blob:')) {
        delete cleaned.customImage;
      }
      return cleaned;
    });
  }

  const now = patchPayload.updatedAt || Date.now();
  patchPayload.updatedAt = now;

  // Update local timestamp caches immediately
  try {
    localStorage.setItem('bisrat_last_sync', String(now));
    if (patchPayload.menuItems) localStorage.setItem('bisrat_menu_ts', String(now));
    if (patchPayload.paymentSettings) localStorage.setItem('bisrat_payment_ts', String(now));
  } catch (e) {}

  let cloudSaved = false;

  // 2. Persist to API sync (/api/sync)
  try {
    const apiRes = await fetch(PRIMARY_CLOUD_BIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(patchPayload)
    });

    if (apiRes.ok) {
      cloudSaved = true;
    } else {
      console.warn('[CloudSync] /api/sync returned status:', apiRes.status);
    }
  } catch (binErr) {
    console.warn('[CloudSync] /api/sync save error:', binErr);
  }

  // 3. Fallback: Direct cloud bin with safe read-merge-write PUT if /api/sync didn't succeed
  if (!cloudSaved) {
    try {
      const DIRECT_BIN = 'https://extendsclass.com/api/json-storage/bin/eceaede';
      const readRes = await fetch(`${DIRECT_BIN}?t=${Date.now()}`);
      let currentBin = {};
      if (readRes.ok) currentBin = await readRes.json();
      const mergedDirect = { ...currentBin, ...patchPayload, updatedAt: now };
      const putRes = await fetch(DIRECT_BIN, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mergedDirect)
      });
      if (putRes.ok) {
        cloudSaved = true;
        console.log('[CloudSync] Successfully saved via direct bin fallback');
      }
    } catch (directErr) {
      console.warn('[CloudSync] Direct bin fallback error:', directErr);
    }
  }

  // 5. Supabase Storage / DB backup (if configured)
  if (config.supabaseUrl && config.supabaseKey) {
    const cleanUrl = config.supabaseUrl.replace(/\/$/, '');
    const bucket = config.supabaseBucket || 'bisrat-hotel';

    try {
      const stateBlob = new Blob([JSON.stringify(patchPayload, null, 2)], { type: 'application/json' });
      const uploadUrl = `${cleanUrl}/storage/v1/object/${bucket}/app_state.json`;
      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.supabaseKey}`,
          'apikey': config.supabaseKey,
          'Content-Type': 'application/json',
          'x-upsert': 'true',
        },
        body: stateBlob
      });
      if (uploadRes.ok) cloudSaved = true;
    } catch (e) {}
  }

  // 7. Multi-tab broadcast channel
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('bisrat_hotel_sync');
      channel.postMessage({ type: 'STATE_UPDATE', state: patchPayload, updatedAt: patchPayload.updatedAt });
      channel.close();
    }
  } catch (e) {}

  // 8. Trigger global image cache refresh
  triggerGlobalImageRefresh();

  return {
    success: true,
    cloudSaved,
    message: cloudSaved 
      ? '✓ Saved to cloud! Changes are now live on all phones, PCs, and customer screens across the internet.' 
      : 'Saved locally and pending cloud synchronization.',
    updatedAt: patchPayload.updatedAt
  };
}

/**
 * Upload all current local data from this device to the cloud in one click
 */
export async function pushAllLocalDataToCloud(customConfig = {}) {
  return await saveCloudAppState(null, undefined, customConfig);
}

/**
 * Test Supabase Storage and Database Connection (optional for advanced users)
 */
export async function testCloudConnection(customConfig = {}) {
  const config = getCloudConfig(customConfig);

  // If testing default cloud sync
  if (!config.supabaseUrl) {
    const res = await fetch(`${PRIMARY_CLOUD_BIN}?t=${Date.now()}`);
    if (res.ok) {
      return {
        success: true,
        message: '✓ Cloud Synchronization is active and reachable across all devices.',
        publicUrl: PRIMARY_CLOUD_BIN
      };
    }
  }

  if (!config.supabaseUrl || !config.supabaseKey) {
    throw new Error('Please enter both Supabase Project URL and Public Anon Key.');
  }

  const cleanUrl = config.supabaseUrl.replace(/\/$/, '');
  const bucket = config.supabaseBucket || 'bisrat-hotel';

  const testPayload = JSON.stringify({ ping: 'pong', timestamp: Date.now() });
  const testBlob = new Blob([testPayload], { type: 'application/json' });
  const pingUrl = `${cleanUrl}/storage/v1/object/${bucket}/cloud_test_ping.json`;

  const pingRes = await fetch(pingUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.supabaseKey}`,
      'apikey': config.supabaseKey,
      'Content-Type': 'application/json',
      'x-upsert': 'true',
    },
    body: testBlob
  });

  if (!pingRes.ok) {
    const errBody = await pingRes.text();
    throw new Error(`Bucket write test returned error (${pingRes.status}): ${errBody}. Verify bucket "${bucket}" exists and allows uploads.`);
  }

  const publicTestUrl = `${cleanUrl}/storage/v1/object/public/${bucket}/cloud_test_ping.json`;
  const readRes = await fetch(publicTestUrl);
  if (!readRes.ok) {
    throw new Error(`Bucket "${bucket}" is not set to Public. Please toggle "Public bucket" ON in Supabase Storage settings.`);
  }

  return {
    success: true,
    message: `Connected successfully! Public cloud bucket "${bucket}" is online and verified for image and data sync.`,
    publicUrl: publicTestUrl
  };
}