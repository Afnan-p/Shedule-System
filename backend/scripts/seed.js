import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Batch from '../models/Batch.js';
import Teacher from '../models/Teacher.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schedule-management');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Batch.deleteMany({});
    await Teacher.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@institute.com',
      passwordHash,
      role: 'admin',
      branch: 'Computer Science'
    });

    const scheduler = await User.create({
      name: 'Scheduler User',
      email: 'scheduler@institute.com',
      passwordHash,
      role: 'scheduler',
      branch: 'Computer Science'
    });

    console.log('Created users');

    // Create batches - CS Branch
    const csBatches = [
      {
        name: 'CS Batch A - 2024',
        size: 40,
        subjects: ['Data Structures', 'Algorithms', 'Database Systems'],
        branch: 'Computer Science'
      },
      {
        name: 'CS Batch B - 2024',
        size: 35,
        subjects: ['Operating Systems', 'Computer Networks', 'Software Engineering'],
        branch: 'Computer Science'
      },
      {
        name: 'CS Batch C - 2024',
        size: 38,
        subjects: ['Data Structures', 'Algorithms', 'Machine Learning'],
        branch: 'Computer Science'
      },
      {
        name: 'CS Batch D - 2023',
        size: 42,
        subjects: ['Database Systems', 'Web Development', 'Mobile Development'],
        branch: 'Computer Science'
      },
      {
        name: 'CS Batch E - 2023',
        size: 36,
        subjects: ['Computer Networks', 'Cybersecurity', 'Cloud Computing'],
        branch: 'Computer Science'
      }
    ];

    // Create batches - EE Branch
    const eeBatches = [
      {
        name: 'EE Batch A - 2024',
        size: 32,
        subjects: ['Circuit Analysis', 'Digital Electronics', 'Power Systems'],
        branch: 'Electrical Engineering'
      },
      {
        name: 'EE Batch B - 2024',
        size: 30,
        subjects: ['Control Systems', 'Signal Processing', 'Embedded Systems'],
        branch: 'Electrical Engineering'
      },
      {
        name: 'EE Batch C - 2023',
        size: 34,
        subjects: ['Power Electronics', 'Renewable Energy', 'Microcontrollers'],
        branch: 'Electrical Engineering'
      }
    ];

    // Create batches - ME Branch
    const meBatches = [
      {
        name: 'ME Batch A - 2024',
        size: 28,
        subjects: ['Thermodynamics', 'Fluid Mechanics', 'Machine Design'],
        branch: 'Mechanical Engineering'
      },
      {
        name: 'ME Batch B - 2024',
        size: 29,
        subjects: ['Manufacturing Processes', 'CAD/CAM', 'Robotics'],
        branch: 'Mechanical Engineering'
      }
    ];

    const allBatches = [...csBatches, ...eeBatches, ...meBatches];
    await Batch.insertMany(allBatches);
    console.log(`Created ${allBatches.length} batches`);

    // Create teachers - CS Branch
    const csTeachers = [
      {
        name: 'Dr. John Smith',
        subjects: ['Data Structures', 'Algorithms'],
        branch: 'Computer Science',
        availability: [
          { day: 'Mon', slot: '08:30-11:30' },
          { day: 'Tue', slot: '08:30-11:30' },
          { day: 'Wed', slot: '13:30-16:30' },
          { day: 'Thu', slot: '08:30-11:30' }
        ]
      },
      {
        name: 'Prof. Sarah Johnson',
        subjects: ['Database Systems', 'Web Development'],
        branch: 'Computer Science',
        availability: [
          { day: 'Mon', slot: '13:30-16:30' },
          { day: 'Tue', slot: '13:30-16:30' },
          { day: 'Wed', slot: '08:30-11:30' },
          { day: 'Fri', slot: '08:30-11:30' }
        ]
      },
      {
        name: 'Dr. Michael Chen',
        subjects: ['Operating Systems', 'Computer Networks'],
        branch: 'Computer Science',
        availability: [
          { day: 'Tue', slot: '08:30-11:30' },
          { day: 'Wed', slot: '13:30-16:30' },
          { day: 'Thu', slot: '13:30-16:30' },
          { day: 'Fri', slot: '13:30-16:30' }
        ]
      }
    ];

    // Create teachers - EE Branch
    const eeTeachers = [
      {
        name: 'Dr. Emily Davis',
        subjects: ['Circuit Analysis', 'Digital Electronics'],
        branch: 'Electrical Engineering',
        availability: [
          { day: 'Mon', slot: '08:30-11:30' },
          { day: 'Tue', slot: '08:30-11:30' },
          { day: 'Thu', slot: '08:30-11:30' }
        ]
      },
      {
        name: 'Prof. Robert Wilson',
        subjects: ['Control Systems', 'Signal Processing'],
        branch: 'Electrical Engineering',
        availability: [
          { day: 'Mon', slot: '13:30-16:30' },
          { day: 'Wed', slot: '08:30-11:30' },
          { day: 'Fri', slot: '08:30-11:30' }
        ]
      }
    ];

    // Create teachers - ME Branch
    const meTeachers = [
      {
        name: 'Dr. James Brown',
        subjects: ['Thermodynamics', 'Fluid Mechanics'],
        branch: 'Mechanical Engineering',
        availability: [
          { day: 'Tue', slot: '13:30-16:30' },
          { day: 'Wed', slot: '08:30-11:30' },
          { day: 'Thu', slot: '13:30-16:30' }
        ]
      }
    ];

    const allTeachers = [...csTeachers, ...eeTeachers, ...meTeachers];
    await Teacher.insertMany(allTeachers);
    console.log(`Created ${allTeachers.length} teachers`);

    console.log('\n=== Seed Data Summary ===');
    console.log('Users:');
    console.log(`  Admin: ${admin.email} (password: password123)`);
    console.log(`  Scheduler: ${scheduler.email} (password: password123)`);
    console.log(`\nBatches: ${allBatches.length}`);
    console.log(`Teachers: ${allTeachers.length}`);
    console.log('\nSeed completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();










