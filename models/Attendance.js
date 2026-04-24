const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['present', 'absent', 'late', 'half-day'], 
    default: 'absent' 
  },
  checkInTime: { 
    type: String 
  },
  checkOutTime: { 
    type: String 
  },
  markedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  remarks: { 
    type: String 
  }
});

// Compound index to prevent duplicate entries for same user on same date
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);