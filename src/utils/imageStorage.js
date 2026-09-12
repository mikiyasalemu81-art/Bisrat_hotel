/**
 * Permanent Image Storage & Compression Utility for Bisrat Hotel
 * Uses IndexedDB for multi-megabyte image persistence (bypassing localStorage 5MB quota)
 * Includes HTML5 Canvas compression to optimize uploaded high-res photos.
 */

import { 
  getOptimizedImageUrl, 
  triggerGlobalImageRefresh, 
  getImageSyncTimestamp, 
  setImageSyncTimestamp 
} from './imageUrl';
import { saveCloudAppState } from './cloudSync';
import { uploadToCloudinary, getCloudinaryConfig } from './cloudinary';

export { 
  getOptimizedImageUrl, 
  triggerGlobalImageRefresh, 
  getImageSyncTimestamp, 
  setImageSyncTimestamp 
};

const DB_NAME = 'BisratHotelDB';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

// Open / Initialize IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'slotName' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error || new Error('Failed to open IndexedDB database.'));
    };
  });
}

/**
 * Compresses an image File or Data URL using HTML5 Canvas
 * Resizes max dimension to 1600px and sets JPEG quality to 0.85
 */
export function compressImage(fileOrUrl, maxDimension = 1600, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Set crossOrigin if loading an external URL
    if (typeof fileOrUrl === 'string' && fileOrUrl.startsWith('http')) {
      img.crossOrigin = 'Anonymous';
    }

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl));
        return;
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      if (typeof fileOrUrl === 'string') {
        reject(new Error('Failed to load image from URL. Ensure the link points directly to a valid image file.'));
      } else {
        reject(new Error('Invalid image file format. Please choose a valid JPEG, PNG, or WEBP photo.'));
      }
    };

    if (typeof fileOrUrl === 'string') {
      img.src = fileOrUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Error reading image file from disk.'));
      reader.readAsDataURL(fileOrUrl);
    }
  });
}

/**
 * Upload binary file/blob to Cloud Storage (Supabase Storage, Cloudinary, or ImgBB)
 * Returns the permanent, publicly accessible HTTPS URL so all users can see the image on any device.
 */
export async function uploadToCloudStorage(fileOrBlob, customConfig = {}) {
  // If already an external HTTPS URL, return directly
  if (typeof fileOrBlob === 'string' && (fileOrBlob.startsWith('http://') || fileOrBlob.startsWith('https://'))) {
    return { url: fileOrBlob, secureUrl: fileOrBlob, provider: 'direct-url' };
  }

  // 1. Prioritize Cloudinary using environment variables or settings
  const clConfig = getCloudinaryConfig(customConfig);
  if (clConfig.isConfigured) {
    try {
      const result = await uploadToCloudinary(fileOrBlob, { customConfig });
      if (result?.secureUrl) {
        const versionStamp = result.version || Date.now();
        const optimizedUrl = getOptimizedImageUrl(result.secureUrl, versionStamp);
        return {
          url: optimizedUrl,
          secureUrl: result.secureUrl,
          version: versionStamp,
          provider: 'cloudinary'
        };
      }
    } catch (clErr) {
      console.warn('[ImageStorage] Cloudinary direct upload failed, attempting fallbacks:', clErr);
      // If no other provider is configured, rethrow the Cloudinary error
      if (!customConfig.supabaseUrl && !customConfig.imgbbApiKey) {
        throw clErr;
      }
    }
  }

  // 2. Fallback to Supabase or ImgBB if configured in paymentSettings
  let cloudConfig = {
    provider: 'supabase',
    supabaseUrl: '',
    supabaseKey: '',
    supabaseBucket: 'bisrat-hotel',
    cloudName: clConfig.cloudName,
    uploadPreset: clConfig.uploadPreset,
    imgbbApiKey: '',
    ...customConfig
  };

  try {
    const saved = localStorage.getItem('bisrat_payment_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.cloudStorage) {
        cloudConfig = { ...cloudConfig, ...parsed.cloudStorage, ...customConfig };
      }
    }
  } catch (e) {}

  let binaryBlob = fileOrBlob;
  if (typeof fileOrBlob === 'string' && fileOrBlob.startsWith('data:image')) {
    const res = await fetch(fileOrBlob);
    binaryBlob = await res.blob();
  }

  // Supabase Storage Option
  if (cloudConfig.supabaseUrl && cloudConfig.supabaseKey) {
    const cleanUrl = cloudConfig.supabaseUrl.replace(/\/$/, '');
    const bucket = cloudConfig.supabaseBucket || 'bisrat-hotel';
    const extension = binaryBlob.type === 'image/png' ? 'png' : (binaryBlob.type === 'image/webp' ? 'webp' : 'jpg');
    const fileName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
    const uploadUrl = `${cleanUrl}/storage/v1/object/${bucket}/${fileName}`;

    try {
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cloudConfig.supabaseKey}`,
          'apikey': cloudConfig.supabaseKey,
          'Content-Type': binaryBlob.type || 'image/jpeg',
          'x-upsert': 'true',
        },
        body: binaryBlob,
      });

      if (res.ok) {
        const versionStamp = Date.now();
        const publicUrl = getOptimizedImageUrl(`${cleanUrl}/storage/v1/object/public/${bucket}/${fileName}`, versionStamp);
        return { url: publicUrl, secureUrl: publicUrl, version: versionStamp, provider: 'supabase' };
      }
    } catch (sbErr) {
      console.warn('Supabase upload fallback error:', sbErr);
    }
  }

  // ImgBB Option
  if (cloudConfig.imgbbApiKey) {
    try {
      const bbFormData = new FormData();
      bbFormData.append('image', binaryBlob);
      const bbRes = await fetch(`https://api.imgbb.com/1/upload?key=${cloudConfig.imgbbApiKey}`, {
        method: 'POST',
        body: bbFormData,
      });

      if (bbRes.ok) {
        const bbData = await bbRes.json();
        if (bbData?.data?.url) {
          const versionStamp = Date.now();
          const bbUrl = getOptimizedImageUrl(bbData.data.url, versionStamp);
          return { url: bbUrl, secureUrl: bbData.data.url, version: versionStamp, provider: 'imgbb' };
        }
      }
    } catch (bbErr) {}
  }

  throw new Error('Cloud storage is not configured yet. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to enable live image synchronization.');
}

