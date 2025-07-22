// src/api/services/position.service.ts
import DataAccess from '@/api/utils/dataAccess';
import { IWorkspace } from '@/api/types/workspace.interface';
import AppError from '@/api/utils/appError';

const workspaceModel = 'Workspace';

export const createPosition = async (
  workspaceId: string,
  positionName: string,
  positionColor: string,
): Promise<IWorkspace | null> => {
  const positionData = { name: positionName, color: positionColor };
  const updatedWorkspace = await DataAccess.updateById<IWorkspace>(workspaceModel, workspaceId, {
    $push: { positions: positionData },
  });

  return updatedWorkspace;
};

export const getPositionsInWorkspace = async (workspaceId: string): Promise<any[]> => {
  const workspace = await DataAccess.findById<IWorkspace>(workspaceModel, workspaceId, 'positions');
  if (!workspace) {
    throw new AppError('Workspace not found', 404);
  }
  return workspace.positions || [];
};

export const updatePosition = async (
  workspaceId: string,
  positionId: string,
  updateData: { name?: string; color?: string },
): Promise<IWorkspace | null> => {
  const workspace = await DataAccess.findById<IWorkspace>(workspaceModel, workspaceId);
  if (!workspace) {
    throw new AppError('Workspace not found', 404);
  }

  const positionIndex = workspace.positions.findIndex(
    (position: any) => position._id.toString() === positionId
  );
  
  if (positionIndex === -1) {
    throw new AppError('Position not found', 404);
  }

  // Update the position data
  if (updateData.name) {
    workspace.positions[positionIndex].name = updateData.name;
  }
  if (updateData.color) {
    workspace.positions[positionIndex].color = updateData.color;
  }

  // Save the workspace
  const updatedWorkspace = await DataAccess.saveDocument(workspace);
  return updatedWorkspace;
};

export const deletePosition = async (workspaceId: string, positionId: string): Promise<void> => {
  const workspace = await DataAccess.findById<IWorkspace>(workspaceModel, workspaceId);
  if (!workspace) {
    throw new AppError('Workspace not found', 404);
  }

  const positionExists = workspace.positions.some(
    (position: any) => position._id.toString() === positionId
  );
  
  if (!positionExists) {
    throw new AppError('Position not found', 404);
  }

  // Remove the position
  await DataAccess.updateById<IWorkspace>(workspaceModel, workspaceId, {
    $pull: { positions: { _id: positionId } },
  });
};
