// src/api/routes/dailyReportRoutes.ts

/**
 * @file dailyReportRoutes.ts
 * Defines routes for dailyReport-related operations.
 */

import express from 'express';
import {
  submitDailyReportContoller,
  getDailyReportController,
  getMyDailyReportsController,
  updateDailyReportController,
  submitEndOfDayController,
} from '@/api/controllers/dailyReport.controller';
/* import { protect } from '@/api/controllers/auth.controller'; */
import { validateRequest } from '@/api/middleware/validateRequest';
import {
  createDailyReportSchema,
  updateDailyReportSchema,
  updateEndOfDaySchema,
} from '@/api/validations/dailyReport.validations';

const router = express.Router();

/* router.use(protect); */

router.post('/', /* validateRequest(createDailyReportSchema), */ submitDailyReportContoller);

router.patch(
  '/end-of-day-report/:reportId',
/*   validateRequest(updateEndOfDaySchema), */
  submitEndOfDayController,
);

router.get('/all', getMyDailyReportsController);

router.patch('/:reportId', validateRequest(updateDailyReportSchema), updateDailyReportController);

router.get('/:id', getDailyReportController);

export default router;
