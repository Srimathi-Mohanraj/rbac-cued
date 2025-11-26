const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Role = require("../models/Role");
const upload = require("../middleware/upload");

// GET all staff
router.get("/", async (req, res) => {
  try {
    const staff = await User.find()
      .populate("role", "name permissions")   
      .sort({ createdAt: -1 });

    res.json({ staff });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// ADD Staff
router.post("/", upload.single("avatar"), async (req, res) => {
  try {
    const { name, email, phone, joiningDate, role } = req.body;

    const newUser = new User({
      name,
      email,
      phone,
      joiningDate,
      role: role || null,
      avatar: req.file ? `uploads/${req.file.filename}` : "",
    });

    await newUser.save();
    res.json({ message: "Staff added", user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE Staff
router.put("/:id", upload.single("avatar"), async (req, res) => {
  try {
    const { name, email, phone, joiningDate, role } = req.body;

    const updateData = {
      name,
      email,
      phone,
      joiningDate,
      role: role || null,
    };

    if (req.file) {
      updateData.avatar = `uploads/${req.file.filename}`;
    }

    const updated = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate("role");

    res.json({ message: "Staff Updated", user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Staff
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Staff deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
