// src/api/routes/task.route.ts

import express from 'express';
import {
  addTaskController,
  addPersonalTaskController,
  updateTaskController,
  deleteTaskController,
  assignTaskToUserController,
  getUserTaskProgressController,
} from '@/api/controllers/task.controller';
import { protect } from '@/api/controllers/auth.controller';
import { validateRequest } from '@/api/middleware/validateRequest';
import {
  createTaskSchema,
  createPersonalTaskSchema,
  updateTaskSchema,
} from '@/api/validations/task.validations';
import { workspaceIdValidation } from '@/api/validations/workspace.validations';
import { checkWorkspacePermissions } from '@/api/services/workspacePermission.service';

const router = express.Router();

router.use(protect);

router.post(
  '/:workspaceId/tasks',
  validateRequest(createTaskSchema),
  checkWorkspacePermissions(['admin', 'mentor']),
  addTaskController,
);

router.post(
  '/:workspaceId/personal-tasks',
  validateRequest(createPersonalTaskSchema),
  checkWorkspacePermissions(['admin', 'mentor']),
  addPersonalTaskController,
);

// New route for manual task assignment
router.post(
  '/:workspaceId/tasks/:taskId/assign/:userId',
  validateRequest(workspaceIdValidation, 'params'),
  checkWorkspacePermissions(['admin', 'mentor']),
  assignTaskToUserController,
);

// New route for viewing user task progress
router.get(
  '/:workspaceId/users/:userId/progress',
  validateRequest(workspaceIdValidation, 'params'),
  checkWorkspacePermissions(['admin', 'mentor']),
  getUserTaskProgressController,
);

router.patch(
  '/:workspaceId/tasks/:taskId',
  validateRequest(updateTaskSchema),
  checkWorkspacePermissions(['admin', 'mentor']),
  updateTaskController,
);

router.delete(
  '/:workspaceId/tasks/:taskId',
  checkWorkspacePermissions(['admin', 'mentor']),
  deleteTaskController,
);

export default router;
