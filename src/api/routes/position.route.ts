// src/api/routes/position.route.ts
import express from 'express';
import {
  addPositionController,
  getPositionsController,
  updatePositionController,
  deletePositionController,
} from '@/api/controllers/position.controller';
import { protect } from '@/api/controllers/auth.controller';
import { validateRequest } from '@/api/middleware/validateRequest';
import { createPositionSchema, updatePositionSchema } from '@/api/validations/position.validations';
import { checkWorkspacePermissions } from '@/api/services/workspacePermission.service';

const router = express.Router();

router.use(protect);

router.post(
  '/:workspaceId/positions',
  checkWorkspacePermissions(['admin', 'mentor']),
  validateRequest(createPositionSchema),
  addPositionController,
);

router.get(
  '/:workspaceId/positions',
  checkWorkspacePermissions(['admin', 'mentor']),
  getPositionsController,
);

router.patch(
  '/:workspaceId/positions/:positionId',
  checkWorkspacePermissions(['admin', 'mentor']),
  validateRequest(updatePositionSchema),
  updatePositionController,
);

router.delete(
  '/:workspaceId/positions/:positionId',
  checkWorkspacePermissions(['admin', 'mentor']),
  deletePositionController,
);

export default router;
