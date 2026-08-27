const User = require('../models/User');

// @desc    Get public profile
// @route   GET /api/users/:username
// @access  Public (or Private depending on if we want followers only to see, but req says public)
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() }).select('-passwordHash');
    
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    let amIFollowing = false;
    if (req.user) {
      // If we pass protect middleware loosely or strictly. The route doesn't strictly say it needs JWT, but it might.
      // Let's assume protect is used, so req.user exists.
      amIFollowing = user.followers.includes(req.user._id);
    }

    res.json({
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      amIFollowing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle follow user
// @route   POST /api/users/:id/follow
// @access  Private
const toggleFollow = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      res.status(400);
      throw new Error('You cannot follow yourself');
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      res.status(404);
      throw new Error('User not found');
    }

    const isFollowing = targetUser.followers.includes(currentUserId);

    if (isFollowing) {
      // Unfollow
      targetUser.followers.pull(currentUserId);
      currentUser.following.pull(targetUserId);
    } else {
      // Follow
      targetUser.followers.push(currentUserId);
      currentUser.following.push(targetUserId);
      
      // Optionally create notification here, but we will handle it in a bit or rely on notification model
      const Notification = require('../models/Notification');
      await Notification.create({
        recipient: targetUserId,
        actor: currentUserId,
        type: 'follow'
      });
    }

    await targetUser.save();
    await currentUser.save();

    res.json({
      amIFollowing: !isFollowing,
      followersCount: targetUser.followers.length,
      followingCount: targetUser.following.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users
// @route   GET /api/users/search?q=&page=&limit=
// @access  Private
const searchUsers = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { username: { $regex: q, $options: 'i' } };

    const users = await User.find(query)
      .select('username avatar bio followers following')
      .skip(skip)
      .limit(limit);

    // Map to include amIFollowing and count
    const result = users.map((user) => ({
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      followersCount: user.followers.length,
      amIFollowing: user.followers.includes(req.user._id),
    }));

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, toggleFollow, searchUsers };
