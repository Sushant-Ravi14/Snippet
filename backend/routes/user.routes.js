const express = require('express');
const router = express.Router();
const {
  getProfile,
  toggleFollow,
  searchUsers,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

router.get('/search', protect, searchUsers);
router.get('/:username', protect, getProfile); // require protect so we can check amIFollowing reliably
router.post('/:id/follow', protect, toggleFollow);

module.exports = router;
