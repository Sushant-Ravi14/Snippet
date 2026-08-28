const Notification = require('../models/Notification');

// @desc    Get current user's notifications
// @route   GET /api/notifications?page=&limit=
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('actor', 'username avatar')
      .populate({
        path: 'post',
        select: 'text image',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Optionally mark them as read when fetched, or have a separate route.
    // We'll mark them as read here for simplicity unless specified otherwise.
    const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
    if (unreadIds.length > 0) {
      await Notification.updateMany(
        { _id: { $in: unreadIds } },
        { $set: { read: true } }
      );
    }

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications };
