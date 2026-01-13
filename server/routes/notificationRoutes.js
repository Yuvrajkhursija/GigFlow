import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all notifications for current user (protected)
router.get('/', protect, async (req, res) => {
  const notifications = await Notification.find({
    receiverId: req.user._id,
  })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({
    success: true,
    data: notifications,
  });
});

// Mark notification as read (protected)
router.patch('/:id/read', protect, async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found',
    });
  }

  // Check if user owns the notification
  if (notification.receiverId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized',
    });
  }

  notification.isRead = true;
  await notification.save();

  res.json({
    success: true,
    data: notification,
  });
});

export default router;
