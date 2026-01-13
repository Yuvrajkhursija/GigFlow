import express from 'express';
import Gig from '../models/Gig.js';
import { protect } from '../middleware/authMiddleware.js';
import { gigSchema } from '../utils/validation.js';

const router = express.Router();

// Get all open gigs (with optional search)
router.get('/', async (req, res) => {
  const { search } = req.query;
  const query = { status: 'open' };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const gigs = await Gig.find(query)
    .populate('ownerId', 'username')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: gigs,
  });
});

// Get single gig
router.get('/:gigId', async (req, res) => {
  const gig = await Gig.findById(req.params.gigId).populate(
    'ownerId',
    'username'
  );

  if (!gig) {
    return res.status(404).json({
      success: false,
      message: 'Gig not found',
    });
  }

  res.json({
    success: true,
    data: gig,
  });
});

// Create gig (protected)
router.post('/', protect, async (req, res) => {
  const validatedData = gigSchema.parse(req.body);

  const gig = await Gig.create({
    ...validatedData,
    ownerId: req.user._id,
  });

  const populatedGig = await Gig.findById(gig._id).populate(
    'ownerId',
    'username'
  );

  res.status(201).json({
    success: true,
    data: populatedGig,
  });
});

// Get my posted gigs (protected)
router.get('/mine', protect, async (req, res) => {
  const gigs = await Gig.find({ ownerId: req.user._id })
    .populate('ownerId', 'username')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: gigs,
  });
});

export default router;
