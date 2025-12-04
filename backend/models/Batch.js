import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Batch name is required'],
    trim: true
  },
  size: {
    type: Number,
    required: [true, 'Batch size is required'],
    min: [1, 'Batch size must be at least 1']
  },
  students: {
    type: [
      {
        name: {
          type: String,
          required: true,
          trim: true
        },
        email: {
          type: String,
          trim: true,
          lowercase: true
        },
        rollNumber: {
          type: String,
          trim: true
        },
        phone: {
          type: String,
          trim: true
        }
      }
    ],
    default: []
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
batchSchema.index({ branch: 1 });
batchSchema.index({ name: 1 });
batchSchema.index({ subjects: 1 });

batchSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  // Auto-update size based on students array length if students exist
  if (this.students && this.students.length > 0) {
    this.size = this.students.length;
  }
  next();
});

export default mongoose.model('Batch', batchSchema);

