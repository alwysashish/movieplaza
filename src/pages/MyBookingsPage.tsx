import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, Clock, MapPin, AlertTriangle, X, CheckCircle, Ban, Eye } from 'lucide-react';
import api from '../api/axios.js';
import { Booking } from '../types/index.js';
import toast from 'react-hot-toast';

export const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancellingLoading, setCancellingLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      if (res.data?.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Failed to load my bookings', err);
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const now = new Date().getTime();

  // Partition bookings into upcoming vs past
  const upcomingBookings = bookings.filter((b) => {
    if (b.status === 'cancelled') return false;
    if (!b.showtime) return false;
    const showDateTime = new Date(`${b.showtime.date}T${b.showtime.time}:00`).getTime();
    return showDateTime >= now;
  });

  const pastBookings = bookings.filter((b) => {
    if (b.status === 'cancelled') return true;
    if (!b.showtime) return true;
    const showDateTime = new Date(`${b.showtime.date}T${b.showtime.time}:00`).getTime();
    return showDateTime < now;
  });

  const displayedList = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  // Check if eligible to cancel (at least 2 hours before showtime)
  const canCancel = (booking: Booking) => {
    if (booking.status === 'cancelled') return false;
    if (!booking.showtime) return false;
    const showDateTime = new Date(`${booking.showtime.date}T${booking.showtime.time}:00`).getTime();
    const diffHours = (showDateTime - now) / (1000 * 60 * 60);
    return diffHours >= 2;
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setCancellingLoading(true);

    try {
      const res = await api.delete(`/bookings/${cancellingBooking._id}`);
      if (res.data?.success) {
        toast.success('Booking cancelled successfully and seats released.');
        setCancellingBooking(null);
        fetchBookings();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-neutral-100 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Ticket className="w-6 h-6 text-[#e50914]" />
            My Movie Tickets
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Access your active cinema passes, past records, and manage cancellations
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-[#16161d] p-1.5 rounded-xl border border-neutral-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-[#e50914] text-white shadow-md shadow-red-900/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'past'
                ? 'bg-[#e50914] text-white shadow-md shadow-red-900/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Past & Cancelled ({pastBookings.length})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : displayedList.length === 0 ? (
        <div className="text-center py-20 bg-[#16161d]/50 rounded-2xl border border-neutral-800 space-y-4">
          <Ticket className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No {activeTab} bookings found</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            You don't have any {activeTab} movie reservations. Browse our latest releases and secure your seats today!
          </p>
          <Link
            to="/movies"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e50914] text-white text-xs font-bold hover:bg-red-700 transition-colors"
          >
            Explore Movies
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedList.map((booking) => {
            const eligibleForCancel = canCancel(booking);
            const isCancelled = booking.status === 'cancelled';

            return (
              <div
                key={booking._id}
                className={`bg-[#16161d] rounded-2xl border ${
                  isCancelled ? 'border-neutral-800 opacity-60' : 'border-neutral-800 hover:border-neutral-700'
                } p-5 sm:p-6 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center justify-between`}
              >
                {/* Poster & Main Details */}
                <div className="flex gap-4 sm:gap-6 items-center">
                  <div className="w-20 sm:w-24 aspect-[2/3] rounded-xl overflow-hidden bg-neutral-900 shrink-0">
                    <img
                      src={booking.movie?.posterUrl}
                      alt={booking.movie?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-red-400 px-2 py-0.5 rounded bg-red-950/40 border border-red-900/40">
                        {booking.bookingId}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          isCancelled
                            ? 'bg-neutral-800 text-neutral-400'
                            : 'bg-emerald-950/60 text-emerald-300 border border-emerald-900/50'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-white">{booking.movie?.title}</h3>

                    <p className="text-xs text-neutral-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                      {booking.theater?.name} • {booking.showtime?.screenName}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-300 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                        {booking.showtime?.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-neutral-500" />
                        {booking.showtime?.time}
                      </span>
                      <span className="font-bold text-white">
                        Seats: <span className="text-[#e50914]">{booking.seats.join(', ')}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-800">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-neutral-400 uppercase font-semibold">Total Paid</p>
                    <p className="text-lg font-black text-white">${booking.totalAmount.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/confirmation/${booking._id}`}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors border border-neutral-700"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Ticket
                    </Link>

                    {eligibleForCancel && (
                      <button
                        onClick={() => setCancellingBooking(booking)}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-950 text-xs font-semibold text-red-400 border border-red-900/40 transition-colors"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#16161d] rounded-2xl max-w-md w-full border border-neutral-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-900/60">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Cancel Ticket Reservation</h3>
                <p className="text-xs text-neutral-400">Booking: {cancellingBooking.bookingId}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to cancel your reservation for{' '}
              <strong className="text-white">{cancellingBooking.movie?.title}</strong>? Your seats{' '}
              <strong className="text-[#e50914]">{cancellingBooking.seats.join(', ')}</strong> will be immediately released to the public.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setCancellingBooking(null)}
                disabled={cancellingLoading}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white"
              >
                Keep Reservation
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancellingLoading}
                className="px-4 py-2 rounded-xl bg-[#e50914] text-xs font-bold text-white hover:bg-red-700 flex items-center gap-2"
              >
                {cancellingLoading ? 'Releasing Seats...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
