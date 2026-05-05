import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  start: {
    type: String,
    required: true,
    match: [/^\d{2}:\d{2}$/, 'Start time must be in format HH:mm']
  },
  end: {
    type: String,
    required: true,
    match: [/^\d{2}:\d{2}$/, 'End time must be in format HH:mm']
  }
}, { _id: false });

const dayGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  days: {
    type: [String],
    enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    required: true
  },
  timeSlots: {
    type: [timeSlotSchema],
    required: true
  }
}, { _id: false });

const scheduleConfigSchema = new mongoose.Schema({
  branch: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  dayGroups: {
    type: [dayGroupSchema],
    default: []
  },
  defaultTimeSlots: {
    type: [timeSlotSchema],
    default: [
      { start: '08:30', end: '11:30' },
      { start: '11:30', end: '14:30' },
      { start: '14:30', end: '17:00' }
    ]
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

scheduleConfigSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Helper method to get time slots for a specific day
scheduleConfigSchema.methods.getTimeSlotsForDay = function(day) {
  // Find day group that contains this day
  const dayGroup = this.dayGroups.find(group => group.days.includes(day));
  
  if (dayGroup && dayGroup.timeSlots.length > 0) {
    return dayGroup.timeSlots.map(slot => `${slot.start}-${slot.end}`);
  }
  
  // Fallback to default time slots
  return this.defaultTimeSlots.map(slot => `${slot.start}-${slot.end}`);
};

export default mongoose.model('ScheduleConfig', scheduleConfigSchema);










