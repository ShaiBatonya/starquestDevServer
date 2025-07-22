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
  getWorkspaceReportsController,
} from '@/api/controllers/report.controller';

import { protect } from '@/api/controllers/auth.controller';
import { validateRequest } from '@/api/middleware/validateRequest';
import {
  createReportValidation,
  updateReportValidation,
} from '@/api/validations/report.validations';
import { workspaceIdValidation } from '@/api/validations/workspace.validations';
import { checkWorkspacePermissions } from '@/api/services/workspacePermission.service';

const router = express.Router();

router.use(protect);

router.post('/', validateRequest(createReportValidation), createReportController);

router.get('/', getAllReportsController);

// New route for admin to get all reports in a workspace
router.get(
  '/workspace/:workspaceId',
  checkWorkspacePermissions(['admin']),
  validateRequest(workspaceIdValidation, 'params'),
  getWorkspaceReportsController,
);

router
  .route('/:id')
  .get(getReportController)
  .patch(validateRequest(updateReportValidation), updateReportController)
  .delete(deleteReportController);

router.post('/:id/submit', submitReportController);

router.post('/my-submissions', getWorkspaceSubmissionsController);

router.patch('/:id/submissions/:submissionId', updateSubmissionController);

export default router;
