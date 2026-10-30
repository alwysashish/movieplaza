import Showtime from '../models/Showtime.js';
import Theater from '../models/Theater.js';

export const getShowtimes = async (req, res, next) => {
  try {
    const { movieId, date, city } = req.query;
    const filter = {};

    if (movieId) filter.movieId = movieId;
    if (date) filter.date = date;

    if (city && city !== 'All') {
      const theatersInCity = await Theater.find({ city: new RegExp(city, 'i') }).select('_id');
      const theaterIds = theatersInCity.map((t) => t._id);
      filter.theaterId = { $in: theaterIds };
    }

    const showtimes = await Showtime.find(filter)
      .populate('movieId', 'title certificate duration posterUrl')
      .populate('theaterId', 'name city address');

    res.status(200).json({ success: true, showtimes });
  } catch (error) {
    next(error);
  }
};

export const getShowtimeById = async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movieId')
      .populate('theaterId');

    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found.' });
    }

    res.status(200).json({ success: true, showtime });
  } catch (error) {
    next(error);
  }
};

export const getShowtimeSeats = async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id);
    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found.' });
    }

    // Clean expired locks
    const now = new Date();
    showtime.lockedSeats = showtime.lockedSeats.filter((l) => l.expiresAt > now);
    await showtime.save();

    res.status(200).json({
      success: true,
      data: {
        showtimeId: showtime._id,
        bookedSeats: showtime.bookedSeats,
        lockedSeats: showtime.lockedSeats,
        price: showtime.price,
        screenName: showtime.screenName
      }
    });
  } catch (error) {
    next(error);
  }
};

export const lockSeats = async (req, res, next) => {
  try {
    const { seats } = req.body;
    const userId = req.user.id;
    const { id } = req.params;

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide seats to lock.' });
    }

    if (seats.length > 8) {
      return res.status(400).json({ success: false, message: 'Maximum 8 seats per booking allowed.' });
    }

    const showtime = await Showtime.findById(id);
    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found.' });
    }

    const now = new Date();
    // Clear expired locks
    showtime.lockedSeats = showtime.lockedSeats.filter((l) => l.expiresAt > now);

    // Check conflict
    const conflicts = [];
    for (const seat of seats) {
      if (showtime.bookedSeats.includes(seat)) {
        conflicts.push(seat);
        continue;
      }
      const existingLock = showtime.lockedSeats.find((l) => l.seat === seat);
      if (existingLock && existingLock.userId.toString() !== userId.toString()) {
        conflicts.push(seat);
      }
    }

    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Seats ${conflicts.join(', ')} are already booked or held by another guest.`,
        conflicts
      });
    }

    // Remove user's previous locks on this showtime
    showtime.lockedSeats = showtime.lockedSeats.filter(
      (l) => l.userId.toString() !== userId.toString()
    );

    const lockExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    seats.forEach((seat) => {
      showtime.lockedSeats.push({
        seat,
        userId,
        expiresAt: lockExpiresAt
      });
    });

    await showtime.save();

    // Emit Socket.io update
    const io = req.app.get('io');
    if (io) {
      io.to(`showtime_${showtime._id}`).emit('seats-updated', {
        showtimeId: showtime._id,
        bookedSeats: showtime.bookedSeats,
        lockedSeats: showtime.lockedSeats
      });
    }

    res.status(200).json({
      success: true,
      message: 'Seats held for 5 minutes.',
      expiresAt: lockExpiresAt.getTime(),
      lockedSeats: showtime.lockedSeats
    });
  } catch (error) {
    next(error);
  }
};

export const unlockSeats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { seats } = req.body;

    const showtime = await Showtime.findById(id);
    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found.' });
    }

    if (seats && Array.isArray(seats)) {
      showtime.lockedSeats = showtime.lockedSeats.filter(
        (l) => !(l.userId.toString() === userId.toString() && seats.includes(l.seat))
      );
    } else {
      showtime.lockedSeats = showtime.lockedSeats.filter(
        (l) => l.userId.toString() !== userId.toString()
      );
    }

    await showtime.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`showtime_${showtime._id}`).emit('seats-updated', {
        showtimeId: showtime._id,
        bookedSeats: showtime.bookedSeats,
        lockedSeats: showtime.lockedSeats
      });
    }

    res.status(200).json({ success: true, message: 'Seats unlocked.' });
  } catch (error) {
    next(error);
  }
};

export const createShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.create(req.body);
    res.status(201).json({ success: true, showtime, message: 'Showtime scheduled successfully.' });
  } catch (error) {
    next(error);
  }
};

export const updateShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found.' });
    }
    res.status(200).json({ success: true, showtime, message: 'Showtime updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const deleteShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.findByIdAndDelete(req.params.id);
    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found.' });
    }
    res.status(200).json({ success: true, message: 'Showtime removed successfully.' });
  } catch (error) {
    next(error);
  }
};
