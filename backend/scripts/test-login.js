import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schedule-management');
    console.log('Connected to MongoDB\n');

    // Check if users exist
    const users = await User.find({});
    console.log(`Found ${users.length} users:\n`);
    
    users.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Role: ${user.role}`);
      console.log(`Branch: ${user.branch}`);
      console.log(`Has passwordHash: ${!!user.passwordHash}`);
      console.log('---');
    });

    // Try to find admin user
    const admin = await User.findOne({ email: 'admin@institute.com' }).select('+passwordHash');
    if (admin) {
      console.log('\n✅ Admin user found!');
      console.log(`Password hash exists: ${!!admin.passwordHash}`);
      console.log(`Password hash length: ${admin.passwordHash?.length || 0}`);
    } else {
      console.log('\n❌ Admin user NOT found!');
      console.log('Please run: npm run seed');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testLogin();









