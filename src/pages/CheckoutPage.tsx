import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Lock, Ticket, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../api/axios.js';
import { Showtime } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import toast from 'react-hot-toast';

export const CheckoutPage: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [seats, setSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('789');
  const [cardName, setCardName] = useState(user?.name || 'Alex Johnson');

  useEffect(() => {
    const rawOrder = sessionStorage.getItem('imovies_pending_order');
    if (!rawOrder) {
      toast.error('No pending seat selection found.');
      navigate('/movies');
      return;
    }

    try {
      const parsed = JSON.parse(rawOrder);
      if (parsed.showtimeId !== showtimeId || !parsed.seats || parsed.seats.length === 0) {
        toast.error('Invalid order session.');
        navigate('/movies');
        return;
      }
      setSeats(parsed.seats);
    } catch {
      navigate('/movies');
      return;
    }

    const fetchShowtime = async () => {
      try {
        const res = await api.get(`/showtimes/${showtimeId}`);
        if (res.data?.success) {
          setShowtime(res.data.showtime);
        }
      } catch (err) {
        toast.error('Failed to load showtime details');
      } finally {
        setLoading(false);
      }
    };

    fetchShowtime();
  }, [showtimeId, navigate]);

  if (loading || !showtime) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0b0f]">
        <div className="w-10 h-10 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Price calculations
  let subtotal = 0;
  seats.forEach((seat) => {
    const row = seat.charAt(0);
    const isPremium = ['H', 'I', 'J'].includes(row);
    subtotal += isPremium ? showtime.price * 1.2 : showtime.price;
  });

  const convenienceFee = seats.length * 1.50;
  const taxes = subtotal * 0.08;
  const grandTotal = subtotal + convenienceFee + taxes;

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.post('/bookings', {
        showtimeId,
        seats
      });

      if (res.data?.success && res.data?.booking) {
        toast.success('Payment authorized and booking confirmed!');
        sessionStorage.removeItem('imovies_pending_order');
        navigate(`/confirmation/${res.data.booking._id}`, {
          state: { booking: res.data.booking }
        });
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.error(err.response?.data?.message || 'Seat conflict occurred.');
        navigate(`/seat-selection/${showtimeId}`);
      } else {
        toast.error(err.response?.data?.message || 'Transaction could not be completed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-neutral-100 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <button
          onClick={() => navigate(`/seat-selection/${showtimeId}`)}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#e50914]" />
            Secure Order Checkout
          </h1>
          <p className="text-xs text-neutral-400">
            Review your ticket selection and authorize payment
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Payment Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#16161d] rounded-2xl p-6 border border-neutral-800 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-red-950/60 text-[#e50914] border border-red-900/40">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Payment Method</h3>
                  <p className="text-[11px] text-neutral-400">Instant test gateway simulation</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 256-bit Encrypted
              </span>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Name on Card
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-900 text-sm text-neutral-200 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#e50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-900 text-sm text-neutral-200 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#e50914] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="text"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-4 py-2.5 bg-neutral-900 text-sm text-neutral-200 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#e50914] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Security CVV
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-900 text-sm text-neutral-200 rounded-xl border border-neutral-700 focus:outline-none focus:border-[#e50914] font-mono"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-400 space-y-1">
                <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sandbox Mock Payment Active</span>
                </div>
                <p className="text-[11px]">
                  No real credit card will be charged. Click below to atomically reserve and generate your official digital ticket.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl bg-[#e50914] hover:bg-red-700 disabled:opacity-50 text-white font-extrabold text-sm tracking-wide transition-all shadow-xl shadow-red-900/40 flex items-center justify-center gap-2 mt-4"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Authorizing Reservation...
                  </span>
                ) : (
                  <span>Pay & Confirm ${grandTotal.toFixed(2)}</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#16161d] rounded-2xl p-6 border border-neutral-800 space-y-5">
            <h3 className="font-bold text-base text-white border-b border-neutral-800 pb-3 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#e50914]" />
              Order Summary
            </h3>

            {/* Movie Snippet */}
            <div className="flex gap-3">
              <div className="w-16 h-24 rounded-lg overflow-hidden bg-neutral-900 shrink-0">
                <img
                  src={showtime.movie?.posterUrl}
                  alt={showtime.movie?.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="font-bold text-sm text-white">{showtime.movie?.title}</h4>
                <p className="text-xs text-neutral-400">{showtime.theater?.name}</p>
                <p className="text-xs text-neutral-400">
                  {showtime.date} • {showtime.time} ({showtime.screenName})
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-300">
                    {showtime.movie?.certificate}
                  </span>
                  <span className="text-[11px] text-neutral-400">{showtime.movie?.language}</span>
                </div>
              </div>
            </div>

            {/* Selected Seats Badges */}
            <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800 space-y-1.5">
              <p className="text-[11px] font-semibold text-neutral-400 uppercase">Seats Reserved ({seats.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {seats.map((seat) => (
                  <span
                    key={seat}
                    className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-[#e50914]/20 text-red-300 border border-red-800/60"
                  >
                    {seat}
                  </span>
                ))}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2.5 text-xs border-t border-neutral-800 pt-3">
              <div className="flex justify-between text-neutral-300">
                <span>Tickets Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Convenience Fee</span>
                <span>${convenienceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Estimated Taxes (8%)</span>
                <span>${taxes.toFixed(2)}</span>
              </div>

              <div className="border-t border-neutral-800 pt-3 flex justify-between text-base font-black text-white">
                <span>Total Amount</span>
                <span className="text-[#e50914]">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
