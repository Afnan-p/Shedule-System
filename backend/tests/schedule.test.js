import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';
import Batch from '../models/Batch.js';
import Teacher from '../models/Teacher.js';
import ScheduleItem from '../models/ScheduleItem.js';

describe('Schedule API Tests', () => {
  let adminToken;
  let schedulerToken;
  let teacherId;
  let batchId1;
  let batchId2;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schedule-test');

    // Create test users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
      role: 'admin',
      branch: 'CS'
    });

    const scheduler = await User.create({
      name: 'Scheduler User',
      email: 'scheduler@test.com',
      passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
      role: 'scheduler',
      branch: 'CS'
    });

    // For testing, we'll create tokens manually
    // In real scenario, you'd hash password properly
    const jwt = (await import('jsonwebtoken')).default;
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
    schedulerToken = jwt.sign({ id: scheduler._id }, process.env.JWT_SECRET);

    // Create test teacher
    const teacher = await Teacher.create({
      name: 'Test Teacher',
      subjects: ['Math', 'Physics'],
      branch: 'CS',
      availability: [
        { day: 'Mon', slot: '08:30-11:30' },
        { day: 'Tue', slot: '08:30-11:30' }
      ]
    });
    teacherId = teacher._id;

    // Create test batches
    const batch1 = await Batch.create({
      name: 'Batch A',
      size: 30,
      subjects: ['Math'],
      branch: 'CS'
    });
    batchId1 = batch1._id;

    const batch2 = await Batch.create({
      name: 'Batch B',
      size: 25,
      subjects: ['Physics'],
      branch: 'CS'
    });
    batchId2 = batch2._id;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('POST /api/schedule/assign', () => {
    it('should assign batches to teacher time slot', async () => {
      const weekStart = new Date('2024-01-01'); // Monday

      const response = await request(app)
        .post('/api/schedule/assign')
        .set('Authorization', `Bearer ${schedulerToken}`)
        .send({
          weekStart: weekStart.toISOString(),
          day: 'Mon',
          slot: '08:30-11:30',
          teacherId: teacherId.toString(),
          batchIds: [batchId1.toString()]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.scheduleItem).toBeDefined();
    });

    it('should prevent teacher double-booking', async () => {
      const weekStart = new Date('2024-01-01');

      // Try to assign another batch to same slot
      const response = await request(app)
        .post('/api/schedule/assign')
        .set('Authorization', `Bearer ${schedulerToken}`)
        .send({
          weekStart: weekStart.toISOString(),
          day: 'Mon',
          slot: '08:30-11:30',
          teacherId: teacherId.toString(),
          batchIds: [batchId2.toString()]
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('TEACHER_CONFLICT');
    });

    it('should prevent batch double-booking', async () => {
      const weekStart = new Date('2024-01-01');

      // Create another teacher
      const teacher2 = await Teacher.create({
        name: 'Teacher 2',
        subjects: ['Math'],
        branch: 'CS',
        availability: [{ day: 'Mon', slot: '08:30-11:30' }]
      });

      // Try to assign same batch to different teacher at same time
      const response = await request(app)
        .post('/api/schedule/assign')
        .set('Authorization', `Bearer ${schedulerToken}`)
        .send({
          weekStart: weekStart.toISOString(),
          day: 'Mon',
          slot: '08:30-11:30',
          teacherId: teacher2._id.toString(),
          batchIds: [batchId1.toString()]
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('BATCH_CONFLICT');
    });

    it('should require scheduler or admin role', async () => {
      const jwt = (await import('jsonwebtoken')).default;
      const teacherToken = jwt.sign(
        { id: (await User.create({
          name: 'Teacher',
          email: 'teacher@test.com',
          passwordHash: 'hash',
          role: 'teacher',
          branch: 'CS'
        }))._id },
        process.env.JWT_SECRET || 'test-secret'
      );

      const response = await request(app)
        .post('/api/schedule/assign')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          weekStart: new Date().toISOString(),
          day: 'Mon',
          slot: '08:30-11:30',
          teacherId: teacherId.toString(),
          batchIds: [batchId1.toString()]
        });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/schedule/remove', () => {
    it('should remove batches from schedule', async () => {
      const weekStart = new Date('2024-01-01');

      const response = await request(app)
        .post('/api/schedule/remove')
        .set('Authorization', `Bearer ${schedulerToken}`)
        .send({
          weekStart: weekStart.toISOString(),
          day: 'Mon',
          slot: '08:30-11:30',
          teacherId: teacherId.toString(),
          batchIds: [batchId1.toString()]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/schedule', () => {
    it('should get schedule for a week', async () => {
      const weekStart = new Date('2024-01-01');

      const response = await request(app)
        .get('/api/schedule')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ weekStart: weekStart.toISOString() });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.schedule)).toBe(true);
    });
  });

  describe('POST /api/schedule/check', () => {
    it('should check for conflicts', async () => {
      const weekStart = new Date('2024-01-01');

      const response = await request(app)
        .post('/api/schedule/check')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          weekStart: weekStart.toISOString(),
          day: 'Tue',
          slot: '08:30-11:30',
          teacherId: teacherId.toString(),
          batchIds: [batchId1.toString()]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.hasConflicts).toBeDefined();
    });
  });
});

