/**
 * Vercel Serverless Function: /api/reservations
 * 
 * Provides dedicated endpoints to query and submit:
 * - room_reservations
 * - food_reservations
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

  // Helper to get latest db
  const getDb = async () => {
    const response = await fetch(`${CLOUD_BIN_URL}?t=${Date.now()}`, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    if (response.ok) {
      return await response.json();
    }
    return {};
  };

  // Helper to patch db
  const patchDb = async (patch) => {
    return await fetch(CLOUD_BIN_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ ...patch, updatedAt: Date.now() })
    });
  };

  // GET: Fetch reservations
  if (req.method === 'GET') {
    try {
      const type = req.query.type; // 'room' | 'food' | undefined (both)
      const db = await getDb();

      if (type === 'room') {
        return res.status(200).json({ success: true, room_reservations: db.room_reservations || [] });
      }
      if (type === 'food') {
        return res.status(200).json({ success: true, food_reservations: db.food_reservations || [] });
      }

      return res.status(200).json({
        success: true,
        room_reservations: db.room_reservations || [],
        food_reservations: db.food_reservations || []
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST: Add new reservation
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const type = body.type || req.query.type; // 'room' | 'food'
      const db = await getDb();

      if (type === 'room' || body.roomName || body.checkInDate) {
        const currentRooms = Array.isArray(db.room_reservations) ? db.room_reservations : [];
        const newRecord = {
          id: body.id || `RR-${Date.now().toString(36).toUpperCase()}`,
          name: body.name || body.guestName || 'Guest',
          phone: body.phone || '',
          email: body.email || '',
          dateSubmitted: body.dateSubmitted || new Date().toISOString(),
          checkInDate: body.checkInDate || body.checkIn || '',
          checkOutDate: body.checkOutDate || body.checkOut || '',
          nights: body.nights || 1,
          guests: body.guests || 1,
          roomName: body.roomName || 'Standard Room',
          totalPrice: body.totalPrice || 0,
          paymentMethod: body.paymentMethod || 'Pay on Arrival',
          status: body.status || 'Pending',
          notes: body.notes || ''
        };
        const updated = [newRecord, ...currentRooms.filter(r => r.id !== newRecord.id)];
        await patchDb({ room_reservations: updated });
        return res.status(200).json({ success: true, record: newRecord, all: updated });
      }

      if (type === 'food' || body.menuItems || body.menuItemNames) {
        const currentFoods = Array.isArray(db.food_reservations) ? db.food_reservations : [];
        const newRecord = {
          id: body.id || `FR-${Date.now().toString(36).toUpperCase()}`,
          name: body.name || 'Guest',
          phone: body.phone || '',
          dateSubmitted: body.dateSubmitted || new Date().toISOString(),
          menuItems: body.menuItems || [],
          menuItemNames: body.menuItemNames || (body.menuItems?.map(m => m.name || m.nameEn).join(', ') || 'Menu Item'),
          tableNumber: body.tableNumber || '',
          notes: body.notes || '',
          status: body.status || 'Pending'
        };
        const updated = [newRecord, ...currentFoods.filter(f => f.id !== newRecord.id)];
        await patchDb({ food_reservations: updated });
        return res.status(200).json({ success: true, record: newRecord, all: updated });
      }

      return res.status(400).json({ error: 'Missing reservation type or details.' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
