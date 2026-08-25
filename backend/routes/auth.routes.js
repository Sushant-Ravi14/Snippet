const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  checkUsername,
  getMe,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.get('/check-username/:username', checkUsername);
router.get('/me', protect, getMe);

module.exports = router;
