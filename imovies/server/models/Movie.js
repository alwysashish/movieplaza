import mongoose from 'mongoose';

const castSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true }
  },
  { _id: false }
);

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a movie title'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a movie synopsis'],
      trim: true
    },
    genre: {
      type: [String],
      required: true,
      index: true
    },
    language: {
      type: String,
      required: true,
      default: 'English',
      index: true
    },
    duration: {
      type: Number,
      required: true // in minutes
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
      index: true
    },
    posterUrl: {
      type: String,
      required: true
    },
    backdropUrl: {
      type: String,
      required: true
    },
    trailerUrl: {
      type: String,
      default: ''
    },
    cast: [castSchema],
    director: {
      type: String,
      required: true
    },
    releaseDate: {
      type: String,
      required: true
    },
    certificate: {
      type: String,
      enum: ['U', 'UA', 'A'],
      default: 'UA'
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Movie', movieSchema);
