/**
 * Global Image Optimization & Cache-Busting Utility for Bisrat Hotel
 * 
 * Solves aggressive CDN (Cloudinary / Supabase / ImgBB) and browser caching.
 * Ensures updated images reflect immediately across devices and tabs without
 * requiring manual hard refresh or cache clears.
 */

// In-memory sync timestamp initialized from localStorage or current time
let currentSyncTimestamp = (() => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('bisrat_img_sync_ts') || `${Date.now()}`;
    }
  } catch (e) {}
  return `${Date.now()}`;
})();

/**
 * Trigger a global image refresh stamp across all components, browser tabs, and devices.
 * Call this whenever an admin uploads or updates a photo in Menu, Gallery, or Settings.
 */
export function triggerGlobalImageRefresh() {
  const newTimestamp = `${Date.now()}`;
  currentSyncTimestamp = newTimestamp;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('bisrat_img_sync_ts', newTimestamp);
    }
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('bisrat_hotel_sync');
      channel.postMessage({ type: 'IMG_SYNC', timestamp: newTimestamp });
      channel.close();
    }
  } catch (e) {
    console.warn('Image refresh broadcast notice:', e);
  }
  return newTimestamp;
}

/**
 * Returns the current global image sync timestamp
 */
export function getImageSyncTimestamp() {
  return currentSyncTimestamp;
}

/**
 * Update the sync timestamp when receiving a sync event from another tab or device
 */
export function setImageSyncTimestamp(ts) {
  if (ts) {
    currentSyncTimestamp = `${ts}`;
  }
}

/**
 * Transforms any image URL to append an active cache-busting query parameter or Cloudinary version stamp.
 * 
 * @param {string} url - Original image URL, relative path, or Cloudinary URL
 * @param {string|number|object} [versionOrItem] - Explicit timestamp, version number, or object with updatedAt/createdAt
 * @returns {string} - Clean, cache-busted image URL ready for <img> src
 */
export function getOptimizedImageUrl(url, versionOrItem = null) {
  if (!url || typeof url !== 'string') return url || '';

  const trimmed = url.trim();
  if (!trimmed) return '';

  // Never touch inline Base64 data URIs or local Blob URLs (query parameters corrupt them)
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Determine the best version stamp
  let version = null;
  if (versionOrItem) {
    if (typeof versionOrItem === 'object') {
      version = versionOrItem.updatedAt || versionOrItem.createdAt || versionOrItem.imageVersion || null;
    } else {
      version = `${versionOrItem}`;
    }
  }

  // If no explicit item version, extract existing Cloudinary version from path if available
  if (!version) {
    const cloudinaryMatch = trimmed.match(/\/upload\/v(\d+)\//);
    if (cloudinaryMatch && cloudinaryMatch[1]) {
      version = cloudinaryMatch[1];
    }
  }

  // Fallback to the global image sync timestamp
  if (!version) {
    version = currentSyncTimestamp;
  }

  try {
    const isAbsolute = trimmed.startsWith('http://') || trimmed.startsWith('https://');
    const dummyBase = 'https://bisrathotel.local';
    const parsed = new URL(trimmed, isAbsolute ? undefined : dummyBase);

    // Set or update the cache-busting query parameter 'v'
    parsed.searchParams.set('v', `${version}`);

    if (isAbsolute) {
      return parsed.toString();
    } else {
      return parsed.pathname + parsed.search + parsed.hash;
    }
  } catch (err) {
    // Fallback simple string concatenation if URL parsing fails
    const separator = trimmed.includes('?') ? '&' : '?';
    return `${trimmed}${separator}v=${version}`;
  }
}
