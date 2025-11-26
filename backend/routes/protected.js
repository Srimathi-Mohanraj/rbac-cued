const express = require('express');
const router = express.Router();
const { authMiddleware, permit } = require('../middleware/auth');

// only users with 'create:post' can create
router.post('/post', authMiddleware, permit('create:post'), (req,res) => {
  res.json({ message: 'Protected post created by ' + req.user.name });
});

// only users with 'read:post' can view
router.get('/post', authMiddleware, permit('read:post'), (req,res) => {
  res.json({ message: 'You can read posts.' });
});

module.exports = router;
