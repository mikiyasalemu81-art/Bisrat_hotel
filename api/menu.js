/**
 * Vercel Serverless Function: /api/menu
 * 
 * Provides centralized REST endpoint to read and persist menu data
 * and application state across all devices and visitors.
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
                    process.env.VITE_CLOUDINARY_CLOUD_NAME || 
                    'trkihe9m';
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 
                       process.env.VITE_CLOUDINARY_UPLOAD_PRESET || 
                       'bisrat_unsigned';

  const cloudinaryUrl = https://res.cloudinary.com//raw/upload/bisrat_menu_state.json?t=;

  // GET: Fetch latest state
  if (req.method === 'GET') {
    try {
      const response = await fetch(cloudinaryUrl, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (response.ok) {
        const data = await response.json();
        return res.status(200).json(data);
      }
      return res.status(200).json({ success: true, menuItems: [], updatedAt: Date.now() });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch menu state', details: err.message });
    }
  }

  // POST: Persist updated state
  if (req.method === 'POST') {
    try {
      const statePayload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const stateBlob = new Blob([JSON.stringify(statePayload, null, 2)], { type: 'application/json' });
      
      const formData = new FormData();
      formData.append('file', stateBlob, 'menu_state.json');
      formData.append('upload_preset', uploadPreset);
      formData.append('public_id', 'bisrat_menu_state');

      const clRes = await fetch(https://api.cloudinary.com/v1_1//raw/upload, {
        method: 'POST',
        body: formData
      });

      if (clRes.ok) {
        const result = await clRes.json();
        return res.status(200).json({ success: true, version: result.version, updatedAt: Date.now() });
      } else {
        const errText = await clRes.text();
        return res.status(500).json({ error: 'Cloudinary persistence failed', details: errText });
      }
    } catch (err) {
      return res.status(500).json({ error: 'Failed to save menu state', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
