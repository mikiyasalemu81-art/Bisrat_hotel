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

  // POST: Persist updated state to cloud bin
  if (req.method === 'POST') {
    try {
      const statePayload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      const patchRes = await fetch(CLOUD_BIN_URL, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(statePayload)
      });

      if (patchRes.ok) {
        return res.status(200).json({ 
          success: true, 
          message: 'Saved to cloud storage bin successfully',
          updatedAt: Date.now() 
        });
      } else {
        const errText = await patchRes.text().catch(() => '');
        return res.status(500).json({ 
          error: 'Cloud storage persistence failed', 
          status: patchRes.status,
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
