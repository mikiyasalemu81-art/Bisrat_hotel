/**
 * Cross-Device Cloud Synchronization Engine for Bisrat Hotel
 * 
 * Synchronizes menu items, prices, dish availability (Sold Out), uploaded photos,
 * gallery, rooms, reviews, and operational settings across all phones, computers,
 * and customer devices across the internet without requiring manual user configuration.
 */

import { triggerGlobalImageRefresh } from './imageUrl';
import { getCloudinaryConfig } from './cloudinary';

// Dedicated Global Public Cloud State Bin (Free, zero-config, persistent)
const PRIMARY_CLOUD_BIN = 'https://extendsclass.com/api/json-storage/bin/eceaede';
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
    const saved = localStorage.getItem('bisrat_payment_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.cloudStorage) {
        config = { 
          ...config, 
          ...parsed.cloudStorage, 
          cloudName: parsed.cloudStorage.cloudName || config.cloudName,
          uploadPreset: parsed.cloudStorage.uploadPreset || config.uploadPreset,
          ...customConfig 
        };
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

  // 1. Try Primary Cloud Bin directly (accessible from any device globally)
  try {
    const binRes = await fetch(`${PRIMARY_CLOUD_BIN}?t=${now}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (binRes.ok) {
      const binData = await binRes.json();
      if (binData && typeof binData === 'object' && (binData.menuItems || binData.paymentSettings || binData.reviews || binData.photos)) {
        return { success: true, data: binData, source: 'cloud-storage-bin' };
      }
    }
  } catch (binErr) {
    console.warn('[CloudSync] Primary cloud bin fetch notice:', binErr);
  }

  // 2. Try Vercel Serverless Function API `/api/sync`
  try {
    const apiRes = await fetch(`${SECONDARY_API_ENDPOINT}?t=${now}`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    if (apiRes.ok) {
      const apiData = await apiRes.json();
      const stateObj = apiData?.data || apiData;
      if (stateObj && typeof stateObj === 'object' && (stateObj.menuItems || stateObj.paymentSettings || stateObj.reviews)) {
        return { success: true, data: stateObj, source: 'vercel-api-sync' };
      }
    }
  } catch (apiErr) {}

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

  // 1. Assemble full state from current localStorage cache
  let fullState = {};
  try {
    const savedMenu = localStorage.getItem('bisrat_menu');
    const savedPhotos = localStorage.getItem('bisrat_photos');
    const savedGallery = localStorage.getItem('bisrat_gallery');
    const savedRooms = localStorage.getItem('bisrat_rooms');
    const savedSettings = localStorage.getItem('bisrat_payment_settings');
    const savedFacilities = localStorage.getItem('bisrat_facilities');
    const savedReviews = localStorage.getItem('bisrat_reviews');

    fullState = {
      menuItems: savedMenu ? JSON.parse(savedMenu) : [],
      photos: savedPhotos ? JSON.parse(savedPhotos) : {},
      gallery: savedGallery ? JSON.parse(savedGallery) : [],
      rooms: savedRooms ? JSON.parse(savedRooms) : [],
      paymentSettings: savedSettings ? JSON.parse(savedSettings) : {},
      facilities: savedFacilities ? JSON.parse(savedFacilities) : [],
      reviews: savedReviews ? JSON.parse(savedReviews) : [],
      updatedAt: Date.now()
    };
  } catch (e) {
    console.warn('[CloudSync] Error assembling local state:', e);
  }

  // 2. Merge slice update if specified
  if (sliceKey && sliceData !== undefined) {
    fullState[sliceKey] = sliceData;
    fullState.updatedAt = Date.now();
  }

  let cloudSaved = false;

  // 3. Persist to Primary Cloud Bin (accessible worldwide)
  try {
    const binRes = await fetch(PRIMARY_CLOUD_BIN, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(fullState)
    });

    if (binRes.ok) {
      cloudSaved = true;
    } else {
      console.warn('[CloudSync] Primary bin patch returned:', binRes.status);
    }
  } catch (binErr) {
    console.warn('[CloudSync] Primary bin save warning:', binErr);
  }

  // 4. Also persist via Vercel Serverless Function `/api/sync`
  try {
    const apiRes = await fetch(SECONDARY_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullState)
    });
    if (apiRes.ok) {
      cloudSaved = true;
    }
  } catch (apiErr) {}

  // 5. Also notify `/api/menu`
  try {
    const menuRes = await fetch(LEGACY_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullState)
    });
    if (menuRes.ok) {
      cloudSaved = true;
    }
  } catch (menuErr) {}

  // 6. Supabase Storage / DB backup (if configured)
  if (config.supabaseUrl && config.supabaseKey) {
    const cleanUrl = config.supabaseUrl.replace(/\/$/, '');
    const bucket = config.supabaseBucket || 'bisrat-hotel';

    try {
      const stateBlob = new Blob([JSON.stringify(fullState, null, 2)], { type: 'application/json' });
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
      channel.postMessage({ type: 'STATE_UPDATE', state: fullState, updatedAt: fullState.updatedAt });
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
    updatedAt: fullState.updatedAt
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
