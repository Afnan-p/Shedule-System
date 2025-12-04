import express from 'express';
import {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher
} from '../controllers/teacherController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.route('/')
  .get(getTeachers)
  .post(authorize('admin', 'scheduler'), createTeacher);

router.route('/:id')
  .get(getTeacher)
  .put(authorize('admin', 'scheduler'), updateTeacher)
  .delete(authorize('admin'), deleteTeacher);

export default router;


