import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Lock, Mail, User, Phone, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.js';
import toast from 'react-hot-toast';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        phone
      });

      if (res.data?.success) {
        login(res.data.token, res.data.user);
        toast.success('Account created successfully! Welcome to IMovies.');
        navigate('/');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create account.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-[#e50914] flex items-center justify-center shadow-lg shadow-red-900/40">
              <Film className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h2 className="text-2xl font-black text-white tracking-tight">Create an Account</h2>
          <p className="text-xs text-neutral-400">
            Join thousands of cinema lovers booking seamless tickets
          </p>
        </div>

        <div className="bg-[#16161d] rounded-2xl p-6 sm:p-8 border border-neutral-800 space-y-5 shadow-2xl">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 pl-10 bg-neutral-900 text-sm text-neutral-200 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#e50914]"
                />
                <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              </div>
            </div>

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
                  placeholder="john@example.com"
                  className="w-full px-4 py-2.5 pl-10 bg-neutral-900 text-sm text-neutral-200 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#e50914]"
                />
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2.5 pl-10 bg-neutral-900 text-sm text-neutral-200 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#e50914]"
                />
                <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Password (min 6 characters)
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

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pl-10 bg-neutral-900 text-sm text-neutral-200 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#e50914]"
                />
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
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
                'Create Account'
              )}
            </button>
          </form>

          <div className="text-center text-xs text-neutral-400 pt-2 border-t border-neutral-800">
            Already registered?{' '}
            <Link to="/login" className="text-[#e50914] hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
