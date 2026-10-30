import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import movieRoutes from './routes/movies.js';
import theaterRoutes from './routes/theaters.js';
import showtimeRoutes from './routes/showtimes.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';
import { errorHandler } from './middleware/error.js';
import Showtime from './models/Showtime.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Provide io instance to express controllers via req.app.get('io')
app.set('io', io);

// Socket.io room management
io.on('connection', (socket) => {
  socket.on('join-showtime', (showtimeId) => {
    if (showtimeId) socket.join(`showtime_${showtimeId}`);
  });

  socket.on('leave-showtime', (showtimeId) => {
    if (showtimeId) socket.leave(`showtime_${showtimeId}`);
  });
});

// Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Background cleaner: clear expired seat locks every 15 seconds
setInterval(async () => {
  try {
    const now = new Date();
    const showtimes = await Showtime.find({ 'lockedSeats.expiresAt': { $lte: now } });
    for (const st of showtimes) {
      const initial = st.lockedSeats.length;
      st.lockedSeats = st.lockedSeats.filter((l) => l.expiresAt > now);
      if (st.lockedSeats.length !== initial) {
        await st.save();
        io.to(`showtime_${st._id}`).emit('seats-updated', {
          showtimeId: st._id,
          bookedSeats: st.bookedSeats,
          lockedSeats: st.lockedSeats
        });
      }
    }
  } catch (err) {
    // quiet cleanup error
  }
}, 15000);

// API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theaters', theaterRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'IMovies API Server is online.' });
});

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[IMovies Server] Running in ${process.env.NODE_ENV || 'development'} on port ${PORT}`);
});