/**
 * Save photo with Cloud Storage upload:
 * Uploads the binary file to cloud storage bucket, retrieves permanent public HTTPS URL,
 * and caches locally in IndexedDB & localStorage.
 */
export async function savePhotoToStorage(slotName, fileOrUrl) {
  try {
    let publicUrl = null;
    let isCloud = false;

    // If already an external HTTPS URL, use it directly
    if (typeof fileOrUrl === 'string' && (fileOrUrl.startsWith('http://') || fileOrUrl.startsWith('https://'))) {
      publicUrl = fileOrUrl;
      isCloud = true;
    } else {
      // 1. First compress the image for fast network transmission & high quality
      const compressedDataUrl = await compressImage(fileOrUrl, 1600, 0.85);

      // 2. Upload binary to real Cloud Storage bucket
      try {
        const cloudResult = await uploadToCloudStorage(compressedDataUrl);
        if (cloudResult && cloudResult.url) {
          publicUrl = cloudResult.url;
          isCloud = true;
        }
      } catch (cloudErr) {
        console.warn('Cloud storage sync warning, saving locally as fallback:', cloudErr);
        publicUrl = compressedDataUrl;
      }
    }

    // 3. Save permanent URL into IndexedDB
    try {
      const db = await openDB();
      await new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ slotName, dataUrl: publicUrl, isCloud, updatedAt: Date.now() });

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error || new Error('IndexedDB save failed'));
      });
    } catch (idbErr) {
      console.warn('IndexedDB write warning:', idbErr);
    }

    // 4. Cache into localStorage
    try {
      const savedLs = localStorage.getItem('bisrat_photos');
      const lsPhotos = savedLs ? JSON.parse(savedLs) : {};
      lsPhotos[slotName] = publicUrl;
      localStorage.setItem('bisrat_photos', JSON.stringify(lsPhotos));

      // Sync photo mapping to cloud network
      if (isCloud) {
        saveCloudAppState('photos', lsPhotos).catch(() => {});
      }
    } catch (lsErr) {
      console.warn('localStorage quota warning:', lsErr);
    }

    // 5. Trigger global cache refresh across all components
    triggerGlobalImageRefresh();

    return { 
      success: true, 
      url: publicUrl, 
      dataUrl: publicUrl, 
      isCloud 
    };
  } catch (error) {
    console.error(`[ImageStorage] Error saving photo for ${slotName}:`, error);
    throw error;
  }
}

/**
 * Load all saved photo slots from IndexedDB permanent storage
 */
export async function loadAllPhotosFromStorage() {
  const result = {};

  // First read from localStorage as quick initial cache
  try {
    const savedLs = localStorage.getItem('bisrat_photos');
    if (savedLs) {
      Object.assign(result, JSON.parse(savedLs));
    }
  } catch (e) {
    console.warn('Error reading photos from localStorage:', e);
  }

  // Merge from IndexedDB (authoritative permanent database)
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const records = request.result || [];
        records.forEach(rec => {
          if (rec.slotName && rec.dataUrl) {
            result[rec.slotName] = rec.dataUrl;
          }
        });
        resolve();
      };
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (e) {
    console.warn('Error loading photos from IndexedDB:', e);
  }

  return result;
}

/**
 * Remove photo slot from IndexedDB and localStorage
 */
export async function deletePhotoFromStorage(slotName) {
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(slotName);
      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e.target.error);
    });

    try {
      const savedLs = localStorage.getItem('bisrat_photos');
      if (savedLs) {
        const lsPhotos = JSON.parse(savedLs);
        delete lsPhotos[slotName];
        localStorage.setItem('bisrat_photos', JSON.stringify(lsPhotos));
      }
    } catch (e) {
      console.warn('Error deleting photo from localStorage:', e);
    }

    return true;
  } catch (e) {
    console.error(`[ImageStorage] Error deleting photo for ${slotName}:`, e);
    throw e;
  }
}
