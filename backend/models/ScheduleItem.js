import mongoose from 'mongoose';

const scheduleItemSchema = new mongoose.Schema({
  weekStart: {
    type: Date,
    required: [true, 'Week start date is required'],
    index: true
  },
  day: {
    type: String,
    enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    required: [true, 'Day is required']
  },
  slot: {
    type: String,
    required: [true, 'Time slot is required'],
    match: [/^\d{2}:\d{2}-\d{2}:\d{2}$/, 'Slot must be in format HH:mm-HH:mm']
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'Teacher ID is required'],
    index: true
  },
  batchIds: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Batch',
    required: [true, 'At least one batch ID is required'],
    validate: {
      validator: (v) => Array.isArray(v) && v.length > 0,
      message: 'At least one batch ID is required'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Compound indexes for efficient queries and clash detection
scheduleItemSchema.index({ weekStart: 1, day: 1, slot: 1, teacherId: 1 }, { unique: true });
scheduleItemSchema.index({ weekStart: 1, day: 1, slot: 1, batchIds: 1 });
scheduleItemSchema.index({ weekStart: 1, teacherId: 1 });
scheduleItemSchema.index({ weekStart: 1, batchIds: 1 });

scheduleItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('ScheduleItem', scheduleItemSchema);


