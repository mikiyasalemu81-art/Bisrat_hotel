/**
 * Vercel Serverless Function: /api/sync
 * 
 * Provides centralized REST endpoint to read and persist menu data, dish availability,
 * guest reviews, photos, rooms, and payment settings across all devices and visitors.
 */

const CLOUD_BIN_URL = 'https://extendsclass.com/api/json-storage/bin/eceaede';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Retrieve latest global state
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${CLOUD_BIN_URL}?t=${Date.now()}`, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json({ success: true, data });
      }

      return res.status(200).json({ success: true, data: {} });
    } catch (err) {
      return res.status(200).json({ 
        success: false, 
        error: 'Failed to fetch cloud state', 
        details: err.message,
        data: {} 
      });
    }
  }

  // POST / PATCH / PUT: Persist updated state to cloud bin with safe read-merge-write
  if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
    try {
      const statePayload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      // 1. Safe Read: fetch existing state
      let existingData = {};
      try {
        const getRes = await fetch(`${CLOUD_BIN_URL}?t=${Date.now()}`, {
          headers: { 'Accept': 'application/json' }
        });
        if (getRes.ok) {
          existingData = await getRes.json();
        }
      } catch (readErr) {
        console.warn('[api/sync] Error fetching existing bin data:', readErr);
      }

      // 2. Safe Merge: overlay incoming slices onto existing data so untouched keys are preserved
      const now = statePayload.updatedAt || Date.now();
      const mergedPayload = {
        ...existingData,
        ...statePayload,
        updatedAt: now
      };

      // 3. Safe Write: persist full merged state via PUT
      const putRes = await fetch(CLOUD_BIN_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(mergedPayload)
      });

      if (putRes.ok) {
        return res.status(200).json({ 
          success: true, 
          message: 'Saved to cloud storage bin successfully',
          updatedAt: now,
          data: mergedPayload
        });
      } else {
        const errText = await putRes.text().catch(() => '');
        return res.status(500).json({ 
          error: 'Cloud storage persistence failed', 
          status: putRes.status,
          details: errText 
        });
      }
    } catch (err) {
      return res.status(500).json({ 
        error: 'Failed to process sync update', 
        details: err.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
