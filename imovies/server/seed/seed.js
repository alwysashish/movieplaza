import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Theater from '../models/Theater.js';
import Showtime from '../models/Showtime.js';
import Booking from '../models/Booking.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected.');

    // 1. Clear existing collections
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany(),
      Movie.deleteMany(),
      Theater.deleteMany(),
      Showtime.deleteMany(),
      Booking.deleteMany()
    ]);
    console.log('[Seed] Collections cleared.');

    // 2. Seed Users (1 Admin, 1 Customer)
    console.log('[Seed] Creating demo accounts...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('Admin@123', salt);
    const userPassword = await bcrypt.hash('User@123', salt);

    const [adminUser, regularUser] = await User.create([
      {
        name: 'IMovies Admin',
        email: 'admin@imovies.com',
        password: adminPassword,
        phone: '+1 555-0199',
        role: 'admin'
      },
      {
        name: 'Alex Johnson',
        email: 'user@imovies.com',
        password: userPassword,
        phone: '+1 555-0142',
        role: 'user'
      }
    ]);
    console.log('[Seed] Created Admin & Customer accounts.');

    // 3. Seed 3 Theaters
    console.log('[Seed] Creating theaters and screens...');
    const theaters = await Theater.create([
      {
        name: 'CineStar IMAX & Grand Screen',
        city: 'New York',
        address: '742 Broadway, Manhattan, NY 10003',
        screens: [
          { name: 'IMAX Screen 1', rows: 10, seatsPerRow: 12 },
          { name: 'Dolby Atmos Screen 2', rows: 10, seatsPerRow: 12 }
        ]
      },
      {
        name: 'Regal Majestic Premiere Cinema',
        city: 'Los Angeles',
        address: '1000 Olympic Blvd, Downtown LA, CA 90015',
        screens: [
          { name: 'Laser Ultra 1', rows: 10, seatsPerRow: 12 },
          { name: 'VIP Lounge 2', rows: 10, seatsPerRow: 12 }
        ]
      },
      {
        name: 'Starlight Cineplex Luxe',
        city: 'Chicago',
        address: '600 N Michigan Ave, Magnificent Mile, IL 60611',
        screens: [
          { name: 'Auditorium A', rows: 10, seatsPerRow: 12 },
          { name: 'Auditorium B', rows: 10, seatsPerRow: 12 }
        ]
      }
    ]);
    console.log('[Seed] Created 3 theaters with multi-screens.');

    // 4. Seed 10 Movies with TMDB metadata
    console.log('[Seed] Creating 10 movies catalog...');
    const movies = await Movie.create([
      {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
        genre: ['Sci-Fi', 'Adventure', 'Action'],
        language: 'English',
        duration: 166,
        rating: 8.8,
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        cast: [
          { name: 'Timothée Chalamet', role: 'Paul Atreides' },
          { name: 'Zendaya', role: 'Chani' },
          { name: 'Rebecca Ferguson', role: 'Lady Jessica' }
        ],
        director: 'Denis Villeneuve',
        releaseDate: '2024-03-01',
        certificate: 'UA',
        isActive: true
      },
      {
        title: 'Oppenheimer',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the moral and political turmoil that followed.',
        genre: ['Biography', 'Drama', 'History'],
        language: 'English',
        duration: 180,
        rating: 8.9,
        posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        cast: [
          { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer' },
          { name: 'Emily Blunt', role: 'Katherine Oppenheimer' },
          { name: 'Matt Damon', role: 'Leslie Groves' }
        ],
        director: 'Christopher Nolan',
        releaseDate: '2023-07-21',
        certificate: 'A',
        isActive: true
      },
      {
        title: 'Spider-Man: Across the Spider-Verse',
        description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
        genre: ['Animation', 'Action', 'Adventure'],
        language: 'English',
        duration: 140,
        rating: 8.7,
        posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
        cast: [
          { name: 'Shameik Moore', role: 'Miles Morales' },
          { name: 'Hailee Steinfeld', role: 'Gwen Stacy' },
          { name: 'Oscar Isaac', role: 'Miguel O\'Hara' }
        ],
        director: 'Joaquim Dos Santos, Kemp Powers',
        releaseDate: '2023-06-02',
        certificate: 'U',
        isActive: true
      },
      {
        title: 'Interstellar',
        description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
        genre: ['Sci-Fi', 'Drama', 'Adventure'],
        language: 'English',
        duration: 169,
        rating: 8.7,
        posterUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        cast: [
          { name: 'Matthew McConaughey', role: 'Cooper' },
          { name: 'Anne Hathaway', role: 'Brand' }
        ],
        director: 'Christopher Nolan',
        releaseDate: '2014-11-07',
        certificate: 'UA',
        isActive: true
      },
      {
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        genre: ['Action', 'Crime', 'Drama'],
        language: 'English',
        duration: 152,
        rating: 9.0,
        posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
        cast: [
          { name: 'Christian Bale', role: 'Bruce Wayne' },
          { name: 'Heath Ledger', role: 'Joker' }
        ],
        director: 'Christopher Nolan',
        releaseDate: '2008-07-18',
        certificate: 'UA',
        isActive: true
      },
      {
        title: 'Inception',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        genre: ['Sci-Fi', 'Action', 'Thriller'],
        language: 'English',
        duration: 148,
        rating: 8.8,
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
        cast: [{ name: 'Leonardo DiCaprio', role: 'Cobb' }],
        director: 'Christopher Nolan',
        releaseDate: '2010-07-16',
        certificate: 'UA',
        isActive: true
      },
      {
        title: 'Parasite',
        description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
        genre: ['Drama', 'Thriller'],
        language: 'Korean',
        duration: 132,
        rating: 8.5,
        posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=5xH0hhJ98Xg',
        cast: [{ name: 'Song Kang-ho', role: 'Kim Ki-taek' }],
        director: 'Bong Joon-ho',
        releaseDate: '2019-11-08',
        certificate: 'A',
        isActive: true
      },
      {
        title: 'RRR',
        description: 'A fearless warrior on a perilous mission comes face to face with a steely cop serving the British forces in pre-independent India.',
        genre: ['Action', 'Drama'],
        language: 'Telugu',
        duration: 187,
        rating: 7.9,
        posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=NgBoMJy386M',
        cast: [{ name: 'N.T. Rama Rao Jr.', role: 'Komaram Bheem' }],
        director: 'S.S. Rajamouli',
        releaseDate: '2022-03-25',
        certificate: 'UA',
        isActive: true
      },
      {
        title: 'Past Lives',
        description: 'Nora and Hae Sung, two deeply connected childhood friends, are wrest apart after Nora\'s family emigrates from South Korea.',
        genre: ['Drama', 'Romance'],
        language: 'English',
        duration: 106,
        rating: 7.9,
        posterUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=kA244xewjcI',
        cast: [{ name: 'Greta Lee', role: 'Nora' }],
        director: 'Celine Song',
        releaseDate: '2023-06-23',
        certificate: 'UA',
        isActive: true
      },
      {
        title: 'Avatar: The Way of Water',
        description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.',
        genre: ['Sci-Fi', 'Action', 'Adventure'],
        language: 'English',
        duration: 192,
        rating: 7.6,
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
        cast: [{ name: 'Sam Worthington', role: 'Jake Sully' }],
        director: 'James Cameron',
        releaseDate: '2022-12-16',
        certificate: 'UA',
        isActive: true
      }
    ]);
    console.log('[Seed] Created 10 movies.');

    // 5. Seed Showtimes for next 7 days (3-4 slots per movie per day)
    console.log('[Seed] Generating showtimes for next 7 days...');
    const times = ['10:30', '14:00', '17:30', '21:00'];
    const prices = [14.50, 16.00, 18.50, 17.00];

    const showtimesToInsert = [];
    const today = new Date();

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const d = new Date(today);
      d.setDate(d.getDate() + dayOffset);
      const dateStr = d.toISOString().split('T')[0];

      theaters.forEach((theater, tIdx) => {
        const selectedMovies = movies.slice(0, 5);
        selectedMovies.forEach((movie, mIdx) => {
          const screen = theater.screens[(mIdx + tIdx) % theater.screens.length];
          const slotIndices = [(mIdx + tIdx) % 4, (mIdx + tIdx + 2) % 4, (mIdx + tIdx + 3) % 4];

          slotIndices.forEach((slotIdx) => {
            const time = times[slotIdx];
            const price = prices[slotIdx];

            // Sample pre-booked seats
            const preBooked = dayOffset === 0 ? ['B4', 'B5', 'C6', 'D7'] : [];

            showtimesToInsert.push({
              movieId: movie._id,
              theaterId: theater._id,
              screenName: screen.name,
              date: dateStr,
              time: time,
              price: price,
              bookedSeats: preBooked,
              lockedSeats: []
            });
          });
        });
      });
    }

    const insertedShowtimes = await Showtime.insertMany(showtimesToInsert);
    console.log(`[Seed] Created ${insertedShowtimes.length} showtimes.`);

    // 6. Seed sample confirmed booking for demo user
    const sampleShowtime = insertedShowtimes[0];
    if (sampleShowtime) {
      await Booking.create({
        bookingId: 'IM-20261030-849102',
        userId: regularUser._id,
        showtimeId: sampleShowtime._id,
        seats: ['B4', 'B5'],
        totalAmount: sampleShowtime.price * 2,
        status: 'confirmed',
        paymentStatus: 'paid'
      });
      console.log('[Seed] Created sample booking for demo user.');
    }

    console.log('[Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
