import mongoose from 'mongoose';

const screenSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rows: { type: Number, default: 10 },
    seatsPerRow: { type: Number, default: 12 }
  },
  { _id: false }
);

const theaterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide theater name'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true,
      index: true
    },
    address: {
      type: String,
      required: [true, 'Please provide theater address'],
      trim: true
    },
    screens: [screenSchema]
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Theater', theaterSchema);
