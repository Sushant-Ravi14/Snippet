const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;

    if (!text) {
      res.status(400);
      throw new Error('Comment text is required');
    }

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      text,
    });

    const populatedComment = await Comment.findById(comment._id).populate('author', 'username avatar');

    // Notify post author if not self
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        actor: req.user._id,
        type: 'comment',
        post: post._id
      });
    }

    res.status(201).json({
      _id: populatedComment._id,
      text: populatedComment.text,
      createdAt: populatedComment.createdAt,
      author: {
        _id: populatedComment.author._id,
        username: populatedComment.author.username,
        avatar: populatedComment.author.avatar,
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addComment };
