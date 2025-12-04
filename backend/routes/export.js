import express from 'express';
import {
  exportCSV,
  exportPDF
} from '../controllers/exportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/csv', exportCSV);
router.get('/pdf', exportPDF);

export default router;


