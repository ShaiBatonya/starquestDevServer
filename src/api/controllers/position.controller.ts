// src/api/controllers/position.controller.ts
import { Request, Response } from 'express';
import { createPosition, getPositionsInWorkspace } from '@/api/services/position.service';
import { sendSuccessResponse } from '@/api/utils/appResponse';
import catchAsync from '@/api/utils/catchAsync';

export const addPositionController = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  const { name, color } = req.body;
  const position = await createPosition(workspaceId, name, color);
  sendSuccessResponse(res, 201, position);
});

export const getPositionsController = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  const positions = await getPositionsInWorkspace(workspaceId);
  sendSuccessResponse(res, 200, positions);
});
