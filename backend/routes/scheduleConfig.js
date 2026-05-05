import express from 'express';
import {
  getConfig,
  updateConfig
} from '../controllers/scheduleConfigController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.route('/')
  .get(getConfig)
  .put(authorize('admin', 'scheduler'), updateConfig);

export default router;










