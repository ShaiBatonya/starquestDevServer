// src/api/controllers/workspace.controller.ts

import { Request, Response } from 'express';
import {
  createWorkspace,
  getUserWorkspaces,
  userWorkspaceRegistration,
  sendWorkspaceInvitation,
  getWorkspaceUsers,
  getLeaderboard,
  getWorkspaceTasks,
  deleteWorkspace,
} from '@/api/services/workspace.service';
import { sendSuccessResponse } from '@/api/utils/appResponse';
import catchAsync from '@/api/utils/catchAsync';

export const createWorkspaceController = catchAsync(async (req: Request, res: Response) => {
  const workspace = await createWorkspace(req.cookies?.jwt, req.body);
  sendSuccessResponse(res, 201, workspace);
});

export const getUserWorkspacesController = catchAsync(async (req: Request, res: Response) => {
  const workspaces = await getUserWorkspaces(req.cookies?.jwt);
  sendSuccessResponse(res, 200, workspaces);
});

export const sendInvitationController = catchAsync(async (req: Request, res: Response) => {
  const result = await sendWorkspaceInvitation(req.cookies?.jwt, req.body);
  sendSuccessResponse(res, 200, result, 'Invitation sent successfully');
});

export const userWorkspaceRegistrationController = catchAsync(
  async (req: Request, res: Response) => {
    const { invitationToken } = req.params;
    const result = await userWorkspaceRegistration(req.cookies?.jwt, invitationToken);
    sendSuccessResponse(res, 201, undefined, result);
  },
);

export const getWorkspaceUsersController = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  const users = await getWorkspaceUsers(workspaceId, req.cookies?.jwt);
  sendSuccessResponse(res, 200, users);
});

export const getLeaderboardController = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  const mentees = await getLeaderboard(workspaceId, req.cookies?.jwt);
  sendSuccessResponse(res, 200, mentees);
});

export const getWorkspaceTasksController = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  const tasks = await getWorkspaceTasks(workspaceId, req.cookies?.jwt);
  sendSuccessResponse(res, 200, tasks);
});

export const deleteWorkspaceController = catchAsync(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  await deleteWorkspace(workspaceId, req.cookies?.jwt);
  sendSuccessResponse(res, 204, null);
});
