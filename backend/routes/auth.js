
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, roleId } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hash });
    if (roleId) user.role = roleId;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });

    const user = await User.findOne({ email }).populate('role');
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
