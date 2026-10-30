import Movie from '../models/Movie.js';

// @desc    Get all movies with filters & search
// @route   GET /api/movies
// @access  Public
export const getMovies = async (req, res, next) => {
  try {
    const { search, genre, language, sort, page = 1, limit = 12 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { director: { $regex: search, $options: 'i' } },
        { 'cast.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (genre && genre !== 'All') {
      query.genre = { $in: [new RegExp(genre, 'i')] };
    }

    if (language && language !== 'All') {
      query.language = { $regex: language, $options: 'i' };
    }

    // Sort mapping
    let sortOptions = { rating: -1 };
    if (sort === 'release_desc') sortOptions = { releaseDate: -1 };
    if (sort === 'release_asc') sortOptions = { releaseDate: 1 };
    if (sort === 'title_asc') sortOptions = { title: 1 };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query).sort(sortOptions).skip(skip).limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      movies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
export const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }
    res.status(200).json({ success: true, movie });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new movie
// @route   POST /api/movies
// @access  Private/Admin
export const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, movie, message: 'Movie created successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
export const updateMovie = async (req, res, next) => {
  try {
    let movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, movie, message: 'Movie updated successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
export const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    await Movie.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Movie deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
