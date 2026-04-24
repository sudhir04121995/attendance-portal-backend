const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { auth, isAdmin, isTeacherOrAdmin } = require('../middleware/auth');

// Mark attendance - Admin/Teacher only
router.post('/mark', auth, isTeacherOrAdmin, async (req, res) => {
  try {
    const { userId, date, status, checkInTime, checkOutTime, remarks } = req.body;
    
    const attendance = await Attendance.findOneAndUpdate(
      { userId, date: new Date(date) },
      { 
        userId, 
        date: new Date(date), 
        status, 
        checkInTime, 
        checkOutTime, 
        markedBy: req.user.id, 
        remarks 
      },
      { upsert: true, new: true }
    );
    
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get attendance by user - Students can only see their own
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Check authorization
    if (req.user.role !== 'admin' && req.user.role !== 'teacher' && req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied. You can only view your own attendance.' });
    }
    
    let query = { userId: req.params.userId };
    
    if (month && year) {
      query.date = {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1)
      };
    }
    
    const records = await Attendance.find(query).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get overall statistics - Admin only
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const totalPresent = await Attendance.countDocuments({ status: 'present' });
    const totalAbsent = await Attendance.countDocuments({ status: 'absent' });
    const totalLate = await Attendance.countDocuments({ status: 'late' });
    const totalHalfDay = await Attendance.countDocuments({ status: 'half-day' });
    
    res.json({
      totalPresent,
      totalAbsent,
      totalLate,
      totalHalfDay,
      total: totalPresent + totalAbsent + totalLate + totalHalfDay
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my attendance - For students to see their own
router.get('/my-attendance', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = { userId: req.user.id };
    
    if (month && year) {
      query.date = {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1)
      };
    }
    
    const records = await Attendance.find(query).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my stats - For students to see their own stats
router.get('/my-stats', auth, async (req, res) => {
  try {
    const totalPresent = await Attendance.countDocuments({ userId: req.user.id, status: 'present' });
    const totalAbsent = await Attendance.countDocuments({ userId: req.user.id, status: 'absent' });
    const totalLate = await Attendance.countDocuments({ userId: req.user.id, status: 'late' });
    
    res.json({
      totalPresent,
      totalAbsent,
      totalLate,
      total: totalPresent + totalAbsent + totalLate
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;