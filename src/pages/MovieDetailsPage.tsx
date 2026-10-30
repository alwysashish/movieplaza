import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, Calendar, Play, MapPin, Ticket, Shield, User, ChevronRight } from 'lucide-react';
import api from '../api/axios.js';
import { Movie, Showtime, Theater } from '../types/index.js';
import { TrailerModal } from '../components/TrailerModal.js';

export const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [trailerOpen, setTrailerOpen] = useState(false);

  // Generate next 7 days for the date selector
  const days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() + idx);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    return { dateStr, dayName, dayNumber, month };
  });

  useEffect(() => {
    const fetchMovieData = async () => {
      setLoading(true);
      try {
        const [movieRes, showtimesRes] = await Promise.all([
          api.get(`/movies/${id}`),
          api.get(`/showtimes?movieId=${id}&date=${selectedDate}${selectedCity !== 'All' ? `&city=${selectedCity}` : ''}`)
        ]);

        if (movieRes.data?.success) {
          setMovie(movieRes.data.movie);
        }
        if (showtimesRes.data?.success) {
          setShowtimes(showtimesRes.data.showtimes);
        }
      } catch (err) {
        console.error('Failed to load movie details', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieData();
    }
  }, [id, selectedDate, selectedCity]);

  if (loading && !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0b0f]">
        <div className="w-10 h-10 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0b0f] text-neutral-300">
        <p className="text-xl font-bold">Movie not found</p>
        <button
          onClick={() => navigate('/movies')}
          className="mt-4 px-4 py-2 rounded-lg bg-[#e50914] text-white text-xs font-semibold"
        >
          Back to Movies
        </button>
      </div>
    );
  }

  // Group showtimes by theater
  const showtimesByTheater = showtimes.reduce<Record<string, { theater: Theater; slots: Showtime[] }>>((acc, st) => {
    if (st.theater) {
      if (!acc[st.theaterId]) {
        acc[st.theaterId] = {
          theater: st.theater,
          slots: []
        };
      }
      acc[st.theaterId].slots.push(st);
    }
    return acc;
  }, {});

  const theaterList = Object.values(showtimesByTheater);

  return (
    <div className="min-h-screen bg-[#0b0b0f] pb-24">
      {/* Backdrop Hero Header */}
      <div className="relative w-full h-[400px] md:h-[500px] bg-neutral-950 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${movie.backdropUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] via-[#0b0b0f]/75 to-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0f] via-[#0b0b0f]/60 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-end pb-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-end w-full">
            {/* Poster Card */}
            <div className="w-36 sm:w-48 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-neutral-700/80 bg-neutral-900 shrink-0 hidden sm:block">
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
            </div>

            {/* Title & Metadata */}
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#e50914] text-white uppercase">
                  {movie.certificate}
                </span>
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {movie.rating.toFixed(1)} / 10
                </div>
                <span className="text-xs text-neutral-300 font-medium px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                  {movie.language}
                </span>
                <span className="text-xs text-neutral-300 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  {movie.duration} mins
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {movie.title}
              </h1>

              <p className="text-xs sm:text-sm text-neutral-300 flex items-center gap-2 font-medium">
                <span>{movie.genre.join(' • ')}</span>
                <span>•</span>
                <span>Released {movie.releaseDate}</span>
              </p>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => setTrailerOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 backdrop-blur-md transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Watch Official Trailer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
        {/* Synopsis & Cast Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#e50914] rounded-sm"></span>
                Story Synopsis
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed bg-[#16161d]/60 p-4 rounded-xl border border-neutral-800">
                {movie.description}
              </p>
            </div>

            {/* Cast & Crew */}
            <div>
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#e50914] rounded-sm"></span>
                Key Cast & Direction
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#16161d] border border-neutral-800">
                  <p className="text-[10px] text-neutral-400 uppercase font-semibold">Director</p>
                  <p className="text-xs font-bold text-white mt-0.5 truncate">{movie.director}</p>
                </div>
                {movie.cast.map((actor, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#16161d] border border-neutral-800">
                    <p className="text-[10px] text-red-400 uppercase font-semibold truncate">{actor.role}</p>
                    <p className="text-xs font-bold text-white mt-0.5 truncate">{actor.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Specs Sidebar */}
          <div className="p-5 rounded-2xl bg-[#16161d] border border-neutral-800 space-y-4 h-fit">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">
              Cinema Specifications
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Audio Format</span>
                <span className="text-white font-medium">Dolby Atmos 7.1.4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Projection</span>
                <span className="text-white font-medium">4K Laser IMAX</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Seat Hold Window</span>
                <span className="text-white font-medium text-emerald-400">5 Minutes Live Lock</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Cancellation Policy</span>
                <span className="text-white font-medium">Up to 2h before show</span>
              </div>
            </div>
          </div>
        </div>

        {/* Date Selector Bar */}
        <div className="space-y-4 pt-4 border-t border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#e50914]" />
                Select Showtime Date
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Showing scheduled slots for {movie.title}
              </p>
            </div>

            {/* City Filter */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-neutral-400" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-neutral-900 text-xs text-neutral-200 rounded-lg px-3 py-2 border border-neutral-700 focus:outline-none focus:border-[#e50914]"
              >
                <option value="All">All Cities</option>
                <option value="New York">New York</option>
                <option value="Los Angeles">Los Angeles</option>
                <option value="Chicago">Chicago</option>
              </select>
            </div>
          </div>

          {/* 7 Days Pills */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {days.map((d) => {
              const isSelected = selectedDate === d.dateStr;
              return (
                <button
                  key={d.dateStr}
                  onClick={() => setSelectedDate(d.dateStr)}
                  className={`flex flex-col items-center justify-center min-w-[76px] py-3 px-2 rounded-xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-[#e50914] text-white border-red-500 shadow-lg shadow-red-900/40 scale-105'
                      : 'bg-[#16161d] text-neutral-400 hover:text-white hover:bg-neutral-800 border-neutral-800'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider">{d.dayName}</span>
                  <span className="text-lg font-black my-0.5">{d.dayNumber}</span>
                  <span className="text-[10px] text-neutral-300 font-medium">{d.month}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Showtimes Grouped by Theater */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#e50914] rounded-sm"></span>
            Available Theaters & Screen Times ({theaterList.length})
          </h3>

          {theaterList.length === 0 ? (
            <div className="text-center py-12 bg-[#16161d]/50 rounded-2xl border border-neutral-800 space-y-2">
              <p className="text-sm font-semibold text-white">No showtimes found for this date or city</p>
              <p className="text-xs text-neutral-400">Please select another date above or change your city filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {theaterList.map(({ theater, slots }) => (
                <div
                  key={theater._id}
                  className="bg-[#16161d] rounded-2xl p-5 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-white">{theater.name}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
                          {theater.city}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                        {theater.address}
                      </p>
                    </div>

                    <div className="text-xs text-neutral-400">
                      Standard: <span className="font-semibold text-white">${slots[0]?.price.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Showtime Pills */}
                  <div className="flex flex-wrap items-center gap-3">
                    {slots.map((st) => (
                      <button
                        key={st._id}
                        onClick={() => navigate(`/seat-selection/${st._id}`)}
                        className="group flex flex-col items-center justify-center px-4 py-2.5 rounded-xl bg-neutral-900/90 hover:bg-[#e50914] border border-neutral-700/80 hover:border-red-500 transition-all text-neutral-200 hover:text-white shadow-sm"
                      >
                        <span className="text-sm font-extrabold tracking-wide">{st.time}</span>
                        <span className="text-[10px] text-neutral-400 group-hover:text-red-100 font-medium">
                          {st.screenName}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailerUrl={movie.trailerUrl}
        movieTitle={movie.title}
      />
    </div>
  );
};
