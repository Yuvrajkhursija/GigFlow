import express from 'express';
import Bid from '../models/Bid.js';
import Gig from '../models/Gig.js';
import { protect } from '../middleware/authMiddleware.js';
import { bidSchema } from '../utils/validation.js';
import mongoose from 'mongoose';

const router = express.Router();

// Create bid (protected)
router.post('/', protect, async (req, res) => {
  const validatedData = bidSchema.parse(req.body);

  const { gigId, message, price } = validatedData;

  // Check if gig exists and is open
  const gig = await Gig.findById(gigId);
  if (!gig) {
    return res.status(404).json({
      success: false,
      message: 'Gig not found',
    });
  }

  if (gig.status !== 'open') {
    return res.status(400).json({
      success: false,
      message: 'Gig is no longer accepting bids',
    });
  }

  // Check if user is not the owner
  if (gig.ownerId.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot bid on your own gig',
    });
  }

  // Check if bid already exists
  const existingBid = await Bid.findOne({
    gigId,
    freelancerId: req.user._id,
  });

  if (existingBid) {
    return res.status(400).json({
      success: false,
      message: 'You have already placed a bid on this gig',
    });
  }

  // Create bid
  const bid = await Bid.create({
    gigId,
    freelancerId: req.user._id,
    message,
    price,
  });

  const populatedBid = await Bid.findById(bid._id)
    .populate('gigId', 'title')
    .populate('freelancerId', 'username');

  res.status(201).json({
    success: true,
    data: populatedBid,
  });
});

// Get bids for a gig (owner only, protected)
router.get('/:gigId', protect, async (req, res) => {
  const { gigId } = req.params;

  // Check if gig exists
  const gig = await Gig.findById(gigId);
  if (!gig) {
    return res.status(404).json({
      success: false,
      message: 'Gig not found',
    });
  }

  // Check if user is the owner
  if (gig.ownerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view these bids',
    });
  }

  const bids = await Bid.find({ gigId })
    .populate('freelancerId', 'username email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: bids,
  });
});

// Get my bids (protected)
router.get('/mine', protect, async (req, res) => {
  const bids = await Bid.find({ freelancerId: req.user._id })
    .populate('gigId', 'title description budget status ownerId')
    .populate('freelancerId', 'username')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: bids,
  });
});

// Hire a bid (atomic transaction, protected)
router.patch('/:bidId/hire', protect, async (req, res) => {
  const { bidId } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the bid
    const bid = await Bid.findById(bidId).session(session);
    if (!bid) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Bid not found',
      });
    }

    // Check if bid is still pending
    if (bid.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Bid is no longer available',
      });
    }

    // Get the gig
    const gig = await Gig.findById(bid.gigId).session(session);
    if (!gig) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Gig not found',
      });
    }

    // Check if user is the gig owner
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to hire for this gig',
      });
    }

    // Check if gig is still open
    if (gig.status !== 'open') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Gig is no longer open',
      });
    }

    // Atomic update: set gig to assigned, chosen bid to hired, others to rejected
    await Gig.updateOne(
      { _id: gig._id, status: 'open' },
      { $set: { status: 'assigned' } },
      { session }
    );

    await Bid.updateOne(
      { _id: bidId, status: 'pending' },
      { $set: { status: 'hired' } },
      { session }
    );

    await Bid.updateMany(
      { gigId: gig._id, _id: { $ne: bidId }, status: 'pending' },
      { $set: { status: 'rejected' } },
      { session }
    );

    await session.commitTransaction();

    // Get updated bid with populated fields
    const updatedBid = await Bid.findById(bidId)
      .populate('gigId', 'title')
      .populate('freelancerId', 'username');

    // Emit Socket.io event for real-time notification
    req.io.to(bid.freelancerId.toString()).emit('notification', {
      message: `You have been hired for ${gig.title}!`,
      type: 'hired',
    });

    // Create notification in database
    const Notification = (await import('../models/Notification.js')).default;
    await Notification.create({
      receiverId: bid.freelancerId,
      message: `You have been hired for ${gig.title}!`,
    });

    res.json({
      success: true,
      data: updatedBid,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

export default router;
