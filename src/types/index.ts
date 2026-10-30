export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface CastMember {
  name: string;
  role: string;
}

export interface Movie {
  _id: string;
  title: string;
  description: string;
  genre: string[];
  language: string;
  duration: number;
  rating: number;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl: string;
  cast: CastMember[];
  director: string;
  releaseDate: string;
  certificate: 'U' | 'UA' | 'A';
  isActive: boolean;
  createdAt?: string;
}

export interface Screen {
  name: string;
  rows: number;
  seatsPerRow: number;
}

export interface Theater {
  _id: string;
  name: string;
  city: string;
  address: string;
  screens: Screen[];
}

export interface LockedSeat {
  seat: string;
  userId: string;
  expiresAt: number;
}

export interface Showtime {
  _id: string;
  movieId: string;
  theaterId: string;
  screenName: string;
  date: string;
  time: string;
  price: number;
  bookedSeats: string[];
  lockedSeats: LockedSeat[];
  movie?: Movie;
  theater?: Theater;
}

export interface Booking {
  _id: string;
  bookingId: string;
  userId: string;
  showtimeId: string;
  seats: string[];
  totalAmount: number;
  status: 'confirmed' | 'cancelled';
  paymentStatus: 'paid';
  createdAt: string;
  cancelledAt?: string;
  movie?: Movie;
  theater?: Theater;
  showtime?: Showtime;
  user?: User;
}

export interface AdminStats {
  totalRevenue: number;
  totalBookings: number;
  confirmedCount: number;
  cancelledCount: number;
  totalUsers: number;
  totalMovies: number;
  totalTheaters: number;
  totalShowtimes: number;
  averageOccupancy: number;
  topMovies: {
    movieId: string;
    title: string;
    posterUrl: string;
    bookings: number;
    tickets: number;
    revenue: number;
  }[];
  chartData: {
    date: string;
    revenue: number;
    bookings: number;
  }[];
}
