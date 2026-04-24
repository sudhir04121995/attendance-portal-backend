const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['admin', 'teacher', 'student'], 
    default: 'student' 
  },
  department: { 
    type: String 
  },
  employeeId: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// NO PRE-SAVE HOOK HERE AT ALL

module.exports = mongoose.model('User', UserSchema);