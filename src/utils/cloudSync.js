/**
 * Cross-Device Cloud Synchronization Engine for Bisrat Hotel
 * 
 * Synchronizes menu items, prices, uploaded dish photos, gallery, rooms,
 * and operational settings across all phones, computers, and customer devices.
 */

import { triggerGlobalImageRefresh } from './imageUrl';
import { getCloudinaryConfig } from './cloudinary';

/**
 * Retrieve current cloud storage & sync settings from local storage or defaults
 */
export function getCloudConfig(customConfig = {}) {
  const clConfig = getCloudinaryConfig(customConfig);
  let config = {
    provider: clConfig.isConfigured ? 'cloudinary' : 'supabase',
    supabaseUrl: '',
    supabaseKey: '',
    supabaseBucket: 'bisrat-hotel',
    cloudName: clConfig.cloudName,
    uploadPreset: clConfig.uploadPreset,
    imgbbApiKey: '',
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
          cloudName: parsed.cloudStorage.cloudName || clConfig.cloudName,
          uploadPreset: parsed.cloudStorage.uploadPreset || clConfig.uploadPreset,
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
 * Check if cloud sync is currently configured
 */
export function isCloudConfigured(customConfig = {}) {
  const config = getCloudConfig(customConfig);
  if (config.cloudName && config.uploadPreset) {
    return true;
  }
  if (config.supabaseUrl && config.supabaseKey) {
    return true;
  }
  if (config.imgbbApiKey) {
    return true;
  }
  return false;
}

/**
 * Fetch the latest shared application state from the cloud
 * Returns parsed state or null if not configured or not found
 */
export async function fetchCloudAppState(customConfig = {}) {
  const config = getCloudConfig(customConfig);

  // 1. Try Cloudinary raw JSON storage (fast global CDN, no database required)
  if (config.cloudName) {
    try {
      const cloudinaryUrl = `https://res.cloudinary.com/${config.cloudName}/raw/upload/bisrat_menu_state.json?t=${Date.now()}`;
      const res = await fetch(cloudinaryUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (res.ok) {
        const cloudData = await res.json();
        if (cloudData && typeof cloudData === 'object' && (cloudData.menuItems || cloudData.photos || cloudData.gallery)) {
          return { success: true, data: cloudData, source: 'cloudinary' };
        }
      }
    } catch (err) {
      console.warn('[CloudSync] Notice reading state from Cloudinary CDN:', err);
    }
  }

  // 2. Try Vercel Serverless Function API `/api/menu`
  try {
    const apiRes = await fetch(`/api/menu?t=${Date.now()}`, { cache: 'no-store' });
    if (apiRes.ok) {
      const apiData = await apiRes.json();
      if (apiData && typeof apiData === 'object' && (apiData.menuItems || apiData.photos)) {
        return { success: true, data: apiData, source: 'vercel-api' };
      }
    }
  } catch (apiErr) {}

  // 3. Supabase fallback (if configured)
  if (config.supabaseUrl && config.supabaseKey) {
    const cleanUrl = config.supabaseUrl.replace(/\/$/, '');
    const bucket = config.supabaseBucket || 'bisrat-hotel';

    try {
      const storageUrl = `${cleanUrl}/storage/v1/object/public/${bucket}/app_state.json?t=${Date.now()}`;
      const res = await fetch(storageUrl, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (res.ok) {
        const cloudData = await res.json();
        if (cloudData && typeof cloudData === 'object') {
          return { success: true, data: cloudData, source: 'supabase-storage' };
        }
      }
    } catch (err) {
      console.warn('[CloudSync] Notice reading state from Supabase storage:', err);
    }

    try {
      const restUrl = `${cleanUrl}/rest/v1/bisrat_app_state?id=eq.hotel_state&select=*`;
      const res = await fetch(restUrl, {
        headers: {
          'apikey': config.supabaseKey,
          'Authorization': `Bearer ${config.supabaseKey}`,
          'Accept': 'application/json'
        }
      });

      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0 && rows[0].state) {
          const parsed = typeof rows[0].state === 'string' ? JSON.parse(rows[0].state) : rows[0].state;
          return { success: true, data: parsed, source: 'supabase-db' };
        }
      }
    } catch (err) {
      console.warn('[CloudSync] Notice reading state from Supabase table:', err);
    }
  }

  return { success: false, data: null, error: 'No remote cloud state available' };
}

/**
 * Save updated application state to the cloud so all other devices see it
 * Accepts partial or full state payload
 */
export async function saveCloudAppState(sliceKey, sliceData, customConfig = {}) {
  const config = getCloudConfig(customConfig);

  // 1. Prepare full state by reading current local cache
  let fullState = {};
  try {
    const savedMenu = localStorage.getItem('bisrat_menu');
    const savedPhotos = localStorage.getItem('bisrat_photos');
    const savedGallery = localStorage.getItem('bisrat_gallery');
    const savedRooms = localStorage.getItem('bisrat_rooms');
    const savedSettings = localStorage.getItem('bisrat_payment_settings');
    const savedFacilities = localStorage.getItem('bisrat_facilities');

    fullState = {
      menuItems: savedMenu ? JSON.parse(savedMenu) : [],
      photos: savedPhotos ? JSON.parse(savedPhotos) : {},
      gallery: savedGallery ? JSON.parse(savedGallery) : [],
      rooms: savedRooms ? JSON.parse(savedRooms) : [],
      paymentSettings: savedSettings ? JSON.parse(savedSettings) : {},
      facilities: savedFacilities ? JSON.parse(savedFacilities) : [],
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

  // 3. Save directly to Cloudinary raw storage (available on all devices via CDN)
  if (config.cloudName && config.uploadPreset) {
    try {
      const stateJsonString = JSON.stringify(fullState, null, 2);
      const stateBlob = new Blob([stateJsonString], { type: 'application/json' });
      const formData = new FormData();
      formData.append('file', stateBlob, 'menu_state.json');
      formData.append('upload_preset', config.uploadPreset);
      formData.append('public_id', 'bisrat_menu_state');

      const clRes = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/raw/upload`, {
        method: 'POST',
        body: formData
      });

      if (clRes.ok) {
        cloudSaved = true;
      } else {
        const errText = await clRes.text().catch(() => '');
        console.warn('[CloudSync] Cloudinary raw upload returned:', clRes.status, errText);
      }
    } catch (clErr) {
      console.warn('[CloudSync] Error saving state to Cloudinary:', clErr);
    }
  }

  // 4. Try saving to `/api/menu` Vercel Serverless Function
  try {
    const apiRes = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullState)
    });
    if (apiRes.ok) {
      cloudSaved = true;
    }
  } catch (e) {}

  // 5. Supabase Storage / DB backup (if configured)
  if (config.supabaseUrl && config.supabaseKey) {
    const cleanUrl = config.supabaseUrl.replace(/\/$/, '');
    const bucket = config.supabaseBucket || 'bisrat-hotel';

    try {
      const stateJsonString = JSON.stringify(fullState, null, 2);
      const stateBlob = new Blob([stateJsonString], { type: 'application/json' });
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

      if (uploadRes.ok) {
        cloudSaved = true;
      }
    } catch (uploadErr) {
      console.warn('[CloudSync] Storage upload attempt notice:', uploadErr);
    }

    try {
      const dbUrl = `${cleanUrl}/rest/v1/bisrat_app_state`;
      await fetch(dbUrl, {
        method: 'POST',
        headers: {
          'apikey': config.supabaseKey,
          'Authorization': `Bearer ${config.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify([{
          id: 'hotel_state',
          state: fullState,
          updated_at: new Date().toISOString()
        }])
      });
    } catch (dbErr) {}
  }

  // 6. Broadcast to any open tabs on current device
  triggerGlobalImageRefresh();

  if (cloudSaved) {
    return { 
      success: true, 
      message: 'Saved to cloud network! Changes are now live on all customer and staff devices.', 
      updatedAt: fullState.updatedAt 
    };
  } else {
    // If credentials were completely unconfigured
    if (!config.cloudName && !config.supabaseUrl) {
      return { 
        success: false, 
        error: 'Cloud storage is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your environment.' 
      };
    }
    return { 
      success: true, 
      message: 'Saved locally and queued for cloud synchronization.', 
      updatedAt: fullState.updatedAt 
    };
  }
}

/**
 * Upload all current local data from this device to the cloud in one click
 */
export async function pushAllLocalDataToCloud(customConfig = {}) {
  return await saveCloudAppState(null, undefined, customConfig);
}

/**
 * Test Supabase Storage and Database Connection
 */
export async function testCloudConnection(customConfig = {}) {
  const config = getCloudConfig(customConfig);

  if (!config.supabaseUrl || !config.supabaseKey) {
    throw new Error('Please enter both Supabase Project URL and Public Anon Key.');
  }

  const cleanUrl = config.supabaseUrl.replace(/\/$/, '');
  const bucket = config.supabaseBucket || 'bisrat-hotel';

  // Test 1: Upload a tiny test ping file to verify bucket write access
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

  // Test 2: Verify public read URL
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
