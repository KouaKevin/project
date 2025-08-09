import express from 'express';
import { getDashboardStats, getFinancialReport } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/financial-report', getFinancialReport);

export default router;