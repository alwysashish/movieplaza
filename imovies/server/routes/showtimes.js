import express from 'express';
import { body } from 'express-validator';
import {
  getShowtimes,
  getShowtimeById,
  getShowtimeSeats,
  lockSeats,
  unlockSeats,
  createShowtime,
  updateShowtime,
  deleteShowtime
} from '../controllers/showtimeController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', getShowtimes);
router.get('/:id', getShowtimeById);
router.get('/:id/seats', getShowtimeSeats);

router.post('/:id/lock', protect, lockSeats);
router.post('/:id/unlock', protect, unlockSeats);

router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('movieId').notEmpty().withMessage('Movie ID is required'),
    body('theaterId').notEmpty().withMessage('Theater ID is required'),
    body('screenName').notEmpty().withMessage('Screen name is required'),
    body('date').notEmpty().withMessage('Date is required (YYYY-MM-DD)'),
    body('time').notEmpty().withMessage('Time is required (HH:mm)'),
    body('price').isNumeric().withMessage('Price must be a valid number')
  ],
  validate,
  createShowtime
);

router.put('/:id', protect, authorize('admin'), updateShowtime);
router.delete('/:id', protect, authorize('admin'), deleteShowtime);

export default router;
