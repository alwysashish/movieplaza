import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ShieldAlert, ArrowLeft, Info, Check, Sparkles, ChevronRight } from 'lucide-react';
import api from '../api/axios.js';
import { Showtime, LockedSeat } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useSocket } from '../hooks/useSocket.js';
import { useCountdown } from '../hooks/useCountdown.js';
import toast from 'react-hot-toast';

export const SeatSelectionPage: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [lockedSeats, setLockedSeats] = useState<LockedSeat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [lockExpiresAt, setLockExpiresAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [lockingInProgress, setLockingInProgress] = useState(false);

  // Connect to Socket.io
  const { socket, isConnected } = useSocket(showtimeId);

  // Handle countdown expiry
  const handleLockExpired = useCallback(() => {
    if (selectedSeats.length > 0) {
      toast.error('Your 5-minute seat lock has expired. Please select again.');
      setSelectedSeats([]);
      setLockExpiresAt(null);
    }
  }, [selectedSeats.length]);

  const { formatted, progressPercent, isExpired } = useCountdown(lockExpiresAt, handleLockExpired);

  // Initial Fetch of Showtime and Seats
  const fetchShowtimeData = useCallback(async () => {
    if (!showtimeId) return;
    try {
      const [stRes, seatsRes] = await Promise.all([
        api.get(`/showtimes/${showtimeId}`),
        api.get(`/showtimes/${showtimeId}/seats`)
      ]);

      if (stRes.data?.success) {
        setShowtime(stRes.data.showtime);
      }
      if (seatsRes.data?.success) {
        setBookedSeats(seatsRes.data.data.bookedSeats || []);
        setLockedSeats(seatsRes.data.data.lockedSeats || []);
      }
    } catch (err) {
      console.error('Failed to load showtime data', err);
      toast.error('Failed to load showtime');
    } finally {
      setLoading(false);
    }
  }, [showtimeId]);

  useEffect(() => {
    fetchShowtimeData();
  }, [fetchShowtimeData]);

  // Socket.io Real-time seat updates
  useEffect(() => {
    if (!socket) return;

    const handleSeatsUpdated = (data: { showtimeId: string; bookedSeats: string[]; lockedSeats: LockedSeat[] }) => {
      if (data.showtimeId === showtimeId) {
        setBookedSeats(data.bookedSeats || []);
        setLockedSeats(data.lockedSeats || []);

        // If one of our currently selected seats was booked by someone else, notify and remove
        setSelectedSeats((prev) => {
          const valid = prev.filter((s) => !data.bookedSeats.includes(s));
          if (valid.length !== prev.length) {
            toast.error('One or more of your selected seats was booked by another guest.');
          }
          return valid;
        });
      }
    };

    socket.on('seats-updated', handleSeatsUpdated);

    return () => {
      socket.off('seats-updated', handleSeatsUpdated);
    };
  }, [socket, showtimeId]);

  // 5-second polling fallback if socket is disconnected
  useEffect(() => {
    if (isConnected) return; // socket is working, no need to poll

    const interval = setInterval(async () => {
      if (!showtimeId) return;
      try {
        const res = await api.get(`/showtimes/${showtimeId}/seats`);
        if (res.data?.success) {
          setBookedSeats(res.data.data.bookedSeats || []);
          setLockedSeats(res.data.data.lockedSeats || []);
        }
      } catch (err) {
        // quiet error on poll
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected, showtimeId]);

  // Seat Rows: A to J
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsPerRow = 12;

  // Check seat state
  const getSeatStatus = (seatId: string) => {
    if (bookedSeats.includes(seatId)) return 'booked';

    const now = Date.now();
    const lock = lockedSeats.find((l) => l.seat === seatId && l.expiresAt > now);
    if (lock) {
      if (lock.userId === user?._id) {
        return 'selected';
      }
      return 'locked';
    }

    if (selectedSeats.includes(seatId)) return 'selected';

    return 'available';
  };

  // Pricing calculation
  const getSeatPrice = (seatId: string) => {
    const basePrice = showtime?.price || 15.0;
    const row = seatId.charAt(0);
    // Rows H, I, J are premium (+20%)
    if (['H', 'I', 'J'].includes(row)) {
      return Math.round(basePrice * 1.2 * 100) / 100;
    }
    return basePrice;
  };

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);
  }, [selectedSeats, showtime?.price]);

  // Toggle seat selection
  const handleSeatClick = async (seatId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to select and hold seats.');
      navigate('/login', { state: { from: { pathname: `/seat-selection/${showtimeId}` } } });
      return;
    }

    const currentStatus = getSeatStatus(seatId);
    if (currentStatus === 'booked' || currentStatus === 'locked') {
      return;
    }

    let updatedSeats: string[];
    if (selectedSeats.includes(seatId)) {
      updatedSeats = selectedSeats.filter((s) => s !== seatId);
    } else {
      if (selectedSeats.length >= 8) {
        toast.error('Maximum limit of 8 seats per booking.');
        return;
      }
      updatedSeats = [...selectedSeats, seatId];
    }

    setSelectedSeats(updatedSeats);

    // If seats are selected, call backend /lock to acquire the 5-minute server hold
    if (updatedSeats.length > 0) {
      setLockingInProgress(true);
      try {
        const res = await api.post(`/showtimes/${showtimeId}/lock`, { seats: updatedSeats });
        if (res.data?.success) {
          setLockExpiresAt(res.data.expiresAt);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Could not hold seats. Another guest may have just reserved them.');
        fetchShowtimeData();
      } finally {
        setLockingInProgress(false);
      }
    } else {
      // Released all
      try {
        await api.post(`/showtimes/${showtimeId}/unlock`, {});
        setLockExpiresAt(null);
      } catch {
        // silent
      }
    }
  };

  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat to proceed.');
      return;
    }

    // Save selection to session storage and navigate
    sessionStorage.setItem(
      'imovies_pending_order',
      JSON.stringify({
        showtimeId,
        seats: selectedSeats,
        totalPrice,
        lockExpiresAt
      })
    );

    navigate(`/checkout/${showtimeId}`);
  };

  if (loading || !showtime) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0b0f]">
        <div className="w-10 h-10 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-neutral-100 pb-32">
      {/* Top Navigation & Info Header */}
      <div className="bg-[#16161d] border-b border-neutral-800 sticky top-16 z-30 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/movies/${showtime.movieId}`)}
              className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {showtime.movie?.title}
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-normal">
                  {showtime.screenName}
                </span>
              </h1>
              <p className="text-xs text-neutral-400">
                {showtime.theater?.name} • {showtime.date} at {showtime.time}
              </p>
            </div>
          </div>

          {/* Countdown & Sync Badge */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {lockExpiresAt && selectedSeats.length > 0 && !isExpired && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/60 border border-red-800/80 animate-pulse">
                <Clock className="w-4 h-4 text-red-400" />
                <div className="text-xs">
                  <span className="text-neutral-400">Lock Expiry: </span>
                  <span className="font-mono font-bold text-red-300">{formatted}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`}></span>
              <span>{isConnected ? 'Live Sync Active' : 'Polling Sync'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Seat Map Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-10">
        {/* Screen Curve Graphic */}
        <div className="text-center space-y-3">
          <div className="screen-curve max-w-xl mx-auto"></div>
          <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
            Cinema Screen / All Eyes This Way
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-neutral-300 bg-[#16161d]/60 p-3 rounded-2xl border border-neutral-800/80">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#22222d] border border-neutral-600"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#e50914] border border-red-500 flex items-center justify-center text-[10px] text-white">
              <Check className="w-3 h-3" />
            </div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-amber-950/70 border border-amber-700/60 flex items-center justify-center text-[9px] text-amber-300 font-bold">
              Hold
            </div>
            <span>Locked (5m)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-neutral-800/40 border border-neutral-800/80 opacity-40 cursor-not-allowed"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-neutral-800 border-2 border-amber-500/60 flex items-center justify-center text-[9px] text-amber-400">
              <Sparkles className="w-3 h-3" />
            </div>
            <span>Premium Row (H-J +20%)</span>
          </div>
        </div>

        {/* Interactive Grid */}
        <div className="overflow-x-auto pb-6">
          <div className="min-w-[560px] max-w-2xl mx-auto space-y-2.5">
            {rows.map((row) => {
              const isPremium = ['H', 'I', 'J'].includes(row);
              return (
                <div key={row} className="flex items-center justify-between gap-2">
                  {/* Row Label Left */}
                  <span className={`w-6 text-xs font-bold text-center ${isPremium ? 'text-amber-400' : 'text-neutral-400'}`}>
                    {row}
                  </span>

                  {/* Seats 1-12 with Aisle Gap after 6 */}
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-center">
                    {Array.from({ length: seatsPerRow }).map((_, idx) => {
                      const seatNum = idx + 1;
                      const seatId = `${row}${seatNum}`;
                      const status = getSeatStatus(seatId);
                      const isAisleGap = seatNum === 6;

                      let seatClasses = '';
                      if (status === 'selected') {
                        seatClasses = 'bg-[#e50914] text-white border-red-500 shadow-md shadow-red-900/40 scale-105';
                      } else if (status === 'locked') {
                        seatClasses = 'bg-amber-950/70 text-amber-300 border-amber-700/60 cursor-not-allowed';
                      } else if (status === 'booked') {
                        seatClasses = 'bg-neutral-800/30 text-neutral-600 border-neutral-800/60 cursor-not-allowed';
                      } else {
                        // available
                        seatClasses = isPremium
                          ? 'bg-[#22222d] hover:bg-neutral-700 text-neutral-300 border border-amber-500/40 hover:border-amber-400 cursor-pointer'
                          : 'bg-[#22222d] hover:bg-neutral-700 text-neutral-300 border border-neutral-700/80 hover:border-neutral-500 cursor-pointer';
                      }

                      return (
                        <React.Fragment key={seatId}>
                          <button
                            onClick={() => handleSeatClick(seatId)}
                            disabled={status === 'booked' || status === 'locked'}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[11px] font-bold flex items-center justify-center transition-all ${seatClasses}`}
                            title={`${seatId} - $${getSeatPrice(seatId).toFixed(2)} (${status})`}
                          >
                            {seatNum}
                          </button>
                          {/* Aisle gap */}
                          {isAisleGap && <div className="w-4 sm:w-6"></div>}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Row Label Right */}
                  <span className={`w-6 text-xs font-bold text-center ${isPremium ? 'text-amber-400' : 'text-neutral-400'}`}>
                    {row}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing Notice */}
        <div className="text-center text-xs text-neutral-400 flex items-center justify-center gap-1.5">
          <Info className="w-4 h-4 text-neutral-500" />
          <span>Maximum 8 seats per order. Standard row price: ${showtime.price.toFixed(2)} | VIP rows H-J: ${(showtime.price * 1.2).toFixed(2)}</span>
        </div>
      </div>

      {/* Sticky Bottom Bar on Desktop and Mobile */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#16161d]/95 backdrop-blur-md border-t border-neutral-800 px-4 sm:px-6 lg:px-8 py-3.5 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-neutral-400">
              {selectedSeats.length === 0 ? 'No seats chosen' : `${selectedSeats.length} Seat(s): ${selectedSeats.join(', ')}`}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-white">${totalPrice.toFixed(2)}</span>
              <span className="text-[11px] text-neutral-400 font-medium">+ taxes & fees</span>
            </div>
          </div>

          <button
            onClick={handleProceedToCheckout}
            disabled={selectedSeats.length === 0 || lockingInProgress}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#e50914] hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-xl shadow-red-900/40"
          >
            {lockingInProgress ? 'Securing Seats...' : 'Proceed to Checkout'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
