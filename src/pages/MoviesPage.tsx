import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Star, Clock, Ticket, Play, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios.js';
import { Movie } from '../types/index.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { MovieGridSkeleton } from '../components/SkeletonLoader.js';
import { TrailerModal } from '../components/TrailerModal.js';

export const MoviesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialSearch = searchParams.get('search') || '';
  const initialGenre = searchParams.get('genre') || 'All';
  const initialLanguage = searchParams.get('language') || 'All';
  const initialSort = searchParams.get('sort') || 'rating_desc';

  const [search, setSearch] = useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [sortBy, setSortBy] = useState(initialSort);
  const [page, setPage] = useState(1);

  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [trailerData, setTrailerData] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: ''
  });

  const debouncedSearch = useDebounce(search, 350);

  const genres = ['All', 'Action', 'Sci-Fi', 'Drama', 'Adventure', 'Animation', 'Crime', 'Romance', 'Thriller', 'Biography'];
  const languages = ['All', 'English', 'Telugu', 'Korean'];

  useEffect(() => {
    // Keep URL search params in sync
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedGenre !== 'All') params.genre = selectedGenre;
    if (selectedLanguage !== 'All') params.language = selectedLanguage;
    if (sortBy !== 'rating_desc') params.sort = sortBy;
    if (page > 1) params.page = String(page);
    setSearchParams(params);

    const fetchMovies = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: String(page),
          limit: '12',
          sort: sortBy,
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(selectedGenre !== 'All' && { genre: selectedGenre }),
          ...(selectedLanguage !== 'All' && { language: selectedLanguage })
        });

        const res = await api.get(`/movies?${query.toString()}`);
        if (res.data?.success) {
          setMovies(res.data.movies);
          setTotalPages(res.data.totalPages || 1);
          setTotal(res.data.total || 0);
        }
      } catch (err) {
        console.error('Failed to fetch movies', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [debouncedSearch, selectedGenre, selectedLanguage, sortBy, page]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedGenre('All');
    setSelectedLanguage('All');
    setSortBy('rating_desc');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-neutral-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-[#e50914] rounded-sm"></span>
            Explore Movies & Cinema
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Discover {total} feature films currently screening or coming soon
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title, cast, director..."
            className="w-full px-4 py-2.5 pl-10 bg-[#16161d] text-sm text-neutral-200 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] placeholder:text-neutral-500 transition-all"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-3 text-xs text-neutral-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="bg-[#16161d]/80 rounded-2xl p-4 border border-neutral-800 flex flex-wrap items-center justify-between gap-4">
        {/* Genre Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full lg:w-auto">
          <Filter className="w-4 h-4 text-neutral-400 shrink-0 mr-1" />
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => {
                setSelectedGenre(g);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedGenre === g
                  ? 'bg-[#e50914] text-white shadow-md shadow-red-900/30'
                  : 'bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Dropdowns & Reset */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          {/* Language selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => {
              setSelectedLanguage(e.target.value);
              setPage(1);
            }}
            className="bg-neutral-900 text-xs text-neutral-300 rounded-lg px-3 py-2 border border-neutral-700 focus:outline-none focus:border-[#e50914]"
          >
            {languages.map((l) => (
              <option key={l} value={l}>
                {l === 'All' ? 'All Languages' : l}
              </option>
            ))}
          </select>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="bg-neutral-900 text-xs text-neutral-300 rounded-lg px-3 py-2 border border-neutral-700 focus:outline-none focus:border-[#e50914]"
          >
            <option value="rating_desc">Highest Rated</option>
            <option value="release_desc">Newest Releases</option>
            <option value="release_asc">Classic First</option>
            <option value="title_asc">Title A-Z</option>
          </select>

          <button
            onClick={handleResetFilters}
            className="p-2 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800 transition-colors"
            title="Reset All Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Movie Grid */}
      {loading ? (
        <MovieGridSkeleton count={8} />
      ) : movies.length === 0 ? (
        <div className="text-center py-16 space-y-4 bg-[#16161d]/50 rounded-2xl border border-neutral-800/80">
          <p className="text-lg font-bold text-white">No movies found</p>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            We couldn't find any movies matching your current filters. Try searching with a different term or resetting filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-[#e50914] text-white text-xs font-bold hover:bg-red-700 transition-colors inline-flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {movies.map((movie) => (
            <div
              key={movie._id}
              className="glass-card rounded-2xl overflow-hidden flex flex-col group"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-md bg-neutral-900/80 backdrop-blur-md border border-neutral-700/60 flex items-center gap-1 text-[11px] font-bold text-amber-300">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {movie.rating.toFixed(1)}
                </div>

                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-bold text-white border border-white/20">
                    {movie.certificate}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-medium text-neutral-300 border border-white/20">
                    {movie.language}
                  </span>
                </div>

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

              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white truncate group-hover:text-[#e50914] transition-colors">
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                    <span className="truncate">{movie.genre.join(', ')}</span>
                    <span>•</span>
                    <span className="shrink-0 flex items-center gap-0.5">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      {movie.duration}m
                    </span>
                  </div>
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const pNum = idx + 1;
            return (
              <button
                key={pNum}
                onClick={() => setPage(pNum)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                  page === pNum
                    ? 'bg-[#e50914] text-white shadow-md shadow-red-900/40'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {pNum}
              </button>
            );
          })}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

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
