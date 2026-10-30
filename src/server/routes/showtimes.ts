import { Router } from 'express';
import { db } from '../db.js';
import { protect, authorize, AuthRequest } from '../auth.js';
import { IShowtime } from '../types.js';

export function createShowtimesRouter(io: any) {
  const router = Router();

  // Helper to emit updates to showtime room
  const notifySeatsUpdated = (showtimeId: string, bookedSeats: string[], lockedSeats: any[]) => {
    if (io) {
      io.to(`showtime_${showtimeId}`).emit('seats-updated', {
        showtimeId,
        bookedSeats,
        lockedSeats
      });
    }
  };

  // GET /api/showtimes?movieId=&date=&city=
  router.get('/', (req, res) => {
    try {
      db.cleanExpiredLocks();
      const { movieId, date, city } = req.query;

      let list = [...db.showtimes];

      if (movieId && typeof movieId === 'string') {
        list = list.filter(s => s.movieId === movieId);
      }

      if (date && typeof date === 'string') {
        list = list.filter(s => s.date === date);
      }

      if (city && typeof city === 'string' && city !== 'All') {
        const matchingTheaterIds = new Set(
          db.theaters.filter(t => t.city.toLowerCase() === (city as string).toLowerCase()).map(t => t._id)
        );
        list = list.filter(s => matchingTheaterIds.has(s.theaterId));
      }

      // Populate movie and theater
      const populated = list.map(st => {
        const movie = db.movies.find(m => m._id === st.movieId);
        const theater = db.theaters.find(t => t._id === st.theaterId);
        return {
          ...st,
          movie: movie ? { _id: movie._id, title: movie.title, certificate: movie.certificate, duration: movie.duration, posterUrl: movie.posterUrl } : undefined,
          theater: theater ? { _id: theater._id, name: theater.name, city: theater.city, address: theater.address } : undefined
        };
      });

      return res.status(200).json({ success: true, showtimes: populated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // GET /api/showtimes/:id
  router.get('/:id', (req, res) => {
    try {
      db.cleanExpiredLocks();
      const showtime = db.showtimes.find(s => s._id === req.params.id);
      if (!showtime) {
        return res.status(404).json({ success: false, message: 'Showtime not found.' });
      }

      const movie = db.movies.find(m => m._id === showtime.movieId);
      const theater = db.theaters.find(t => t._id === showtime.theaterId);

      return res.status(200).json({
        success: true,
        showtime: {
          ...showtime,
          movie,
          theater
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // GET /api/showtimes/:id/seats
  router.get('/:id/seats', (req, res) => {
    try {
      db.cleanExpiredLocks();
      const showtime = db.showtimes.find(s => s._id === req.params.id);
      if (!showtime) {
        return res.status(404).json({ success: false, message: 'Showtime not found.' });
      }

      return res.status(200).json({
        success: true,
        data: {
          showtimeId: showtime._id,
          bookedSeats: showtime.bookedSeats,
          lockedSeats: showtime.lockedSeats,
          price: showtime.price,
          screenName: showtime.screenName
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST /api/showtimes/:id/lock (lock seats for 5 mins)
  router.post('/:id/lock', protect, (req: AuthRequest, res) => {
    try {
      db.cleanExpiredLocks();
      const showtime = db.showtimes.find(s => s._id === req.params.id);
      if (!showtime) {
        return res.status(404).json({ success: false, message: 'Showtime not found.' });
      }

      const { seats } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (!seats || !Array.isArray(seats) || seats.length === 0) {
        return res.status(400).json({ success: false, message: 'Please provide at least one seat to lock.' });
      }

      if (seats.length > 8) {
        return res.status(400).json({ success: false, message: 'Limit of 8 seats per booking.' });
      }

      const now = Date.now();
      const conflictSeats: string[] = [];

      for (const seat of seats) {
        // Check if already booked
        if (showtime.bookedSeats.includes(seat)) {
          conflictSeats.push(seat);
          continue;
        }

        // Check if locked by another user
        const existingLock = showtime.lockedSeats.find(l => l.seat === seat && l.expiresAt > now);
        if (existingLock && existingLock.userId !== userId) {
          conflictSeats.push(seat);
        }
      }

      if (conflictSeats.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Seat(s) ${conflictSeats.join(', ')} are already taken or locked by another customer.`,
          conflictSeats
        });
      }

      // Remove any existing locks by this user on this showtime, then lock the requested seats
      showtime.lockedSeats = showtime.lockedSeats.filter(l => l.userId !== userId);
      const lockExpiry = now + 5 * 60 * 1000; // 5 minutes

      seats.forEach(seat => {
        showtime.lockedSeats.push({
          seat,
          userId,
          expiresAt: lockExpiry
        });
      });

      notifySeatsUpdated(showtime._id, showtime.bookedSeats, showtime.lockedSeats);

      return res.status(200).json({
        success: true,
        message: 'Seats locked successfully for 5 minutes.',
        expiresAt: lockExpiry,
        lockedSeats: showtime.lockedSeats
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST /api/showtimes/:id/unlock
  router.post('/:id/unlock', protect, (req: AuthRequest, res) => {
    try {
      const showtime = db.showtimes.find(s => s._id === req.params.id);
      if (!showtime) {
        return res.status(404).json({ success: false, message: 'Showtime not found.' });
      }

      const userId = req.user?._id;
      const { seats } = req.body;

      if (seats && Array.isArray(seats)) {
        showtime.lockedSeats = showtime.lockedSeats.filter(
          l => !(l.userId === userId && seats.includes(l.seat))
        );
      } else {
        // Unlock all seats for this user
        showtime.lockedSeats = showtime.lockedSeats.filter(l => l.userId !== userId);
      }

      notifySeatsUpdated(showtime._id, showtime.bookedSeats, showtime.lockedSeats);

      return res.status(200).json({
        success: true,
        message: 'Seats unlocked.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // POST /api/showtimes (admin only)
  router.post('/', protect, authorize('admin'), (req, res) => {
    try {
      const { movieId, theaterId, screenName, date, time, price } = req.body;

      if (!movieId || !theaterId || !date || !time) {
        return res.status(400).json({ success: false, message: 'Missing required showtime fields.' });
      }

      // Check unique compound constraint: theaterId, screenName, date, time
      const duplicate = db.showtimes.find(
        s => s.theaterId === theaterId && s.screenName === screenName && s.date === date && s.time === time
      );
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'A showtime already exists for this theater, screen, date, and time.'
        });
      }

      const newShowtime: IShowtime = {
        _id: `st_${date}_${theaterId}_${movieId}_${time.replace(':', '')}`,
        movieId,
        theaterId,
        screenName: screenName || 'Screen 1',
        date,
        time,
        price: Number(price) || 15.00,
        bookedSeats: [],
        lockedSeats: [],
        createdAt: new Date().toISOString()
      };

      db.showtimes.unshift(newShowtime);
      return res.status(201).json({ success: true, showtime: newShowtime, message: 'Showtime created.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // PUT /api/showtimes/:id (admin only)
  router.put('/:id', protect, authorize('admin'), (req, res) => {
    try {
      const showtime = db.showtimes.find(s => s._id === req.params.id);
      if (!showtime) {
        return res.status(404).json({ success: false, message: 'Showtime not found.' });
      }

      Object.assign(showtime, req.body);
      return res.status(200).json({ success: true, showtime, message: 'Showtime updated.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // DELETE /api/showtimes/:id (admin only)
  router.delete('/:id', protect, authorize('admin'), (req, res) => {
    const index = db.showtimes.findIndex(s => s._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Showtime not found.' });
    }

    db.showtimes.splice(index, 1);
    return res.status(200).json({ success: true, message: 'Showtime removed.' });
  });

  return router;
}
