import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [1, 'Budget must be at least 1'],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'assigned'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
gigSchema.index({ title: 'text', description: 'text' });

const Gig = mongoose.model('Gig', gigSchema);

export default Gig;
