import Booking from '../models/Booking.js';
import Showtime from '../models/Showtime.js';

export const createBooking = async (req, res, next) => {
  try {
    const { showtimeId, seats } = req.body;
    const userId = req.user.id;

    if (!showtimeId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide showtime ID and seats.' });
    }

    if (seats.length > 8) {
      return res.status(400).json({ success: false, message: 'Limit of 8 seats per booking.' });
    }

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found.' });
    }

    // Atomic confirmation: findOneAndUpdate with condition that NONE of the requested seats are in bookedSeats
    const updatedShowtime = await Showtime.findOneAndUpdate(
      {
        _id: showtimeId,
        bookedSeats: { $nin: seats }
      },
      {
        $push: { bookedSeats: { $each: seats } },
        $pull: { lockedSeats: { seat: { $in: seats } } }
      },
      { new: true }
    );

    if (!updatedShowtime) {
      return res.status(409).json({
        success: false,
        message: 'One or more selected seats were already booked by another user. Please choose different seats.'
      });
    }

    // Calculate total amount with rows H, I, J at +20%
    let totalAmount = 0;
    seats.forEach((seat) => {
      const row = seat.charAt(0).toUpperCase();
      const isPremium = ['H', 'I', 'J'].includes(row);
      const price = isPremium ? showtime.price * 1.2 : showtime.price;
      totalAmount += Math.round(price * 100) / 100;
    });

    // Generate unique booking ID: IM-YYYYMMDD-XXXXXX
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const bookingId = `IM-${datePart}-${randomPart}`;

    const booking = await Booking.create({
      bookingId,
      userId,
      showtimeId,
      seats,
      totalAmount: Math.round(totalAmount * 100) / 100,
      status: 'confirmed',
      paymentStatus: 'paid'
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name email phone')
      .populate({
        path: 'showtimeId',
        populate: [{ path: 'movieId' }, { path: 'theaterId' }]
      });

    // Real-time broadcast
    const io = req.app.get('io');
    if (io) {
      io.to(`showtime_${showtimeId}`).emit('seats-updated', {
        showtimeId,
        bookedSeats: updatedShowtime.bookedSeats,
        lockedSeats: updatedShowtime.lockedSeats
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('userId', 'name email phone')
      .populate({
        path: 'showtimeId',
        populate: [{ path: 'movieId' }, { path: 'theaterId' }]
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate({
        path: 'showtimeId',
        populate: [{ path: 'movieId' }, { path: 'theaterId' }]
      });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.userId._id.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this booking.' });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('showtimeId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.userId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking.' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    // Rule: Cancellation allowed only up to 2 hours before showtime
    const showtime = booking.showtimeId;
    const showDateTime = new Date(`${showtime.date}T${showtime.time}:00`);
    const diffHours = (showDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

    if (req.user.role !== 'admin' && diffHours < 2) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation is only allowed up to 2 hours before showtime.'
      });
    }

    // Release seats
    const updatedShowtime = await Showtime.findByIdAndUpdate(
      showtime._id,
      { $pull: { bookedSeats: { $in: booking.seats } } },
      { new: true }
    );

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    // Broadcast seats updated
    const io = req.app.get('io');
    if (io) {
      io.to(`showtime_${showtime._id}`).emit('seats-updated', {
        showtimeId: showtime._id,
        bookedSeats: updatedShowtime.bookedSeats,
        lockedSeats: updatedShowtime.lockedSeats
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Seats have been released.',
      booking
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const { status, showtimeId, userId } = req.query;
    const filter = {};

    if (status && status !== 'All') filter.status = status;
    if (showtimeId) filter.showtimeId = showtimeId;
    if (userId) filter.userId = userId;

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email phone')
      .populate({
        path: 'showtimeId',
        populate: [{ path: 'movieId' }, { path: 'theaterId' }]
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};
