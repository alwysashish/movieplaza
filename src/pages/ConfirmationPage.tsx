import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Printer, Ticket, Calendar, Clock, MapPin, Download, Home } from 'lucide-react';
import api from '../api/axios.js';
import { Booking } from '../types/index.js';

export const ConfirmationPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(
    (location.state as any)?.booking || null
  );
  const [loading, setLoading] = useState(!booking);

  useEffect(() => {
    // Fire confetti celebration once on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    if (!booking && bookingId) {
      const fetchBooking = async () => {
        try {
          const res = await api.get(`/bookings/${bookingId}`);
          if (res.data?.success) {
            setBooking(res.data.booking);
          }
        } catch (err) {
          console.error('Failed to load booking confirmation', err);
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [booking, bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0b0f]">
        <div className="w-10 h-10 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // QR Code data payload
  const qrData = JSON.stringify({
    bookingId: booking.bookingId,
    movie: booking.movie?.title,
    seats: booking.seats,
    theater: booking.theater?.name,
    time: `${booking.showtime?.date} ${booking.showtime?.time}`
  });

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-neutral-100 py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8">
      {/* Success Banner */}
      <div className="text-center space-y-2 no-print">
        <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 mb-2 border border-emerald-500/30">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Booking Confirmed!
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          Your digital ticket has been issued. Show the QR code at the cinema entry gate.
        </p>
      </div>

      {/* Official Digital Ticket Card */}
      <div className="ticket-card bg-[#16161d] rounded-3xl border border-neutral-700/80 shadow-2xl overflow-hidden">
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-red-950/70 via-[#16161d] to-neutral-900 px-6 sm:px-8 py-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#e50914] flex items-center justify-center">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-lg text-white tracking-wider">
              IMOVIES <span className="text-xs font-normal text-neutral-400">BOARDING PASS</span>
            </span>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-neutral-400 uppercase font-semibold">Booking Reference</p>
            <p className="font-mono text-sm font-bold text-red-400">{booking.bookingId}</p>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between border-b border-neutral-800 pb-6">
            <div className="space-y-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e50914] text-white uppercase">
                {booking.movie?.certificate || 'UA'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {booking.movie?.title}
              </h2>
              <p className="text-xs text-neutral-400">
                {booking.movie?.duration} mins • {booking.showtime?.screenName}
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-3 bg-white rounded-2xl shadow-lg shrink-0 flex flex-col items-center">
              <QRCodeSVG value={qrData} size={110} level="M" />
              <span className="text-[9px] font-mono text-neutral-800 mt-1 font-bold">SCAN AT AUDITORIUM</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <p className="text-neutral-500 uppercase font-semibold text-[10px] flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date
              </p>
              <p className="font-bold text-white text-sm">{booking.showtime?.date}</p>
            </div>

            <div className="space-y-1">
              <p className="text-neutral-500 uppercase font-semibold text-[10px] flex items-center gap-1">
                <Clock className="w-3 h-3" /> Showtime
              </p>
              <p className="font-bold text-white text-sm">{booking.showtime?.time}</p>
            </div>

            <div className="space-y-1">
              <p className="text-neutral-500 uppercase font-semibold text-[10px] flex items-center gap-1">
                <Ticket className="w-3 h-3" /> Seats ({booking.seats.length})
              </p>
              <p className="font-extrabold text-[#e50914] text-sm">{booking.seats.join(', ')}</p>
            </div>

            <div className="space-y-1">
              <p className="text-neutral-500 uppercase font-semibold text-[10px]">Total Paid</p>
              <p className="font-bold text-white text-sm">${booking.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          {/* Theater Address */}
          <div className="p-3.5 bg-neutral-900/90 rounded-xl border border-neutral-800 flex items-start gap-2.5 text-xs">
            <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">{booking.theater?.name}</p>
              <p className="text-neutral-400 text-[11px]">{booking.theater?.address}, {booking.theater?.city}</p>
            </div>
          </div>
        </div>

        {/* Ticket Footer Bar */}
        <div className="bg-neutral-950 px-6 py-3 border-t border-neutral-800 text-[11px] text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Holder: {booking.user?.name || 'Customer'} ({booking.user?.email})</span>
          <span>Status: Confirmed & Paid</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 no-print pt-2">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-all border border-neutral-700"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF Ticket
        </button>

        <Link
          to="/my-bookings"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold transition-all shadow-lg shadow-red-900/30"
        >
          <Ticket className="w-4 h-4" />
          View in My Bookings
        </Link>

        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium transition-colors"
        >
          <Home className="w-4 h-4" />
          Home
        </Link>
      </div>
    </div>
  );
};
