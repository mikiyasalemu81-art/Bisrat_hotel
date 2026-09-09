/**
 * Permanent Image Storage & Compression Utility for Bisrat Hotel
 * Uses IndexedDB for multi-megabyte image persistence (bypassing localStorage 5MB quota)
 * Includes HTML5 Canvas compression to optimize uploaded high-res photos.
 */

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
 * Save photo to IndexedDB permanent storage & sync to localStorage fallback
 */
export async function savePhotoToStorage(slotName, fileOrUrl) {
  try {
    // 1. Compress image to lightweight, high-quality Data URL
    const compressedDataUrl = await compressImage(fileOrUrl);

    // 2. Save into IndexedDB
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ slotName, dataUrl: compressedDataUrl, updatedAt: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e.target.error || new Error('IndexedDB save failed'));
    });

    // 3. Fallback sync to localStorage if quota permits
    try {
      const savedLs = localStorage.getItem('bisrat_photos');
      const lsPhotos = savedLs ? JSON.parse(savedLs) : {};
      lsPhotos[slotName] = compressedDataUrl;
      localStorage.setItem('bisrat_photos', JSON.stringify(lsPhotos));
    } catch (e) {
      console.warn('localStorage quota reached, stored reliably in IndexedDB database.');
    }

    return { success: true, dataUrl: compressedDataUrl };
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
