// src/api/routes/task.route.ts

import express from 'express';
import {
  addTaskController,
  deleteTaskController,
  updateTaskController,
} from '@/api/controllers/task.controller';
import { protect } from '@/api/controllers/auth.controller';
import { checkWorkspacePermissions } from '@/api/services/workspacePermission.service';
import { validateRequest } from '@/api/middleware/validateRequest';
import {
  createPersonalTaskSchema,
  createTaskSchema,
  updateTaskSchema,
} from '@/api/validations/task.validations';

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
  addTaskController,
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
