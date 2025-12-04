import express from 'express';
import {
  getSchedule,
  checkConflicts,
  assignSchedule,
  removeSchedule,
  moveSchedule,
  autoSuggest
} from '../controllers/scheduleController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getSchedule);
router.post('/check', checkConflicts);
router.post('/assign', authorize('admin', 'scheduler'), assignSchedule);
router.post('/remove', authorize('admin', 'scheduler'), removeSchedule);
router.post('/move', authorize('admin', 'scheduler'), moveSchedule);
router.post('/auto-suggest', authorize('admin', 'scheduler'), autoSuggest);

export default router;


