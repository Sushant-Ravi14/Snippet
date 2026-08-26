const express = require('express');
const router = express.Router();
const {
  createPost,
  getFeed,
  getPostById,
  searchPosts,
  toggleLike,
  toggleDislike,
} = require('../controllers/post.controller');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Feed and Search must be before /:id so they don't match /:id
router.get('/feed', protect, getFeed);
router.get('/search', protect, searchPosts);

router.post('/', protect, upload.single('image'), createPost);
router.get('/:id', protect, getPostById);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/dislike', protect, toggleDislike);

// We will mount comment routes for a post in comment.routes, 
// or we can route POST /:id/comments here. Let's do it in comment.routes 
// by attaching it directly to the express app as /api/posts/:id/comments or using mergeParams.
// Actually, the requirements say "POST /api/posts/:id/comments", so it's easiest to mount it here or in comment.routes.
// We'll require comment controller here to keep the URL structure exact.

const { addComment } = require('../controllers/comment.controller');
router.post('/:id/comments', protect, addComment);

module.exports = router;
