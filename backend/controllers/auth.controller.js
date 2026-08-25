const User = require('../models/User');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');

// @desc    Signup user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400);
      throw new Error('Please provide username and password');
    }

    const userExists = await User.findOne({ username: username.toLowerCase() });

    if (userExists) {
      res.status(400);
      throw new Error('Username already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      username: username.toLowerCase(),
      passwordHash,
    });

    if (user) {
      res.status(201).json({
        user: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
          bio: user.bio,
          followersCount: user.followers.length,
          followingCount: user.following.length,
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      return next(new Error('Username already exists'));
    }
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400);
      throw new Error('Please provide username and password');
    }

    const user = await User.findOne({ username: username.toLowerCase() });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      res.json({
        user: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
          bio: user.bio,
          followersCount: user.followers.length,
          followingCount: user.following.length,
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid username or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Check if username is available
// @route   GET /api/auth/check-username/:username
// @access  Public
const checkUsername = async (req, res, next) => {
  try {
    const username = req.params.username.toLowerCase();
    const user = await User.findOne({ username });
    res.json({ available: !user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, checkUsername, getMe };
