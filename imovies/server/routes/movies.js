import express from 'express';
import { body } from 'express-validator';
import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
} from '../controllers/movieController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.get('/', getMovies);
router.get('/:id', getMovieById);

router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('title').trim().notEmpty().withMessage('Movie title is required'),
    body('description').trim().notEmpty().withMessage('Movie description is required'),
    body('duration').isNumeric().withMessage('Duration must be a number in minutes'),
    body('posterUrl').isURL().withMessage('Please provide a valid poster image URL')
  ],
  validate,
  createMovie
);

router.put('/:id', protect, authorize('admin'), updateMovie);
router.delete('/:id', protect, authorize('admin'), deleteMovie);

export default router;
