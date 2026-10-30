import mongoose from 'mongoose';

const lockedSeatSchema = new mongoose.Schema(
  {
    seat: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true }
  },
  { _id: false }
);

const showtimeSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true
    },
    theaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theater',
      required: true,
      index: true
    },
    screenName: {
      type: String,
      required: true
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true
    },
    time: {
      type: String, // HH:mm
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    bookedSeats: {
      type: [String],
      default: []
    },
    lockedSeats: {
      type: [lockedSeatSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Unique compound index on (theaterId, screenName, date, time)
showtimeSchema.index({ theaterId: 1, screenName: 1, date: 1, time: 1 }, { unique: true });

export default mongoose.model('Showtime', showtimeSchema);
