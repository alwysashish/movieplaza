import express from 'express';
import { body } from 'express-validator';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post(
  '/',
  protect,
  [
    body('showtimeId').notEmpty().withMessage('Showtime ID is required'),
    body('seats').isArray({ min: 1, max: 8 }).withMessage('Seats must be an array of 1 to 8 seats')
  ],
  validate,
  createBooking
);

router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.delete('/:id', protect, cancelBooking);

// Admin route
router.get('/', protect, authorize('admin'), getAllBookings);

export default router;
