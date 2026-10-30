import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Lock, Mail, Eye, EyeOff, UserCheck, Shield } from 'lucide-react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.js';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        login(res.data.token, res.data.user);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-[#e50914] flex items-center justify-center shadow-lg shadow-red-900/40">
              <Film className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h2 className="text-2xl font-black text-white tracking-tight">Sign In to IMovies</h2>
          <p className="text-xs text-neutral-400">
            Access your bookings, saved seats, and cinema privileges
          </p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="bg-[#16161d] p-3.5 rounded-2xl border border-neutral-800 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 text-center">
            One-Click Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('user@imovies.com', 'User@123')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-xs font-semibold text-neutral-200 hover:text-white transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              Demo Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@imovies.com', 'Admin@123')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-950/70 border border-red-900/50 text-xs font-semibold text-red-300 hover:text-red-200 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-red-400" />
              Demo Admin
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-[#16161d] rounded-2xl p-6 sm:p-8 border border-neutral-800 space-y-5 shadow-2xl">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 pl-10 bg-neutral-900 text-sm text-neutral-200 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#e50914]"
                />
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pl-10 pr-10 bg-neutral-900 text-sm text-neutral-200 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#e50914]"
                />
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-neutral-500 hover:text-neutral-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#e50914] hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-red-900/40 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="text-center text-xs text-neutral-400 pt-2 border-t border-neutral-800">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-[#e50914] hover:underline font-semibold">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
