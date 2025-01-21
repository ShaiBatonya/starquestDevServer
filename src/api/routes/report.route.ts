// src/api/report.route.ts

// src/api/routes/report.route.ts

/**
 * @file reportRoutes.ts
 * Defines routes for report-related operations including creating, updating, and fetching reports.
 */

import express from 'express';
import {
  createReportController,
  getReportController,
  updateReportController,
  deleteReportController,
  getAllReportsController,
  submitReportController,
  getWorkspaceSubmissionsController,
  updateSubmissionController,
} from '@/api/controllers/report.controller';

import { protect } from '@/api/controllers/auth.controller';
import { validateRequest } from '@/api/middleware/validateRequest';
import {
  createReportValidation,
  updateReportValidation,
} from '@/api/validations/report.validations';

const router = express.Router();

router.use(protect);

router.patch('/submission/update', updateSubmissionController);

router.post('/my-submissions', getWorkspaceSubmissionsController);

router.post('/submit-report/:id', submitReportController);

router.post('/', validateRequest(createReportValidation), createReportController);

router.get('/', getAllReportsController);

router
  .route('/:id')
  .get(getReportController)
  .patch(validateRequest(updateReportValidation), updateReportController)
  .delete(deleteReportController);

export default router;
