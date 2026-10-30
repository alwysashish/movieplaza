import Theater from '../models/Theater.js';

export const getTheaters = async (req, res, next) => {
  try {
    const theaters = await Theater.find();
    res.status(200).json({ success: true, theaters });
  } catch (error) {
    next(error);
  }
};

export const getTheaterById = async (req, res, next) => {
  try {
    const theater = await Theater.findById(req.params.id);
    if (!theater) {
      return res.status(404).json({ success: false, message: 'Theater not found.' });
    }
    res.status(200).json({ success: true, theater });
  } catch (error) {
    next(error);
  }
};

export const createTheater = async (req, res, next) => {
  try {
    const theater = await Theater.create(req.body);
    res.status(201).json({ success: true, theater, message: 'Theater added successfully.' });
  } catch (error) {
    next(error);
  }
};

export const updateTheater = async (req, res, next) => {
  try {
    const theater = await Theater.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!theater) {
      return res.status(404).json({ success: false, message: 'Theater not found.' });
    }
    res.status(200).json({ success: true, theater, message: 'Theater updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const deleteTheater = async (req, res, next) => {
  try {
    const theater = await Theater.findByIdAndDelete(req.params.id);
    if (!theater) {
      return res.status(404).json({ success: false, message: 'Theater not found.' });
    }
    res.status(200).json({ success: true, message: 'Theater removed successfully.' });
  } catch (error) {
    next(error);
  }
};
