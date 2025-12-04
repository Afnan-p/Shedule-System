import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'scheduler', 'teacher'],
    default: 'teacher',
    required: true
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for email lookups
userSchema.index({ email: 1 });

// Index for branch filtering
userSchema.index({ branch: 1 });

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

export default mongoose.model('User', userSchema);

