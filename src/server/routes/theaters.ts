import { Router } from 'express';
import { db } from '../db.js';
import { protect, authorize } from '../auth.js';
import { ITheater } from '../types.js';

const router = Router();

// GET /api/theaters
router.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    theaters: db.theaters
  });
});

// GET /api/theaters/:id
router.get('/:id', (req, res) => {
  const theater = db.theaters.find(t => t._id === req.params.id);
  if (!theater) {
    return res.status(404).json({ success: false, message: 'Theater not found.' });
  }
  return res.status(200).json({ success: true, theater });
});

// POST /api/theaters (admin only)
router.post('/', protect, authorize('admin'), (req, res) => {
  try {
    const { name, city, address, screens } = req.body;
    if (!name || !city || !address) {
      return res.status(400).json({ success: false, message: 'Name, city, and address are required.' });
    }

    const newTheater: ITheater = {
      _id: `th_${Date.now()}`,
      name: name.trim(),
      city: city.trim(),
      address: address.trim(),
      screens: screens && Array.isArray(screens) && screens.length > 0 ? screens : [
        { name: 'Screen 1', rows: 10, seatsPerRow: 12 },
        { name: 'Screen 2', rows: 10, seatsPerRow: 12 }
      ],
      createdAt: new Date().toISOString()
    };

    db.theaters.push(newTheater);
    return res.status(201).json({ success: true, theater: newTheater, message: 'Theater added successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/theaters/:id (admin only)
router.put('/:id', protect, authorize('admin'), (req, res) => {
  try {
    const theater = db.theaters.find(t => t._id === req.params.id);
    if (!theater) {
      return res.status(404).json({ success: false, message: 'Theater not found.' });
    }

    Object.assign(theater, req.body);
    return res.status(200).json({ success: true, theater, message: 'Theater updated successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/theaters/:id (admin only)
router.delete('/:id', protect, authorize('admin'), (req, res) => {
  const index = db.theaters.findIndex(t => t._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Theater not found.' });
  }

  db.theaters.splice(index, 1);
  return res.status(200).json({ success: true, message: 'Theater removed successfully.' });
});

export default router;
