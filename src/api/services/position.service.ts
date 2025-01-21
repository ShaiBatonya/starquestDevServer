// src/api/services/position.service.ts
import DataAccess from '@/api/utils/dataAccess';
import { IWorkspace } from '@/api/types/workspace.interface';

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
    throw new Error('Workspace not found');
  }
  return workspace.positions;
};
