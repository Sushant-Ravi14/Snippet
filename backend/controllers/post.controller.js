const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const fs = require('fs');
const path = require('path');

const formatPostResponse = (post, currentUserId) => {
  return {
    _id: post._id,
    title: post.title,
    author: post.author ? {
      _id: post.author._id,
      username: post.author.username,
      avatar: post.author.avatar,
    } : {
      _id: 'deleted',
      username: 'deleted_user',
      avatar: 'default-avatar.png'
    },
    text: post.text,
    image: post.image,
    location: post.location,
    createdAt: post.createdAt,
    likesCount: post.likes.length,
    dislikesCount: post.dislikes.length,
    likedByMe: post.likes.includes(currentUserId),
    dislikedByMe: post.dislikes.includes(currentUserId),
  };
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { title, text, latitude, longitude, locality } = req.body;
    let imageData = null;

    if (req.file) {
      // Read the uploaded file and convert to base64 data URI
      // This stores the image in MongoDB so it survives Render restarts
      const filePath = req.file.path;
      const fileBuffer = fs.readFileSync(filePath);
      const base64 = fileBuffer.toString('base64');
      const mimeType = req.file.mimetype || 'image/jpeg';
      imageData = `data:${mimeType};base64,${base64}`;
      
      // Clean up the temp file from disk
      try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
    }

    let location = undefined;
    if (latitude && longitude && locality) {
      location = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        locality,
      };
    }

    const post = await Post.create({
      author: req.user._id,
      title,
      text,
      image: imageData,
      location,
    });

    const populatedPost = await Post.findById(post._id).populate('author', 'username avatar');

    res.status(201).json(formatPostResponse(populatedPost, req.user._id));
  } catch (error) {
    next(error);
  }
};

// @desc    Get feed (posts from followed users + self)
// @route   GET /api/posts/feed?page=&limit=
// @access  Private
const getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.user._id);
    // Use a plain array copy to avoid mutating the Mongoose document's following array
    const followingIds = [...currentUser.following, req.user._id];

    const posts = await Post.find({ author: { $in: followingIds } })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const formattedPosts = posts.map(post => formatPostResponse(post, req.user._id));

    res.json(formattedPosts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Private
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username avatar');

    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    // Also get comments for this post
    const Comment = require('../models/Comment');
    const comments = await Comment.find({ post: post._id })
      .populate('author', 'username avatar')
      .sort({ createdAt: 1 });

    const response = formatPostResponse(post, req.user._id);
    response.comments = comments.map(c => ({
      _id: c._id,
      text: c.text,
      createdAt: c.createdAt,
      author: {
        _id: c.author._id,
        username: c.author.username,
        avatar: c.author.avatar,
      }
    }));

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Search posts
// @route   GET /api/posts/search?q=&page=&limit=
// @access  Private
const searchPosts = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ text: { $regex: q, $options: 'i' } })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const formattedPosts = posts.map(post => formatPostResponse(post, req.user._id));

    res.json(formattedPosts);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    const currentUserId = req.user._id;
    const isLiked = post.likes.includes(currentUserId);

    if (isLiked) {
      post.likes.pull(currentUserId);
    } else {
      post.likes.push(currentUserId);
      post.dislikes.pull(currentUserId); // clear dislike if present
      
      // Notify author if it's not their own post (avoid duplicate notifications)
      if (post.author.toString() !== currentUserId.toString()) {
        const existingNotification = await Notification.findOne({
          recipient: post.author,
          actor: currentUserId,
          type: 'like',
          post: post._id,
        });
        if (!existingNotification) {
          await Notification.create({
            recipient: post.author,
            actor: currentUserId,
            type: 'like',
            post: post._id
          });
        }
      }
    }

    await post.save();

    res.json({
      likesCount: post.likes.length,
      dislikesCount: post.dislikes.length,
      likedByMe: !isLiked,
      dislikedByMe: false,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle dislike post
// @route   POST /api/posts/:id/dislike
// @access  Private
const toggleDislike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    const currentUserId = req.user._id;
    const isDisliked = post.dislikes.includes(currentUserId);

    if (isDisliked) {
      post.dislikes.pull(currentUserId);
    } else {
      post.dislikes.push(currentUserId);
      post.likes.pull(currentUserId); // clear like if present
    }

    await post.save();

    res.json({
      likesCount: post.likes.length,
      dislikesCount: post.dislikes.length,
      likedByMe: false,
      dislikedByMe: !isDisliked,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPost, getFeed, getPostById, searchPosts, toggleLike, toggleDislike };
