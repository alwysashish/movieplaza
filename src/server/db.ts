import bcrypt from 'bcryptjs';
import { IUser, IMovie, ITheater, IShowtime, IBooking } from './types.js';

// Pre-computed hashes for default passwords (salt 10)
// Admin@123 and User@123
const ADMIN_HASH = bcrypt.hashSync('Admin@123', 10);
const USER_HASH = bcrypt.hashSync('User@123', 10);

class Database {
  users: IUser[] = [];
  movies: IMovie[] = [];
  theaters: ITheater[] = [];
  showtimes: IShowtime[] = [];
  bookings: IBooking[] = [];

  constructor() {
    this.initSeed();
  }

  initSeed() {
    // 1. Seed Users
    this.users = [
      {
        _id: 'usr_admin_001',
        name: 'IMovies Admin',
        email: 'admin@imovies.com',
        password: ADMIN_HASH,
        phone: '+1 555-0199',
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'usr_demo_002',
        name: 'Alex Johnson',
        email: 'user@imovies.com',
        password: USER_HASH,
        phone: '+1 555-0142',
        role: 'user',
        createdAt: new Date().toISOString()
      }
    ];

    // 2. Seed Theaters (3 theaters, 2 screens each)
    this.theaters = [
      {
        _id: 'th_01',
        name: 'CineStar IMAX & Grand Screen',
        city: 'New York',
        address: '742 Broadway, Manhattan, NY 10003',
        screens: [
          { name: 'IMAX Screen 1', rows: 10, seatsPerRow: 12 },
          { name: 'Dolby Atmos Screen 2', rows: 10, seatsPerRow: 12 }
        ],
        createdAt: new Date().toISOString()
      },
      {
        _id: 'th_02',
        name: 'Regal Majestic Premiere Cinema',
        city: 'Los Angeles',
        address: '1000 Olympic Blvd, Downtown LA, CA 90015',
        screens: [
          { name: 'Laser Ultra 1', rows: 10, seatsPerRow: 12 },
          { name: 'VIP Lounge 2', rows: 10, seatsPerRow: 12 }
        ],
        createdAt: new Date().toISOString()
      },
      {
        _id: 'th_03',
        name: 'Starlight Cineplex Luxe',
        city: 'Chicago',
        address: '600 N Michigan Ave, Magnificent Mile, IL 60611',
        screens: [
          { name: 'Auditorium A', rows: 10, seatsPerRow: 12 },
          { name: 'Auditorium B', rows: 10, seatsPerRow: 12 }
        ],
        createdAt: new Date().toISOString()
      }
    ];

    // 3. Seed 10 Movies with rich TMDB style metadata
    this.movies = [
      {
        _id: 'mov_01',
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
          { name: 'Rebecca Ferguson', role: 'Lady Jessica' },
          { name: 'Javier Bardem', role: 'Stilgar' }
        ],
        director: 'Denis Villeneuve',
        releaseDate: '2024-03-01',
        certificate: 'UA',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'mov_02',
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
          { name: 'Matt Damon', role: 'Leslie Groves' },
          { name: 'Robert Downey Jr.', role: 'Lewis Strauss' }
        ],
        director: 'Christopher Nolan',
        releaseDate: '2023-07-21',
        certificate: 'A',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'mov_03',
        title: 'Spider-Man: Across the Spider-Verse',
        description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
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
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'mov_04',
        title: 'Interstellar',
        description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
        genre: ['Sci-Fi', 'Drama', 'Adventure'],
        language: 'English',
        duration: 169,
        rating: 8.7,
        posterUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        cast: [
          { name: 'Matthew McConaughey', role: 'Cooper' },
          { name: 'Anne Hathaway', role: 'Brand' },
          { name: 'Jessica Chastain', role: 'Murph' }
        ],
        director: 'Christopher Nolan',
        releaseDate: '2014-11-07',
        certificate: 'UA',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'mov_05',
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
          { name: 'Christian Bale', role: 'Bruce Wayne / Batman' },
          { name: 'Heath Ledger', role: 'Joker' },
          { name: 'Aaron Eckhart', role: 'Harvey Dent' }
        ],
        director: 'Christopher Nolan',
        releaseDate: '2008-07-18',
        certificate: 'UA',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'mov_06',
        title: 'Inception',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
        genre: ['Sci-Fi', 'Action', 'Thriller'],
        language: 'English',
        duration: 148,
        rating: 8.8,
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
        cast: [
          { name: 'Leonardo DiCaprio', role: 'Cobb' },
          { name: 'Joseph Gordon-Levitt', role: 'Arthur' },
          { name: 'Elliot Page', role: 'Ariadne' }
        ],
        director: 'Christopher Nolan',
        releaseDate: '2010-07-16',
        certificate: 'UA',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'mov_07',
        title: 'Parasite',
        description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
        genre: ['Drama', 'Thriller'],
        language: 'Korean',
        duration: 132,
        rating: 8.5,
        posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=5xH0hhJ98Xg',
        cast: [
          { name: 'Song Kang-ho', role: 'Kim Ki-taek' },
          { name: 'Lee Sun-kyun', role: 'Park Dong-ik' },
          { name: 'Cho Yeo-jeong', role: 'Park Yeon-gyo' }
        ],
        director: 'Bong Joon-ho',
        releaseDate: '2019-11-08',
        certificate: 'A',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'mov_08',
        title: 'RRR',
        description: 'A fearless warrior on a perilous mission comes face to face with a steely cop serving the British forces in pre-independent India in this epic tale of revolutionary brotherhood.',
        genre: ['Action', 'Drama'],
        language: 'Telugu',
        duration: 187,
        rating: 7.9,
        posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=NgBoMJy386M',
        cast: [
          { name: 'N.T. Rama Rao Jr.', role: 'Komaram Bheem' },
          { name: 'Ram Charan', role: 'Alluri Sitarama Raju' },
          { name: 'Alia Bhatt', role: 'Sita' }
        ],
        director: 'S.S. Rajamouli',
        releaseDate: '2022-03-25',
        certificate: 'UA',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'mov_09',
        title: 'Past Lives',
        description: 'Nora and Hae Sung, two deeply connected childhood friends, are wrest apart after Nora\'s family emigrates from South Korea. Two decades later, they are reunited in New York for one fateful week as they confront notions of destiny, love, and the choices that make a life.',
        genre: ['Drama', 'Romance'],
        language: 'English',
        duration: 106,
        rating: 7.9,
        posterUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=kA244xewjcI',
        cast: [
          { name: 'Greta Lee', role: 'Nora' },
          { name: 'Teo Yoo', role: 'Hae Sung' },
          { name: 'John Magaro', role: 'Arthur' }
        ],
        director: 'Celine Song',
        releaseDate: '2023-06-23',
        certificate: 'UA',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'mov_10',
        title: 'Avatar: The Way of Water',
        description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their home.',
        genre: ['Sci-Fi', 'Action', 'Adventure'],
        language: 'English',
        duration: 192,
        rating: 7.6,
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
        cast: [
          { name: 'Sam Worthington', role: 'Jake Sully' },
          { name: 'Zoe Saldana', role: 'Neytiri' },
          { name: 'Sigourney Weaver', role: 'Kiri' }
        ],
        director: 'James Cameron',
        releaseDate: '2022-12-16',
        certificate: 'UA',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    // 4. Generate Showtimes for next 7 days
    this.generateShowtimes();

