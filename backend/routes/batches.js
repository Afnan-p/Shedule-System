import express from 'express';
import {
  getBatches,
  getBatch,
  createBatch,
  updateBatch,
  deleteBatch,
  addStudent,
  removeStudent,
  updateStudent
} from '../controllers/batchController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.route('/')
  .get(getBatches)
  .post(authorize('admin', 'scheduler'), createBatch);

router.route('/:id')
  .get(getBatch)
  .put(authorize('admin', 'scheduler'), updateBatch)
  .delete(authorize('admin'), deleteBatch);

router.route('/:id/students')
  .post(authorize('admin', 'scheduler'), addStudent);

router.route('/:id/students/:studentId')
  .put(authorize('admin', 'scheduler'), updateStudent)
  .delete(authorize('admin', 'scheduler'), removeStudent);

export default router;

