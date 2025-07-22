// src/api/routes/workspace.route.ts

import express from 'express';
import {
  createWorkspaceController,
  getLeaderboardController,
  getUserWorkspacesController,
  getWorkspaceUsersController,
  sendInvitationController,
  userWorkspaceRegistrationController,
  getWorkspaceTasksController,
  deleteWorkspaceController,
} from '@/api/controllers/workspace.controller';
import { protect } from '@/api/controllers/auth.controller';
import { validateRequest } from '@/api/middleware/validateRequest';
import {
  createWorkspaceValidation,
  sendInvitationValidation,
  workspaceIdValidation,
} from '@/api/validations/workspace.validations';
import { checkWorkspacePermissions } from '@/api/services/workspacePermission.service';

const router = express.Router();

router.use(protect);

router.post('/', validateRequest(createWorkspaceValidation), createWorkspaceController);
router.post(
  '/send-invitation',
  validateRequest(sendInvitationValidation),
  sendInvitationController,
);
router.post('/accept-invitation/:invitationToken', userWorkspaceRegistrationController);
router.get('/my-workspaces', getUserWorkspacesController);

// Get workspace tasks
router.get(
  '/:workspaceId/tasks',
  checkWorkspacePermissions(['admin', 'mentor']),
  validateRequest(workspaceIdValidation, 'params'),
  getWorkspaceTasksController,
);

// Get workspace users
router.get(
  '/:workspaceId/users',
  checkWorkspacePermissions(['admin', 'mentor']),
  validateRequest(workspaceIdValidation, 'params'),
  getWorkspaceUsersController,
);

// Delete workspace (admin only)
router.delete(
  '/:workspaceId',
  checkWorkspacePermissions(['admin']),
  validateRequest(workspaceIdValidation, 'params'),
  deleteWorkspaceController,
);

router.get(
  '/:workspaceId/leaderboard',
  validateRequest(workspaceIdValidation, 'params'),
  getLeaderboardController,
);

export default router;
