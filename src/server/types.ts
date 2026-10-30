export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface ICastMember {
  name: string;
  role: string;
}

export interface IMovie {
  _id: string;
  title: string;
  description: string;
  genre: string[];
  language: string;
  duration: number; // minutes
  rating: number; // 0 - 10
  posterUrl: string;
  backdropUrl: string;
  trailerUrl: string;
  cast: ICastMember[];
  director: string;
  releaseDate: string;
  certificate: 'U' | 'UA' | 'A';
  isActive: boolean;
  createdAt: string;
}

export interface IScreen {
  name: string;
  rows: number; // standard 10 (A-J)
  seatsPerRow: number; // standard 12
}

export interface ITheater {
  _id: string;
  name: string;
  city: string;
  address: string;
  screens: IScreen[];
  createdAt: string;
}

export interface ILockedSeat {
  seat: string;
  userId: string;
  expiresAt: number; // epoch timestamp ms
}

export interface IShowtime {
  _id: string;
  movieId: string;
  theaterId: string;
  screenName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (24h)
  price: number;
  bookedSeats: string[];
  lockedSeats: ILockedSeat[];
  createdAt: string;
}

export interface IBooking {
  _id: string;
  bookingId: string; // IM-YYYYMMDD-XXXXXX
  userId: string;
  showtimeId: string;
  seats: string[];
  totalAmount: number;
  status: 'confirmed' | 'cancelled';
  paymentStatus: 'paid';
  createdAt: string;
  cancelledAt?: string;
  // populated details
  movie?: Partial<IMovie>;
  theater?: Partial<ITheater>;
  showtime?: Partial<IShowtime>;
  user?: Partial<IUser>;
}
