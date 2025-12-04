import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication
router.use(authorize('admin', 'scheduler')); // Only admin and scheduler can view audit logs

router.get('/', getAuditLogs);

export default router;


