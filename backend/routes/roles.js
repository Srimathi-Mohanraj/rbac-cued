
const express = require('express');
const router = express.Router();
const Role = require('../models/Role');

// GET /api/roles  -> returns { roles: [...] }
router.get('/', async (req, res) => {
  try {
    const roles = await Role.find({}, { __v: 0 }).sort({ name: 1 });
    return res.json({ roles });
  } catch (err) {
    console.error('GET /api/roles error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/roles -> returns { role: {...} }
router.post('/', async (req, res) => {
  try {
    const { name, permissions } = req.body;
    if (!name) return res.status(400).json({ message: 'Role name required' });

    const exists = await Role.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Role already exists' });

    const role = new Role({ name, permissions: Array.isArray(permissions) ? permissions : (permissions ? [permissions] : []) });
    await role.save();
    return res.json({ role });
  } catch (err) {
    console.error('POST /api/roles error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
