import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import authRoutes from './src/server/routes/auth.js';
import moviesRoutes from './src/server/routes/movies.js';
import theatersRoutes from './src/server/routes/theaters.js';
import { createShowtimesRouter } from './src/server/routes/showtimes.js';
import { createBookingsRouter } from './src/server/routes/bookings.js';
import adminRoutes from './src/server/routes/admin.js';
import { db } from './src/server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Real-time seat room subscription
io.on('connection', (socket) => {
  socket.on('join-showtime', (showtimeId: string) => {
    if (showtimeId) {
      socket.join(`showtime_${showtimeId}`);
    }
  });

  socket.on('leave-showtime', (showtimeId: string) => {
    if (showtimeId) {
      socket.leave(`showtime_${showtimeId}`);
    }
  });
});

// Basic middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Periodic seat lock cleaner: every 10 seconds
setInterval(() => {
  const cleaned = db.cleanExpiredLocks();
  if (cleaned > 0) {
    db.showtimes.forEach(st => {
      io.to(`showtime_${st._id}`).emit('seats-updated', {
        showtimeId: st._id,
        bookedSeats: st.bookedSeats,
        lockedSeats: st.lockedSeats
      });
    });
  }
}, 10000);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/theaters', theatersRoutes);
app.use('/api/showtimes', createShowtimesRouter(io));
app.use('/api/bookings', createBookingsRouter(io));
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'IMovies Backend & Realtime Engine'
  });
});

// Vite middleware for development
async function startServer() {
  const PORT = process.env.PORT || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend build
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  // Centralized error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
  });

  server.listen(PORT, () => {
    console.log(`[IMovies] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[IMovies] Realtime Socket.io active on port ${PORT}`);
  });
}

startServer();
