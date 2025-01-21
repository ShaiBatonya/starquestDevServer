import DataAccess from '@/api/utils/dataAccess';
import { IWorkspace } from '../types/workspace.interface';
import AppError from '../utils/appError';
import { Request, Response, NextFunction } from 'express';
import { findUserByToken } from '@/api/services/jwt.service';

const workspaceModel = 'Workspace';

export const validateUserPermissionInWorkspace = async (
  userId: string,
  workspaceId: string,
  approvePermission: string[],
): Promise<void> => {
  const workspace = await DataAccess.findById<IWorkspace>(workspaceModel, workspaceId);

  if (!workspace) {
    throw new AppError('Workspace not found', 404);
  }

  const user = workspace.users.find((user) => user.userId.toString() === userId);
  if (!user || !approvePermission.includes(user.role)) {
    throw new AppError('You do not have access permission, contact the system administrator', 403);
  }
};

export const checkWorkspacePermissions = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userToken = req.cookies?.jwt;
      const workspaceId = req.params.workspaceId;
      const userId = await findUserByToken(userToken);

      await validateUserPermissionInWorkspace(userId, workspaceId, allowedRoles);
      next();
    } catch (error: any) {
      res.status(403).json({ message: error.message });
    }
  };
};
