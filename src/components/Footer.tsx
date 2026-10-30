import React from 'react';
import { Film, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-neutral-800/80 bg-[#07070a] text-neutral-400 text-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#e50914] flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black text-white tracking-wider">
                I<span className="text-[#e50914]">MOVIES</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Next-generation online cinema ticket booking platform. Experience instant seat locking, real-time sync, and seamless digital access.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 px-2.5 py-1 rounded-md w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Real-Time Atomic Booking Active</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-white transition-colors">Home Feed</Link></li>
              <li><Link to="/movies" className="hover:text-white transition-colors">Now Showing</Link></li>
              <li><Link to="/movies?genre=Sci-Fi" className="hover:text-white transition-colors">Sci-Fi Blockbusters</Link></li>
              <li><Link to="/movies?genre=Action" className="hover:text-white transition-colors">Action & Thrillers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Demo Accounts</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><span className="text-neutral-300 font-medium">Customer:</span> user@imovies.com / User@123</li>
              <li><span className="text-red-400 font-medium">Administrator:</span> admin@imovies.com / Admin@123</li>
              <li className="pt-2 text-[11px] text-neutral-500">
                Seat holds expire automatically after 5 minutes of inactivity.
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Cinema Experience</h4>
            <div className="bg-[#16161d] p-3 rounded-lg border border-neutral-800 text-xs space-y-2">
              <div className="flex items-center gap-2 text-neutral-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">Dolby Atmos & IMAX</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Premium seating rows H to J include 20% upgraded audio-visual immersion acoustics.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
          <p>© {new Date().getFullYear()} IMovies Entertainment Inc. All rights reserved.</p>
          <p className="flex items-center gap-1 text-neutral-400">
            Crafted for cinephiles worldwide
          </p>
        </div>
      </div>
    </footer>
  );
};
