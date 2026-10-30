import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Ticket, Star, Clock, Calendar, ChevronRight, ChevronLeft, ShieldCheck, Sparkles, Film } from 'lucide-react';
import api from '../api/axios.js';
import { Movie } from '../types/index.js';
import { TrailerModal } from '../components/TrailerModal.js';
import { MovieGridSkeleton } from '../components/SkeletonLoader.js';

export const HomePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [trailerData, setTrailerData] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: ''
  });

  const navigate = useNavigate();

  const genres = ['All', 'Sci-Fi', 'Action', 'Drama', 'Adventure', 'Animation', 'Crime', 'Romance'];

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await api.get('/movies?limit=20');
        if (res.data?.success) {
          setMovies(res.data.movies);
        }
      } catch (err) {
        console.error('Failed to load movies', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Auto rotate hero carousel every 7 seconds
  const heroMovies = movies.slice(0, 4);

  useEffect(() => {
    if (heroMovies.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroMovies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [heroMovies.length]);

  const currentHero = heroMovies[heroIndex] || movies[0];

  const filteredMovies = selectedGenre === 'All'
    ? movies
    : movies.filter(m => m.genre.some(g => g.toLowerCase() === selectedGenre.toLowerCase()));

  const nowShowing = filteredMovies.slice(0, 8);
  const comingSoon = movies.slice(6, 10);

  return (
    <div className="min-h-screen bg-[#0b0b0f] pb-20">
      {/* Hero Carousel */}
      {currentHero && (
        <div className="relative w-full h-[520px] md:h-[640px] overflow-hidden bg-neutral-950">
          {/* Backdrop Image with gradient overlays */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
            style={{ backgroundImage: `url(${currentHero.backdropUrl})` }}
          >
            {/* Cinematic dark gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] via-[#0b0b0f]/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0f] via-[#0b0b0f]/80 to-transparent"></div>
          </div>

          {/* Hero Content */}
          <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 z-10">
            <div className="max-w-2xl space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e50914] text-white tracking-wide uppercase shadow-md shadow-red-900/40">
                  Featured Premiere
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-neutral-800/80 text-neutral-300 border border-neutral-700">
                  {currentHero.certificate}
                </span>
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{currentHero.rating.toFixed(1)} / 10</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-neutral-300 font-medium ml-1">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{currentHero.duration} min</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                {currentHero.title}
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base text-neutral-300 line-clamp-3 leading-relaxed max-w-xl">
                {currentHero.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigate(`/movies/${currentHero._id}`)}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-white font-bold text-sm tracking-wide transition-all shadow-xl shadow-red-900/40 hover:scale-105 active:scale-95"
                >
                  <Ticket className="w-4 h-4" />
                  Book Tickets Now
                </button>

                <button
                  onClick={() => setTrailerData({ isOpen: true, url: currentHero.trailerUrl, title: currentHero.title })}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 hover:text-white font-semibold text-sm tracking-wide border border-neutral-700/80 transition-all hover:border-neutral-500"
                >
                  <Play className="w-4 h-4 fill-white text-white" />
                  Watch Trailer
                </button>
              </div>
            </div>

            {/* Carousel navigation & Dots */}
            {heroMovies.length > 1 && (
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-neutral-800/40">
                <div className="flex items-center gap-2">
                  {heroMovies.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setHeroIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === heroIndex ? 'w-8 bg-[#e50914]' : 'w-2 bg-neutral-600 hover:bg-neutral-400'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHeroIndex((prev) => (prev - 1 + heroMovies.length) % heroMovies.length)}
                    className="p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setHeroIndex((prev) => (prev + 1) % heroMovies.length)}
                    className="p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Body Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* Genre Chips Row */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-2">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedGenre === g
                    ? 'bg-[#e50914] text-white shadow-lg shadow-red-900/30'
                    : 'bg-[#16161d] text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <Link
            to="/movies"
            className="flex items-center gap-1 text-xs font-semibold text-[#e50914] hover:text-red-400 whitespace-nowrap ml-4"
          >
            Explore All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Feature Highlights Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#16161d]/80 border border-neutral-800/80 flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-red-950/60 text-[#e50914] border border-red-900/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">5-Min Live Hold</h4>
              <p className="text-xs text-neutral-400">Lock your seats with zero double-booking</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#16161d]/80 border border-neutral-800/80 flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-red-950/60 text-[#e50914] border border-red-900/40">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">IMAX & Dolby Atmos</h4>
              <p className="text-xs text-neutral-400">Rows H-J acoustic prime experience</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#16161d]/80 border border-neutral-800/80 flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-red-950/60 text-[#e50914] border border-red-900/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">2-Hour Cancellation</h4>
              <p className="text-xs text-neutral-400">Full instant seat release & refund</p>
            </div>
          </div>
        </div>

        {/* Now Showing Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span className="w-2 h-5 bg-[#e50914] rounded-sm"></span>
                Now Showing in Theaters
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Book your tickets in Advance with real-time seat selection
              </p>
            </div>

            <Link
              to="/movies"
              className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1"
            >
              View More ({movies.length})
            </Link>
          </div>

          {loading ? (
            <MovieGridSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {nowShowing.map((movie) => (
                <div
                  key={movie._id}
                  className="glass-card rounded-2xl overflow-hidden flex flex-col group"
                >
                  {/* Poster Image */}
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Rating badge */}
                    <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-md bg-neutral-900/80 backdrop-blur-md border border-neutral-700/60 flex items-center gap-1 text-[11px] font-bold text-amber-300">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {movie.rating.toFixed(1)}
                    </div>

                    {/* Certificate & Language */}
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-bold text-white border border-white/20">
                        {movie.certificate}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-medium text-neutral-300 border border-white/20">
                        {movie.language}
                      </span>
                    </div>

                    {/* Quick Trailer Button on Hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTrailerData({ isOpen: true, url: movie.trailerUrl, title: movie.title });
                      }}
                      className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-[#e50914]/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl shadow-black/80 hover:scale-110"
                      title="Play Trailer"
                    >
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </button>
                  </div>

                  {/* Info Card */}
                  <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-white truncate group-hover:text-[#e50914] transition-colors">
                        {movie.title}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5 truncate">
                        {movie.genre.join(', ')} • {movie.duration}m
                      </p>
                    </div>

                    <button
                      onClick={() => navigate(`/movies/${movie._id}`)}
                      className="w-full py-2.5 px-3 rounded-xl bg-neutral-800/90 hover:bg-[#e50914] text-xs font-bold text-neutral-200 hover:text-white transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      Select Showtime
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Trending Spotlight / Coming Soon Section */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span className="w-2 h-5 bg-amber-500 rounded-sm"></span>
                Anticipated Blockbusters & Classics
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Highest rated theatrical experiences back on the big screen
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comingSoon.map((movie) => (
              <div
                key={movie._id}
                onClick={() => navigate(`/movies/${movie._id}`)}
                className="glass-card rounded-2xl p-4 flex gap-4 cursor-pointer group"
              >
                <div className="w-24 sm:w-28 aspect-[2/3] rounded-xl overflow-hidden shrink-0 bg-neutral-900">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="flex flex-col justify-between flex-1 py-1">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Top Pick
                      </span>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {movie.rating.toFixed(1)}
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-white group-hover:text-[#e50914] transition-colors">
                      {movie.title}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2">
                      {movie.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {movie.releaseDate}
                    </span>
                    <span className="text-xs font-semibold text-[#e50914] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      View Times <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerData.isOpen}
        onClose={() => setTrailerData({ ...trailerData, isOpen: false })}
        trailerUrl={trailerData.url}
        movieTitle={trailerData.title}
      />
    </div>
  );
};
