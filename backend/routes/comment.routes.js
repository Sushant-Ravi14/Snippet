const express = require('express');
const router = express.Router();
// Routes for comments on posts are handled in post.routes.js (e.g. POST /api/posts/:id/comments)
// If we had standalone comment routes (e.g. DELETE /api/comments/:id), we would add them here.
// For now, this router is empty but exists to satisfy the server.js require.

module.exports = router;
