import React, { useState, useEffect } from 'react';
import {
  Shield, DollarSign, Ticket, Users, TrendingUp, Film, Plus, Trash2, Edit,
  Calendar, Clock, CheckCircle, XCircle, Search, RefreshCw, BarChart3, Building
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../api/axios.js';
import { AdminStats, Movie, Theater, Showtime, Booking } from '../types/index.js';
import toast from 'react-hot-toast';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'movies' | 'theaters' | 'showtimes' | 'bookings'>('analytics');
  const [loading, setLoading] = useState(true);

  // Entities
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Modals state
  const [movieModalOpen, setMovieModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [theaterModalOpen, setTheaterModalOpen] = useState(false);
  const [showtimeModalOpen, setShowtimeModalOpen] = useState(false);

  // Movie Form State
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    genre: 'Action, Sci-Fi',
    language: 'English',
    duration: 120,
    rating: 8.5,
    posterUrl: '',
    backdropUrl: '',
    trailerUrl: '',
    director: '',
    certificate: 'UA' as const
  });

  // Theater Form State
  const [theaterForm, setTheaterForm] = useState({
    name: '',
    city: 'New York',
    address: ''
  });

  // Showtime Form State
  const [showtimeForm, setShowtimeForm] = useState({
    movieId: '',
    theaterId: '',
    screenName: 'Screen 1',
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    price: 16.50
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, moviesRes, theatersRes, showtimesRes, bookingsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/movies?limit=50'),
        api.get('/theaters'),
        api.get('/showtimes'),
        api.get('/bookings')
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.stats);
      if (moviesRes.data?.success) setMovies(moviesRes.data.movies);
      if (theatersRes.data?.success) setTheaters(theatersRes.data.theaters);
      if (showtimesRes.data?.success) setShowtimes(showtimesRes.data.showtimes);
      if (bookingsRes.data?.success) setBookings(bookingsRes.data.bookings);

      if (moviesRes.data?.movies?.[0] && theatersRes.data?.theaters?.[0]) {
        setShowtimeForm((prev) => ({
          ...prev,
          movieId: prev.movieId || moviesRes.data.movies[0]._id,
          theaterId: prev.theaterId || theatersRes.data.theaters[0]._id
        }));
      }
    } catch (err) {
      console.error('Failed to load admin stats', err);
      toast.error('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save / Update Movie
  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...movieForm,
        genre: movieForm.genre.split(',').map((s) => s.trim())
      };

      if (editingMovie) {
        const res = await api.put(`/movies/${editingMovie._id}`, payload);
        if (res.data?.success) {
          toast.success('Movie updated successfully');
        }
      } else {
        const res = await api.post('/movies', payload);
        if (res.data?.success) {
          toast.success('Movie added to catalog');
        }
      }
      setMovieModalOpen(false);
      setEditingMovie(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save movie');
    }
  };

  // Delete Movie
  const handleDeleteMovie = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    try {
      const res = await api.delete(`/movies/${id}`);
      if (res.data?.success) {
        toast.success('Movie deleted');
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete movie');
    }
  };

  // Save Theater
  const handleSaveTheater = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/theaters', theaterForm);
      if (res.data?.success) {
        toast.success('Theater added successfully');
        setTheaterModalOpen(false);
        setTheaterForm({ name: '', city: 'New York', address: '' });
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create theater');
    }
  };

  // Delete Theater
  const handleDeleteTheater = async (id: string) => {
    if (!window.confirm('Delete this theater?')) return;
    try {
      const res = await api.delete(`/theaters/${id}`);
      if (res.data?.success) {
        toast.success('Theater removed');
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete theater');
    }
  };

  // Save Showtime
  const handleSaveShowtime = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/showtimes', showtimeForm);
      if (res.data?.success) {
        toast.success('Showtime scheduled');
        setShowtimeModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to schedule showtime');
    }
  };

  // Delete Showtime
  const handleDeleteShowtime = async (id: string) => {
    if (!window.confirm('Delete this showtime?')) return;
    try {
      const res = await api.delete(`/showtimes/${id}`);
      if (res.data?.success) {
        toast.success('Showtime removed');
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete showtime');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-neutral-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Shield className="w-7 h-7 text-[#e50914]" />
            IMovies Admin Portal
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time box office analytics, catalog management, and screening schedules
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-neutral-800/80">
        {[
          { key: 'analytics', label: 'Overview & Charts', icon: BarChart3 },
          { key: 'movies', label: `Movies (${movies.length})`, icon: Film },
          { key: 'theaters', label: `Theaters (${theaters.length})`, icon: Building },
          { key: 'showtimes', label: `Showtimes (${showtimes.length})`, icon: Calendar },
          { key: 'bookings', label: `All Bookings (${bookings.length})`, icon: Ticket }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#e50914] text-white shadow-lg shadow-red-900/30'
                  : 'bg-[#16161d] text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ANALYTICS & CHARTS */}
      {activeTab === 'analytics' && stats && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#16161d] border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-400 uppercase">Total Revenue</span>
                <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-900/40">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">
                ${stats.totalRevenue.toFixed(2)}
              </p>
              <p className="text-[11px] text-emerald-400 font-medium">Real-time authorized payments</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#16161d] border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-400 uppercase">Confirmed Tickets</span>
                <div className="p-2 rounded-lg bg-red-950/60 text-[#e50914] border border-red-900/40">
                  <Ticket className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">
                {stats.confirmedCount}
              </p>
              <p className="text-[11px] text-neutral-400 font-medium">Out of {stats.totalBookings} total orders</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#16161d] border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-400 uppercase">Avg Occupancy</span>
                <div className="p-2 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-900/40">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">
                {stats.averageOccupancy}%
              </p>
              <p className="text-[11px] text-neutral-400 font-medium">Across all auditorium screens</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#16161d] border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-400 uppercase">Registered Cinephiles</span>
                <div className="p-2 rounded-lg bg-blue-950/60 text-blue-400 border border-blue-900/40">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">
                {stats.totalUsers}
              </p>
              <p className="text-[11px] text-neutral-400 font-medium">Active platform members</p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="p-6 rounded-2xl bg-[#16161d] border border-neutral-800 space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#e50914]" />
              Weekly Box Office Performance ($ USD)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e50914" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#e50914" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="date" stroke="#737373" fontSize={11} />
                  <YAxis stroke="#737373" fontSize={11} tickFormatter={(val) => `$${val}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#16161d', borderColor: '#404040', borderRadius: '8px' }}
                    itemStyle={{ color: '#ffffff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#e50914"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Movies by Sales */}
          <div className="p-6 rounded-2xl bg-[#16161d] border border-neutral-800 space-y-4">
            <h3 className="font-bold text-base text-white">Top Grossing Movies</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-neutral-400 border-b border-neutral-800 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Movie</th>
                    <th className="py-3 px-4">Orders</th>
                    <th className="py-3 px-4">Tickets Sold</th>
                    <th className="py-3 px-4 text-right">Gross Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {stats.topMovies.map((m) => (
                    <tr key={m.movieId} className="hover:bg-neutral-800/40">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-3">
                        <img src={m.posterUrl} alt="" className="w-8 h-12 object-cover rounded bg-neutral-900" />
                        <span>{m.title}</span>
                      </td>
                      <td className="py-3 px-4 text-neutral-300">{m.bookings}</td>
                      <td className="py-3 px-4 text-neutral-300">{m.tickets}</td>
                      <td className="py-3 px-4 text-right font-black text-emerald-400">
                        ${m.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOVIES MANAGEMENT */}
      {activeTab === 'movies' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Catalog Management</h3>
            <button
              onClick={() => {
                setEditingMovie(null);
                setMovieForm({
                  title: '',
                  description: '',
                  genre: 'Action, Sci-Fi',
                  language: 'English',
                  duration: 120,
                  rating: 8.5,
                  posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
                  backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
                  trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
                  director: 'Denis Villeneuve',
                  certificate: 'UA'
                });
                setMovieModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e50914] text-white text-xs font-bold hover:bg-red-700 shadow-lg shadow-red-900/30"
            >
              <Plus className="w-4 h-4" /> Add Movie
            </button>
          </div>

          <div className="bg-[#16161d] rounded-2xl border border-neutral-800 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-neutral-400 border-b border-neutral-800 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Movie</th>
                  <th className="py-3 px-4">Genre</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {movies.map((m) => (
                  <tr key={m._id} className="hover:bg-neutral-800/40">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-3">
                      <img src={m.posterUrl} alt="" className="w-8 h-12 object-cover rounded bg-neutral-900" />
                      <div>
                        <p>{m.title}</p>
                        <span className="text-[10px] text-neutral-400">{m.certificate}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-300">{m.genre.join(', ')}</td>
                    <td className="py-3 px-4 text-neutral-300">{m.language}</td>
                    <td className="py-3 px-4 text-neutral-300">{m.duration} mins</td>
                    <td className="py-3 px-4 text-amber-400 font-bold">{m.rating.toFixed(1)}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingMovie(m);
                          setMovieForm({
                            title: m.title,
                            description: m.description,
                            genre: m.genre.join(', '),
                            language: m.language,
                            duration: m.duration,
                            rating: m.rating,
                            posterUrl: m.posterUrl,
                            backdropUrl: m.backdropUrl,
                            trailerUrl: m.trailerUrl,
                            director: m.director,
                            certificate: m.certificate
                          });
                          setMovieModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMovie(m._id)}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-950 text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: THEATERS MANAGEMENT */}
      {activeTab === 'theaters' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Theaters & Auditoriums</h3>
            <button
              onClick={() => setTheaterModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e50914] text-white text-xs font-bold hover:bg-red-700"
            >
              <Plus className="w-4 h-4" /> Add Theater
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {theaters.map((t) => (
              <div key={t._id} className="bg-[#16161d] rounded-2xl p-5 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                    {t.city}
                  </span>
                  <button
                    onClick={() => handleDeleteTheater(t._id)}
                    className="p-1 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{t.name}</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">{t.address}</p>
                </div>
                <div className="text-xs text-neutral-400 pt-2 border-t border-neutral-800">
                  Screens: <span className="text-white font-medium">{t.screens?.map((s) => s.name).join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SHOWTIMES MANAGEMENT */}
      {activeTab === 'showtimes' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Showtime Scheduling</h3>
            <button
              onClick={() => setShowtimeModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e50914] text-white text-xs font-bold hover:bg-red-700"
            >
              <Plus className="w-4 h-4" /> Schedule Showtime
            </button>
          </div>

          <div className="bg-[#16161d] rounded-2xl border border-neutral-800 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-neutral-400 border-b border-neutral-800 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Movie</th>
                  <th className="py-3 px-4">Theater</th>
                  <th className="py-3 px-4">Screen</th>
                  <th className="py-3 px-4">Base Price</th>
                  <th className="py-3 px-4">Occupancy</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {showtimes.slice(0, 30).map((st) => (
                  <tr key={st._id} className="hover:bg-neutral-800/40">
                    <td className="py-3 px-4 font-bold text-white">
                      {st.date} at {st.time}
                    </td>
                    <td className="py-3 px-4 text-neutral-300">{st.movie?.title || st.movieId}</td>
                    <td className="py-3 px-4 text-neutral-300">{st.theater?.name || st.theaterId}</td>
                    <td className="py-3 px-4 text-neutral-300">{st.screenName}</td>
                    <td className="py-3 px-4 text-white font-bold">${st.price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-neutral-300">{st.bookedSeats?.length || 0} / 120</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteShowtime(st._id)}
                        className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-950"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ALL BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <h3 className="font-bold text-base text-white">Customer Reservations Log</h3>
          <div className="bg-[#16161d] rounded-2xl border border-neutral-800 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-neutral-400 border-b border-neutral-800 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Movie</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-neutral-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-red-400">{b.bookingId}</td>
                    <td className="py-3 px-4 text-neutral-300">{b.user?.name || b.userId}</td>
                    <td className="py-3 px-4 font-semibold text-white">{b.movie?.title}</td>
                    <td className="py-3 px-4 text-neutral-300">{b.seats.join(', ')}</td>
                    <td className="py-3 px-4 font-bold text-white">${b.totalAmount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Add/Edit Movie */}
      {movieModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#16161d] rounded-2xl max-w-lg w-full border border-neutral-800 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-white">
              {editingMovie ? 'Edit Movie' : 'Add New Movie to Catalog'}
            </h3>

            <form onSubmit={handleSaveMovie} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1">Movie Title</label>
                <input
                  type="text"
                  required
                  value={movieForm.title}
                  onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 rounded-lg border border-neutral-700 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Synopsis</label>
                <textarea
                  required
                  rows={3}
                  value={movieForm.description}
                  onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 rounded-lg border border-neutral-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1">Genres (comma separated)</label>
                  <input
                    type="text"
                    value={movieForm.genre}
                    onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 rounded-lg border border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1">Language</label>
                  <input
                    type="text"
                    value={movieForm.language}
                    onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 rounded-lg border border-neutral-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={movieForm.duration}
                    onChange={(e) => setMovieForm({ ...movieForm, duration: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-900 rounded-lg border border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1">Rating (0-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={movieForm.rating}
                    onChange={(e) => setMovieForm({ ...movieForm, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-900 rounded-lg border border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1">Certificate</label>
                  <select
                    value={movieForm.certificate}
                    onChange={(e) => setMovieForm({ ...movieForm, certificate: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-900 rounded-lg border border-neutral-700 text-white"
                  >
                    <option value="U">U</option>
                    <option value="UA">UA</option>
                    <option value="A">A</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Poster URL</label>
                <input
                  type="url"
                  value={movieForm.posterUrl}
                  onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 rounded-lg border border-neutral-700 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Trailer YouTube URL</label>
                <input
                  type="url"
                  value={movieForm.trailerUrl}
                  onChange={(e) => setMovieForm({ ...movieForm, trailerUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 rounded-lg border border-neutral-700 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setMovieModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#e50914] text-white font-bold hover:bg-red-700"
                >
                  Save Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Theater */}
      {theaterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#16161d] rounded-2xl max-w-md w-full border border-neutral-800 p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-white">Add New Cinema Theater</h3>
            <form onSubmit={handleSaveTheater} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1">Theater Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metro IMAX Luxe"
                  value={theaterForm.name}
                  onChange={(e) => setTheaterForm({ ...theaterForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 rounded-lg border border-neutral-700 text-white"
                />
              </div>
              <div>
                <label className="block text-neutral-300 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={theaterForm.city}
                  onChange={(e) => setTheaterForm({ ...theaterForm, city: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 rounded-lg border border-neutral-700 text-white"
                />
              </div>
              <div>
                <label className="block text-neutral-300 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={theaterForm.address}
                  onChange={(e) => setTheaterForm({ ...theaterForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 rounded-lg border border-neutral-700 text-white"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setTheaterModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#e50914] text-white font-bold hover:bg-red-700"
                >
                  Create Theater
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Schedule Showtime */}
      {showtimeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#16161d] rounded-2xl max-w-md w-full border border-neutral-800 p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-white">Schedule New Showtime Slot</h3>
            <form onSubmit={handleSaveShowtime} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1">Movie</label>
                <select
                  value={showtimeForm.movieId}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, movieId: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 rounded-lg border border-neutral-700 text-white"
                >
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Theater</label>
                <select
                  value={showtimeForm.theaterId}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, theaterId: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 rounded-lg border border-neutral-700 text-white"
                >
                  {theaters.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1">Screen</label>
                  <input
                    type="text"
                    value={showtimeForm.screenName}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, screenName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 rounded-lg border border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1">Standard Price ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={showtimeForm.price}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-900 rounded-lg border border-neutral-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={showtimeForm.date}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 rounded-lg border border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1">Time (HH:mm)</label>
                  <input
                    type="text"
                    value={showtimeForm.time}
                    placeholder="18:30"
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, time: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 rounded-lg border border-neutral-700 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowtimeModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#e50914] text-white font-bold hover:bg-red-700"
                >
                  Publish Showtime
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
