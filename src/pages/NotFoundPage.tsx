import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-900/40 text-[#e50914] flex items-center justify-center mb-6">
        <Film className="w-8 h-8" />
      </div>

      <h1 className="text-6xl font-black text-white tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold text-neutral-200 mb-3">Scene Not Found</h2>
      <p className="text-xs text-neutral-400 max-w-sm mb-8 leading-relaxed">
        The screening room or feature film reel you are looking for has been moved, archived, or does not exist.
      </p>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e50914] text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-900/30"
        >
          <Home className="w-4 h-4" />
          Return to Box Office
        </Link>
        <Link
          to="/movies"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Explore Movies
        </Link>
      </div>
    </div>
  );
};
