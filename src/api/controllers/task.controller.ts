// src/api/controllers/task.controller.ts
import { Request, Response } from 'express';
import { sendSuccessResponse } from '@/api/utils/appResponse';
import catchAsync from '@/api/utils/catchAsync';
import {
  createPersonalTaskInWorkspace,
  createTaskInWorkspace,
  deleteTaskFromWorkspace,
  updateTaskInWorkspace,
  assignTaskToUser,
  getUserTaskProgress,
} from '@/api/services/task.service';

export const addTaskController = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  const newTask = await createTaskInWorkspace(workspaceId, req.body);
  sendSuccessResponse(res, 201, newTask);
});

export const addPersonalTaskController = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  const newTask = await createPersonalTaskInWorkspace(workspaceId, req.body);
  sendSuccessResponse(res, 201, newTask);
});

export const updateTaskController = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId, taskId } = req.params;
  const updatedTask = await updateTaskInWorkspace(workspaceId, taskId, req.body);
  sendSuccessResponse(res, 200, updatedTask);
});

export const deleteTaskController = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId, taskId } = req.params;
  await deleteTaskFromWorkspace(workspaceId, taskId);
  sendSuccessResponse(res, 204, null);
});

export const assignTaskToUserController = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId, taskId, userId } = req.params;
  const result = await assignTaskToUser(workspaceId, taskId, userId, req.cookies?.jwt);
  sendSuccessResponse(res, 200, result);
});

export const getUserTaskProgressController = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId, userId } = req.params;
  const progress = await getUserTaskProgress(workspaceId, userId, req.cookies?.jwt);
  sendSuccessResponse(res, 200, progress);
});
