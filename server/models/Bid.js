import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
  {
    gigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: true,
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [1, 'Price must be at least 1'],
    },
    status: {
      type: String,
      enum: ['pending', 'hired', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate bids
bidSchema.index({ gigId: 1, freelancerId: 1 }, { unique: true });

const Bid = mongoose.model('Bid', bidSchema);

export default Bid;
