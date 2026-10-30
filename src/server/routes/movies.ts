import { Router } from 'express';
import { db } from '../db.js';
import { protect, authorize } from '../auth.js';
import { IMovie } from '../types.js';

const router = Router();

// GET /api/movies (query: search, genre, language, sort, page, limit)
router.get('/', (req, res) => {
  try {
    let list = [...db.movies];

    const { search, genre, language, sort, page = '1', limit = '12' } = req.query;

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      list = list.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.director.toLowerCase().includes(q) ||
        m.cast.some(c => c.name.toLowerCase().includes(q))
      );
    }

    if (genre && typeof genre === 'string' && genre !== 'All') {
      list = list.filter(m => m.genre.some(g => g.toLowerCase() === genre.toLowerCase()));
    }

    if (language && typeof language === 'string' && language !== 'All') {
      list = list.filter(m => m.language.toLowerCase() === language.toLowerCase());
    }

    // Sorting
    if (sort === 'rating_desc') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'release_desc') {
      list.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
    } else if (sort === 'release_asc') {
      list.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
    } else if (sort === 'title_asc') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Default: active top rating
      list.sort((a, b) => b.rating - a.rating);
    }

    const total = list.length;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 12;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = list.slice(startIndex, startIndex + limitNum);

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      movies: paginated
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/movies/:id
router.get('/:id', (req, res) => {
  const movie = db.movies.find(m => m._id === req.params.id);
  if (!movie) {
    return res.status(404).json({ success: false, message: 'Movie not found.' });
  }
  return res.status(200).json({ success: true, movie });
});

// POST /api/movies (admin only)
router.post('/', protect, authorize('admin'), (req, res) => {
  try {
    const {
      title,
      description,
      genre,
      language,
      duration,
      rating,
      posterUrl,
      backdropUrl,
      trailerUrl,
      cast,
      director,
      releaseDate,
      certificate
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required.' });
    }

    const newMovie: IMovie = {
      _id: `mov_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      genre: Array.isArray(genre) ? genre : (typeof genre === 'string' ? genre.split(',').map(s => s.trim()) : ['Drama']),
      language: language || 'English',
      duration: Number(duration) || 120,
      rating: Number(rating) || 8.0,
      posterUrl: posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      backdropUrl: backdropUrl || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
      trailerUrl: trailerUrl || 'https://www.youtube.com/watch?v=Way9Dexny3w',
      cast: Array.isArray(cast) ? cast : [{ name: 'Lead Actor', role: 'Main' }],
      director: director || 'Director',
      releaseDate: releaseDate || new Date().toISOString().split('T')[0],
      certificate: certificate || 'UA',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    db.movies.unshift(newMovie);
    return res.status(201).json({ success: true, movie: newMovie, message: 'Movie created successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/movies/:id (admin only)
router.put('/:id', protect, authorize('admin'), (req, res) => {
  try {
    const movie = db.movies.find(m => m._id === req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    Object.assign(movie, req.body);
    return res.status(200).json({ success: true, movie, message: 'Movie updated successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/movies/:id (admin only)
router.delete('/:id', protect, authorize('admin'), (req, res) => {
  const index = db.movies.findIndex(m => m._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Movie not found.' });
  }

  db.movies.splice(index, 1);
  return res.status(200).json({ success: true, message: 'Movie deleted successfully.' });
});

export default router;
