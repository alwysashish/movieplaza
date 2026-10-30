import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Search, User as UserIcon, Ticket, Shield, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import toast from 'react-hot-toast';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    toast.success('Signed out successfully');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#0b0b0f]/90 backdrop-blur-md border-b border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Main Links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#e50914] to-red-600 flex items-center justify-center shadow-lg shadow-red-900/30 group-hover:scale-105 transition-transform">
                <Film className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-wider text-white flex items-center">
                  I<span className="text-[#e50914]">MOVIES</span>
                </span>
                <span className="text-[10px] tracking-widest text-neutral-400 uppercase -mt-1 font-semibold">Cinema Online</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link to="/" className="text-neutral-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link to="/movies" className="text-neutral-300 hover:text-white transition-colors">
                Movies
              </Link>
              {isAuthenticated && (
                <Link to="/my-bookings" className="text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-[#e50914]" />
                  My Tickets
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-950/40 border border-red-900/40">
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Search bar & Auth Actions */}
          <div className="hidden md:flex items-center gap-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search movies, genre, actor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 lg:w-80 px-4 py-2 pl-9 bg-neutral-900/90 text-sm text-neutral-200 rounded-full border border-neutral-700/60 focus:outline-none focus:border-[#e50914] focus:ring-1 focus:ring-[#e50914] transition-all placeholder:text-neutral-500"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            </form>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 rounded-full bg-neutral-900 border border-neutral-700/80 hover:border-neutral-500 transition-colors"
                >
                  <span className="text-xs font-semibold text-neutral-200 max-w-[100px] truncate">
                    {user?.name || 'My Account'}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-red-800 text-white text-xs font-bold flex items-center justify-center">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 mr-1" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-[#16161d] rounded-xl border border-neutral-800 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-neutral-800/80">
                      <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-neutral-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950 text-red-400 border border-red-900">
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      to="/my-bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-neutral-400" />
                      My Bookings
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-neutral-400" />
                      Profile Settings
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-red-400" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-neutral-800 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-400 hover:bg-red-950/40 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-[#e50914] hover:bg-red-700 text-xs font-semibold text-white transition-all shadow-md shadow-red-900/30"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-400 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#16161d] border-b border-neutral-800 px-4 pt-2 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative mt-2">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 pl-9 bg-neutral-900 text-sm text-neutral-200 rounded-lg border border-neutral-700"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          </form>

          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              Home
            </Link>
            <Link
              to="/movies"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              Movies Catalog
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
                >
                  My Tickets
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
                >
                  Profile Settings
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-red-950/50"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="border-t border-neutral-800 pt-4">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-neutral-400">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs rounded-md bg-red-950 text-red-400 border border-red-900"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-medium text-neutral-300 bg-neutral-800 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-medium text-white bg-[#e50914] rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
