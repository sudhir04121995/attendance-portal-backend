const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, isAdmin, isTeacherOrAdmin } = require('../middleware/auth');

// Get all users - Admin only
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get students only - Admin/Teacher
router.get('/students', auth, isTeacherOrAdmin, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single user - Admin only or self
router.get('/:id', auth, async (req, res) => {
  try {
    // Allow if admin or requesting own data
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create user - Admin only
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role, department, employeeId } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = new User({ name, email, password, role, department, employeeId });
    await user.save();
    
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user - Admin only
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { name, email, role, department, employeeId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, department, employeeId },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user - Admin only
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;