import { Router } from 'express';
import { db } from '../db.js';
import { protect, authorize, AuthRequest } from '../auth.js';
import { IBooking } from '../types.js';

export function createBookingsRouter(io: any) {
  const router = Router();

  const notifySeatsUpdated = (showtimeId: string, bookedSeats: string[], lockedSeats: any[]) => {
    if (io) {
      io.to(`showtime_${showtimeId}`).emit('seats-updated', {
        showtimeId,
        bookedSeats,
        lockedSeats
      });
    }
  };

  // Helper to populate booking details
  const populateBooking = (booking: IBooking) => {
    const showtime = db.showtimes.find(s => s._id === booking.showtimeId);
    const movie = showtime ? db.movies.find(m => m._id === showtime.movieId) : undefined;
    const theater = showtime ? db.theaters.find(t => t._id === showtime.theaterId) : undefined;
    const user = db.users.find(u => u._id === booking.userId);

    return {
      ...booking,
      movie: movie ? {
        _id: movie._id,
        title: movie.title,
        certificate: movie.certificate,
        duration: movie.duration,
        posterUrl: movie.posterUrl,
        backdropUrl: movie.backdropUrl
      } : undefined,
      theater: theater ? {
        _id: theater._id,
        name: theater.name,
        city: theater.city,
        address: theater.address
      } : undefined,
      showtime: showtime ? {
        _id: showtime._id,
        screenName: showtime.screenName,
        date: showtime.date,
        time: showtime.time,
        price: showtime.price
      } : undefined,
      user: user ? {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      } : undefined
    };
  };

  // POST /api/bookings - Atomic confirmation
  router.post('/', protect, (req: AuthRequest, res) => {
    try {
      db.cleanExpiredLocks();
      const { showtimeId, seats } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (!showtimeId || !seats || !Array.isArray(seats) || seats.length === 0) {
        return res.status(400).json({ success: false, message: 'Please provide showtime ID and seats.' });
      }

      if (seats.length > 8) {
        return res.status(400).json({ success: false, message: 'Maximum 8 seats allowed per booking.' });
      }

      const showtime = db.showtimes.find(s => s._id === showtimeId);
      if (!showtime) {
        return res.status(404).json({ success: false, message: 'Showtime not found.' });
      }

      const now = Date.now();
      const conflicts: string[] = [];

      for (const seat of seats) {
        // Condition: seat cannot already be in bookedSeats
        if (showtime.bookedSeats.includes(seat)) {
          conflicts.push(seat);
          continue;
        }

        // Condition: seat cannot be locked by someone else
        const lock = showtime.lockedSeats.find(l => l.seat === seat && l.expiresAt > now);
        if (lock && lock.userId !== userId) {
          conflicts.push(seat);
        }
      }

      if (conflicts.length > 0) {
        return res.status(409).json({
          success: false,
          message: `The following seat(s) are no longer available: ${conflicts.join(', ')}`,
          conflicts
        });
      }

      // Calculate total amount with dynamic pricing: rows H, I, J have +20%
      let totalAmount = 0;
      seats.forEach(seat => {
        const row = seat.charAt(0).toUpperCase();
        const isPremium = ['H', 'I', 'J'].includes(row);
        const seatPrice = isPremium ? showtime.price * 1.2 : showtime.price;
        totalAmount += Math.round(seatPrice * 100) / 100;
      });

      // Atomic update of bookedSeats
      showtime.bookedSeats.push(...seats);

      // Remove locks for these seats
      showtime.lockedSeats = showtime.lockedSeats.filter(l => !seats.includes(l.seat));

      // Generate booking ID: IM-YYYYMMDD-XXXXXX
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const bookingId = `IM-${todayStr}-${randomSuffix}`;

      const newBooking: IBooking = {
        _id: `bkg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        bookingId,
        userId,
        showtimeId,
        seats,
        totalAmount: Math.round(totalAmount * 100) / 100,
        status: 'confirmed',
        paymentStatus: 'paid',
        createdAt: new Date().toISOString()
      };

      db.bookings.unshift(newBooking);

      // Realtime notification
      notifySeatsUpdated(showtime._id, showtime.bookedSeats, showtime.lockedSeats);

      const populated = populateBooking(newBooking);

      return res.status(201).json({
        success: true,
        message: 'Booking confirmed successfully!',
        booking: populated
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // GET /api/bookings/my
  router.get('/my', protect, (req: AuthRequest, res) => {
    try {
      const userId = req.user?._id;
      const userBookings = db.bookings
        .filter(b => b.userId === userId)
        .map(populateBooking);

      return res.status(200).json({
        success: true,
        bookings: userBookings
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // GET /api/bookings/:id
  router.get('/:id', protect, (req: AuthRequest, res) => {
    try {
      const booking = db.bookings.find(b => b._id === req.params.id || b.bookingId === req.params.id);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found.' });
      }

      // Check access permission: user owns it or admin
      if (booking.userId !== req.user?._id && req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      return res.status(200).json({
        success: true,
        booking: populateBooking(booking)
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // DELETE /api/bookings/:id (cancel booking)
  router.delete('/:id', protect, (req: AuthRequest, res) => {
    try {
      const booking = db.bookings.find(b => b._id === req.params.id || b.bookingId === req.params.id);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found.' });
      }

      // Check ownership or admin
      if (booking.userId !== req.user?._id && req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      if (booking.status === 'cancelled') {
        return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
      }

      const showtime = db.showtimes.find(s => s._id === booking.showtimeId);
      if (!showtime) {
        return res.status(404).json({ success: false, message: 'Showtime not found.' });
      }

      // Rule: Cancellation allowed only up to 2 hours before showtime
      const showtimeDateTime = new Date(`${showtime.date}T${showtime.time}:00`);
      const now = new Date();
      const diffMs = showtimeDateTime.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // Admins can bypass if necessary, but for regular users enforce 2h rule
      if (req.user?.role !== 'admin' && diffHours < 2) {
        return res.status(400).json({
          success: false,
          message: 'Cancellation is allowed only up to 2 hours before showtime.'
        });
      }

      // Release seats
      showtime.bookedSeats = showtime.bookedSeats.filter(s => !booking.seats.includes(s));

      booking.status = 'cancelled';
      booking.cancelledAt = new Date().toISOString();

      notifySeatsUpdated(showtime._id, showtime.bookedSeats, showtime.lockedSeats);

      return res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully. Seats have been released.',
        booking: populateBooking(booking)
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // GET /api/bookings (admin only, filterable)
  router.get('/', protect, authorize('admin'), (req, res) => {
    try {
      let list = [...db.bookings];
      const { status, date, showtimeId, userId } = req.query;

      if (status && typeof status === 'string' && status !== 'All') {
        list = list.filter(b => b.status === status);
      }

      if (showtimeId && typeof showtimeId === 'string') {
        list = list.filter(b => b.showtimeId === showtimeId);
      }

      if (userId && typeof userId === 'string') {
        list = list.filter(b => b.userId === userId);
      }

      const populated = list.map(populateBooking);

      if (date && typeof date === 'string') {
        return res.status(200).json({
          success: true,
          bookings: populated.filter(b => b.showtime?.date === date)
        });
      }

      return res.status(200).json({
        success: true,
        bookings: populated
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  return router;
}
