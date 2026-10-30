import express from 'express';
import { body } from 'express-validator';
import {
  getTheaters,
  getTheaterById,
  createTheater,
  updateTheater,
  deleteTheater
} from '../controllers/theaterController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', getTheaters);
router.get('/:id', getTheaterById);

router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Theater name is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('address').trim().notEmpty().withMessage('Address is required')
  ],
  validate,
  createTheater
);

router.put('/:id', protect, authorize('admin'), updateTheater);
router.delete('/:id', protect, authorize('admin'), deleteTheater);

export default router;
