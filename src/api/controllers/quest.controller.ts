// src/api/controllers/quest.controller.ts

import { Request, Response } from 'express';
import {
  changeTaskStatus,
  getUserQuest,
  addCommentToTask,
  mentorChangeTaskStatus,
} from '@/api/services/quest.service';
import catchAsync from '@/api/utils/catchAsync';
import { sendSuccessResponse } from '@/api/utils/appResponse';

export const getUserQuestController = catchAsync(async (req: Request, res: Response) => {
  const quest = await getUserQuest(req.cookies?.jwt, req.params.workspaceId);
  sendSuccessResponse(res, 200, quest);
});

export const changeTaskStatusController = catchAsync(async (req: Request, res: Response) => {
  const task = await changeTaskStatus(req.cookies?.jwt, req.body);
  sendSuccessResponse(res, 200, task);
});

export const addCommentToTaskController = catchAsync(async (req: Request, res: Response) => {
  const comment = await addCommentToTask(req.cookies?.jwt, req.body);
  sendSuccessResponse(res, 200, comment);
});

export const mentorChangeTaskStatusController = catchAsync(async (req: Request, res: Response) => {
  const updatedTask = await mentorChangeTaskStatus(req.body);
  sendSuccessResponse(res, 200, updatedTask);
});