    // 5. Seed sample confirmed booking for demo user
    const sampleShowtime = this.showtimes[0];
    if (sampleShowtime) {
      sampleShowtime.bookedSeats = ['C5', 'C6'];
      this.bookings = [
        {
          _id: 'bkg_001',
          bookingId: 'IM-20261030-984210',
          userId: 'usr_demo_002',
          showtimeId: sampleShowtime._id,
          seats: ['C5', 'C6'],
          totalAmount: sampleShowtime.price * 2,
          status: 'confirmed',
          paymentStatus: 'paid',
          createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString()
        }
      ];
    }
  }

  generateShowtimes() {
    this.showtimes = [];
    const times = ['10:30', '14:00', '17:30', '21:00'];
    const prices = [14.50, 16.00, 18.50, 17.00];

    const today = new Date();
    // 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const d = new Date(today);
      d.setDate(d.getDate() + dayOffset);
      const dateStr = d.toISOString().split('T')[0];

      // Schedule showtimes for top movies across theaters
      this.theaters.forEach((theater, tIdx) => {
        const theaterMovies = this.movies.slice(0, 6);
        theaterMovies.forEach((movie, mIdx) => {
          // Assign screen
          const screen = theater.screens[(mIdx + tIdx) % theater.screens.length];
          // 2-3 showtime slots
          const slotIndices = [(mIdx + tIdx) % 4, (mIdx + tIdx + 2) % 4];

          slotIndices.forEach((slotIdx) => {
            const time = times[slotIdx];
            const price = prices[slotIdx];

            // Some initial booked seats for realism (e.g. 3-6 seats)
            const preBooked: string[] = [];
            if (dayOffset === 0) {
              const rows = ['B', 'D', 'E'];
              rows.forEach(r => {
                preBooked.push(`${r}4`, `${r}5`);
              });
            }

            this.showtimes.push({
              _id: `st_${dateStr}_${theater._id}_${movie._id}_${time.replace(':', '')}`,
              movieId: movie._id,
              theaterId: theater._id,
              screenName: screen.name,
              date: dateStr,
              time: time,
              price: price,
              bookedSeats: preBooked,
              lockedSeats: [],
              createdAt: new Date().toISOString()
            });
          });
        });
      });
    }
  }

  // Periodic cleaner for expired locks
  cleanExpiredLocks() {
    const now = Date.now();
    let cleaned = 0;
    this.showtimes.forEach(st => {
      const initialCount = st.lockedSeats.length;
      st.lockedSeats = st.lockedSeats.filter(l => l.expiresAt > now);
      if (st.lockedSeats.length !== initialCount) {
        cleaned++;
      }
    });
    return cleaned;
  }
}

export const db = new Database();
