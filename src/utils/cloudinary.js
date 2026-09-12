/**
 * Cloudinary Direct Unsigned Upload Utility for Bisrat Hotel
 * 
 * Securely uploads images and application state directly to Cloudinary CDN
 * using environment variables:
 * - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_CLOUD_NAME
 * - NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET / VITE_CLOUDINARY_UPLOAD_PRESET
 * 
 * NEVER hardcodes credentials in source code.
 */

import { compressImage } from './imageStorage';

/**
 * Retrieve current Cloudinary cloud name and upload preset from environment variables
 * with fallback to local settings if customized by admin.
 */
export function getCloudinaryConfig(customSettings = {}) {
  let envCloudName = '';
  let envUploadPreset = '';

  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      envCloudName = import.meta.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
                     import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
      envUploadPreset = import.meta.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 
                        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';
    }
  } catch (e) {
    console.warn('[Cloudinary] Error reading environment variables:', e);
  }

  let savedStorage = {};
  try {
    const saved = localStorage.getItem('bisrat_payment_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.cloudStorage) {
        savedStorage = parsed.cloudStorage;
      }
    }
  } catch (e) {}

  const cloudName = (
    customSettings.cloudName || 
    savedStorage.cloudName || 
    envCloudName || 
    ''
  ).trim();

  const uploadPreset = (
    customSettings.uploadPreset || 
    savedStorage.uploadPreset || 
    envUploadPreset || 
    ''
  ).trim();

  return {
    cloudName,
    uploadPreset,
    isConfigured: Boolean(cloudName && uploadPreset),
    uploadUrl: cloudName ? `https://api.cloudinary.com/v1_1/${cloudName}/image/upload` : '',
    rawUploadUrl: cloudName ? `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload` : ''
  };
}

/**
 * Upload an image file or blob directly to Cloudinary unsigned upload endpoint.
 * Returns the permanent HTTPS secure_url, public_id, and version stamp.
 * 
 * @param {File|Blob|string} fileOrBlob - The image file, binary blob, or base64 data URL
 * @param {Object} [options] - Additional options (folder, publicId, customConfig)
 * @returns {Promise<{secureUrl: string, publicId: string, version: number, raw: Object}>}
 */
export async function uploadToCloudinary(fileOrBlob, options = {}) {
  const config = getCloudinaryConfig(options.customConfig);

  if (!config.isConfigured) {
    throw new Error(
      'Cloudinary is not configured. Please ensure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET are set in your environment variables.'
    );
  }

  // 1. Prepare binary blob
  let binaryBlob = fileOrBlob;
  if (typeof fileOrBlob === 'string') {
    // If it's already an external HTTPS URL from Cloudinary, return it directly
    if (fileOrBlob.startsWith('http://') || fileOrBlob.startsWith('https://')) {
      return {
        secureUrl: fileOrBlob,
        publicId: '',
        version: Date.now(),
        raw: { secure_url: fileOrBlob }
      };
    }
    // If Data URL, convert to Blob
    if (fileOrBlob.startsWith('data:')) {
      const res = await fetch(fileOrBlob);
      binaryBlob = await res.blob();
    }
  } else if (fileOrBlob instanceof File && fileOrBlob.type.startsWith('image/')) {
    // Optional canvas compression to keep upload fast and under quota
    if (!options.skipCompression) {
      try {
        const compressedDataUrl = await compressImage(fileOrBlob, 1600, 0.85);
        const res = await fetch(compressedDataUrl);
        binaryBlob = await res.blob();
      } catch (compErr) {
        console.warn('[Cloudinary] Pre-upload compression warning, uploading original:', compErr);
        binaryBlob = fileOrBlob;
      }
    }
  }

  // 2. Build FormData payload
  const formData = new FormData();
  formData.append('file', binaryBlob);
  formData.append('upload_preset', config.uploadPreset);

  if (options.publicId) {
    formData.append('public_id', options.publicId);
  }
  if (options.folder) {
    formData.append('folder', options.folder);
  }

  // 3. Dispatch POST request directly to Cloudinary unsigned upload endpoint
  const endpoint = options.resourceType === 'raw' ? config.rawUploadUrl : config.uploadUrl;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.secure_url) {
    const errorMsg = data?.error?.message || response.statusText || 'Unknown upload error';
    throw new Error(`Cloudinary upload failed: ${errorMsg}`);
  }

  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
    version: data.version || Date.now(),
    raw: data
  };
}
