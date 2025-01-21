// src/api/routes/quest.route.ts

import express from 'express';
import {
  changeTaskStatusController,
  getUserQuestController,
  addCommentToTaskController,
  mentorChangeTaskStatusController,
} from '@/api/controllers/quest.controller';
/* import { protect } from '@/api/controllers/auth.controller'; */
import {
  addCommentToTaskSchema,
  changeTaskStatusByMentorSchema,
  changeTaskStatusSchema,
  workspaceIdParamsSchema,
} from '@/api/validations/quest.validations';
import { validateRequest } from '@/api/middleware/validateRequest';
import { checkWorkspacePermissions } from '@/api/services/workspacePermission.service';

const router = express.Router({ mergeParams: true });

/* router.use(protect); */

router.get(
  '/:workspaceId',
  validateRequest(workspaceIdParamsSchema, 'params'),
  getUserQuestController,
);
router.patch(
  '/move-task-status',
  validateRequest(changeTaskStatusSchema),
  changeTaskStatusController,
);
router.patch('/add-comment', validateRequest(addCommentToTaskSchema), addCommentToTaskController);

router.patch(
  '/mentor-change-task-status',
  checkWorkspacePermissions(['admin', 'mentor']),
  validateRequest(changeTaskStatusByMentorSchema),
  mentorChangeTaskStatusController,
);

export default router;
