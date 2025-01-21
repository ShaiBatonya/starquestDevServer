// src/api/routes/weekly.routes.ts

import express from 'express';
import {
  createWeeklyReportController,
  updateWeeklyReportController,
  getUserWeeklyReportsController,
  getWeeklyReportController,
} from '@/api/controllers/weekly.controller';
/* import { protect } from '@/api/controllers/auth.controller'; */
import { validateRequest } from '@/api/middleware/validateRequest';
import {
  createWeeklyReportSchema,
  updateWeeklyReportSchema,
} from '@/api/validations/weekly.validations';

const router = express.Router();

/* router.use(protect); */

router.post('/', validateRequest(createWeeklyReportSchema), createWeeklyReportController);

router.get('/all', getUserWeeklyReportsController);

router.patch('/:reportId', validateRequest(updateWeeklyReportSchema), updateWeeklyReportController);

router.get('/:id', getWeeklyReportController);

export default router;
