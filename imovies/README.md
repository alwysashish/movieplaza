# IMovies - Online Movie Ticket Booking Platform (MERN Stack)

IMovies is a production-quality, online movie ticket booking platform built with the MERN stack (MongoDB, Express, React, Node.js) and real-time Socket.io seat locking capabilities.

---

## Table of Contents
1. [Key Features](#key-features)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Folder Structure](#folder-structure)
5. [Installation & Setup](#installation--setup)
6. [Environment Variables](#environment-variables)
7. [Database Seeding](#database-seeding)
8. [Running the Application](#running-the-application)
9. [Demo Accounts](#demo-accounts)
10. [Seat Booking & Locking Architecture](#seat-booking--locking-architecture)
11. [Postman Endpoints & Testing](#postman-endpoints--testing)
12. [Troubleshooting](#troubleshooting)

---

## Key Features

- **Cinematic Dark Theme**: Crafted with dark aesthetics (`#0b0b0f`, `#16161d`, accent `#e50914`), hero trailer carousel, and responsive grid layouts.
- **Real-Time Seat Locking**: When selecting seats, an atomic hold is placed on the server with a 5-minute countdown timer. Other users see locked seats in real time via Socket.io rooms.
- **Atomic Confirmation**: Guarantees zero double-booking via MongoDB `$nin` atomic conditions.
- **Dynamic Pricing**: Premium acoustic rows H-J feature a +20% price tier.
- **Digital Tickets & QR Codes**: Instant boarding pass generation with scannable QR code (`qrcode.react`) and one-click printable receipt.
- **Booking Management**: Customer portal with Upcoming/Past tabs and a strict 2-hour cancellation policy.
- **Admin Box Office Dashboard**: Complete revenue metrics, weekly charts (`recharts`), and CRUD controls for movies, theaters, and showtimes.

---

## Tech Stack

- **Frontend**: React 18, React Router v6, Axios, Tailwind CSS, Context API, react-hot-toast, lucide-react, qrcode.react, recharts, canvas-confetti
- **Backend**: Node.js 16+, Express.js, Mongoose, Socket.io, jsonwebtoken, bcryptjs (10 rounds), express-validator, cors, helmet, morgan, express-rate-limit
- **Database**: MongoDB (Local or MongoDB Atlas)

---

## Prerequisites

- **Node.js**: `16.x` or higher (`v18+` or `v20+` recommended)
- **npm**: `8.x` or higher
- **MongoDB**: Installed locally on `mongodb://127.0.0.1:27017` OR a MongoDB Atlas cluster URI
- **Web Browser**: Google Chrome or Mozilla Firefox
- **Postman**: For API testing and validation

---

## Folder Structure

```text
imovies/
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── movieController.js
│   │   ├── showtimeController.js
│   │   └── theaterController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── error.js
│   │   └── validate.js
│   ├── models/
│   │   ├── Booking.js
│   │   ├── Movie.js
│   │   ├── Showtime.js
│   │   ├── Theater.js
│   │   └── User.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── bookings.js
│   │   ├── movies.js
│   │   ├── showtimes.js
│   │   └── theaters.js
│   ├── seed/
│   │   └── seed.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
└── postman_collection.json
```

---

## Installation & Setup

### 1. Clone or Extract Repository
```bash
cd imovies
```

### 2. Install Server Dependencies
```bash
cd server
npm install
```

### 3. Install Client Dependencies
```bash
cd ../client
npm install
```

---

## Environment Variables

### Server (`server/.env`)
Create a `.env` file in the `server` folder:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/imovies
JWT_SECRET=super_secret_jwt_key_imovies_production_grade
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Client (`client/.env`)
Create a `.env` file in the `client` folder:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## Database Seeding

Run the seed script from the `server/` directory to reset collections and seed initial data:
```bash
cd server
npm run seed
```

This populates:
- **1 Admin user**: `admin@imovies.com` / `Admin@123`
- **1 Customer user**: `user@imovies.com` / `User@123`
- **10 Movies**: Complete with high-definition TMDB posters, backdrops, YouTube trailer links, genres, certificates, and cast
- **3 Theaters**: Across New York, Los Angeles, and Chicago with 2 screens each
- **7 Days of Showtimes**: 3-4 daily time slots for each featured movie

---

## Running the Application

### Option A: Run Server & Client in Two Terminals

**Terminal 1 (Backend API & Socket.io)**:
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 (Frontend Client)**:
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

---

## Demo Accounts

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@imovies.com` | `Admin@123` | Full box office dashboard, CRUD movies, theaters, showtimes, view all bookings |
| **Customer** | `user@imovies.com` | `User@123` | Book tickets, real-time seat lock, digital passes, cancellation |

---

## Seat Booking & Locking Architecture

1. **Seat Selection**: The auditorium grid comprises rows A to J (10 rows) and 12 seats per row with a central aisle gap between seat 6 and 7.
2. **5-Minute Server Hold**: Selecting a seat calls `POST /api/showtimes/:id/lock`. A lock object `{ seat, userId, expiresAt }` is attached with a 5-minute expiry timestamp.
3. **Real-time Synchronization**: Socket.io broadcasts `seats-updated` events to all connected clients in the room `showtime_<id>`.
4. **Periodic Cleaner**: A background timer runs every 15 seconds to purge expired seat locks from the database.
5. **Atomic Confirmation**: During `POST /api/bookings`, MongoDB confirms the order with an atomic `$nin` query on `bookedSeats`, preventing race conditions or double bookings.
6. **Cancellation Window**: Cancellations are permitted strictly up to 2 hours before the scheduled showtime.

---

## Postman Endpoints & Testing

Import `postman_collection.json` directly into Postman or use the endpoints below:

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Login and receive 7-day JWT token |
| `GET` | `/api/auth/me` | User | Retrieve current user profile |
| `PUT` | `/api/auth/profile` | User | Update name and phone number |
| `PUT` | `/api/auth/password` | User | Update secret password |
| `GET` | `/api/movies` | Public | List movies (query: search, genre, lang, sort, page) |
| `GET` | `/api/movies/:id` | Public | Get single movie with cast & director |
| `POST` | `/api/movies` | Admin | Create movie in catalog |
| `PUT` | `/api/movies/:id` | Admin | Update movie details |
| `DELETE` | `/api/movies/:id` | Admin | Delete movie |
| `GET` | `/api/theaters` | Public | List all cinema locations |
| `POST` | `/api/theaters` | Admin | Add new theater |
| `GET` | `/api/showtimes` | Public | Query showtimes by movieId, date, and city |
| `GET` | `/api/showtimes/:id/seats` | Public | Get live booked and locked seats |
| `POST` | `/api/showtimes/:id/lock` | User | Hold seats for 5 minutes (max 8) |
| `POST` | `/api/showtimes/:id/unlock` | User | Release held seats |
| `POST` | `/api/bookings` | User | Confirm booking atomically |
| `GET` | `/api/bookings/my` | User | Get current user's tickets |
| `DELETE` | `/api/bookings/:id` | User | Cancel booking (up to 2h before show) |
| `GET` | `/api/admin/stats` | Admin | Box office gross revenue & occupancy stats |

---

## Troubleshooting

1. **MongoDB Connection Failed**:
   - Ensure MongoDB daemon is running locally (`mongod` or `brew services start mongodb-community`).
   - If using MongoDB Atlas, verify your connection string and ensure IP whitelist includes `0.0.0.0/0`.
2. **CORS Error**:
   - Ensure `CLIENT_URL` in `server/.env` exactly matches your client port (default: `http://localhost:5173`).
3. **Seat Lock Expired**:
   - Seat holds automatically release after 5 minutes of inactivity to ensure fair access for other guests.
