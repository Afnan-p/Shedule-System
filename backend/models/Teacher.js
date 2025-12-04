import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    required: true
  },
  slot: {
    type: String,
    required: true,
    match: [/^\d{2}:\d{2}-\d{2}:\d{2}$/, 'Slot must be in format HH:mm-HH:mm']
  }
}, { _id: false });

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Teacher name is required'],
    trim: true
  },
  subjects: {
    type: [String],
    required: [true, 'Subjects are required'],
    validate: {
      validator: (v) => Array.isArray(v) && v.length > 0,
      message: 'At least one subject is required'
    }
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    trim: true
  },
  availability: {
    type: [availabilitySchema],
    default: []
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for common queries
teacherSchema.index({ branch: 1 });
teacherSchema.index({ name: 1 });
teacherSchema.index({ subjects: 1 });

teacherSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Teacher', teacherSchema);


