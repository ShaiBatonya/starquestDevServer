// src/api/controllers/position.controller.ts
import { Request, Response } from 'express';
import { 
  createPosition, 
  getPositionsInWorkspace, 
  updatePosition, 
  deletePosition 
} from '@/api/services/position.service';
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

export const updatePositionController = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId, positionId } = req.params;
  const { name, color } = req.body;
  const position = await updatePosition(workspaceId, positionId, { name, color });
  sendSuccessResponse(res, 200, position);
});

export const deletePositionController = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId, positionId } = req.params;
  await deletePosition(workspaceId, positionId);
  sendSuccessResponse(res, 204, null);
});
