// src/api/routes/dashboard.route.ts

import express from 'express';
import {
  getWeeklyDashboardStatsController,
  getMonthlyDashboardStatsController,
} from '@/api/controllers/dashboard.controller';
import { protect } from '@/api/controllers/auth.controller';

const router = express.Router();

router.use(protect);
router.get('/weekly', getWeeklyDashboardStatsController);

router.get('/monthly', getMonthlyDashboardStatsController);

export default router;
