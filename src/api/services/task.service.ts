// src/api/services/task.service.ts
import DataAccess from '@/api/utils/dataAccess';
import { IWorkspace } from '@/api/types/workspace.interface';
import AppError from '@/api/utils/appError';
import { ITask } from '@/api/types/task.interface';
import { findUserByToken } from '@/api/services/jwt.service';

const workspaceModel = 'Workspace';

interface BulkUpdateOperation {
  updateMany: {
    filter: any;
    update: any;
  };
}

export const createTaskInWorkspace = async (
  workspaceId: string,
  taskData: ITask,
): Promise<IWorkspace> => {
  const updatedWorkspace = await addTaskToWorkspace(workspaceId, taskData);
  if (!taskData.isGlobal) {
    await updateMenteesQuests(workspaceId, updatedWorkspace, taskData);
  } else {
    await updateAllMenteesQuests(workspaceId, updatedWorkspace);
  }
  return updatedWorkspace;
};
const addTaskToWorkspace = async (workspaceId: string, taskData: ITask): Promise<IWorkspace> => {
  const updatedWorkspace = await DataAccess.updateById<IWorkspace>(workspaceModel, workspaceId, {
    $push: { backlog: taskData },
  });

  if (!updatedWorkspace) {
    throw new AppError('Workspace not found or update failed', 404);
  }

  return updatedWorkspace;
};
const updateMenteesQuests = async (
  workspaceId: string,
  updatedWorkspace: IWorkspace,
  taskData: ITask,
): Promise<void> => {
  if (!updatedWorkspace.backlog || updatedWorkspace.backlog.length === 0) {
    throw new AppError('Task could not be added to the user backlog', 500);
  }

  const newTaskId = updatedWorkspace.backlog[updatedWorkspace.backlog.length - 1]._id;
  const bulkUpdateOperations: any[] = [];

  taskData.positions?.forEach((position) => {
    taskData.planets.forEach((planet) => {
      bulkUpdateOperations.push({
        updateMany: {
          filter: {
            _id: workspaceId,
            'users.role': 'mentee',
            'users.position': position,
            'users.planet': planet,
          },
          update: { $push: { 'users.$.quest': { tasks: newTaskId, status: 'Backlog' } } },
        },
      });
    });
  });

  const result = await DataAccess.bulkWrite(workspaceModel, bulkUpdateOperations);
  if (!result.ok) {
    throw new AppError('Bulk update operation failed', 500);
  }
};
const updateAllMenteesQuests = async (
  workspaceId: string,
  updatedWorkspace: IWorkspace,
): Promise<void> => {
  if (!updatedWorkspace.backlog || updatedWorkspace.backlog.length === 0) {
    throw new AppError('Task could not be added to the user backlog', 500);
  }

  const newTaskId = updatedWorkspace.backlog[updatedWorkspace.backlog.length - 1]._id;
  const bulkUpdateOperations = [
    {
      updateMany: {
        filter: {
          _id: workspaceId,
          'users.role': 'mentee',
        },
        update: { $push: { 'users.$.quest': { tasks: newTaskId, status: 'Backlog' } } },
      },
    },
  ];

  const result = await DataAccess.bulkWrite(workspaceModel, bulkUpdateOperations);
  if (!result.ok) {
    throw new AppError('Bulk update operation failed', 500);
  }
};

export const createPersonalTaskInWorkspace = async (
  workspaceId: string,
  taskData: ITask,
): Promise<IWorkspace> => {
  const updatedWorkspace = await addPersonalTaskToWorkspace(workspaceId, taskData);
  await updateUserPersonalQuests(workspaceId, updatedWorkspace, taskData);
  return updatedWorkspace;
};

const addPersonalTaskToWorkspace = async (
  workspaceId: string,
  taskData: ITask,
): Promise<IWorkspace> => {
  const updatedWorkspace = await DataAccess.updateById<IWorkspace>(workspaceModel, workspaceId, {
    $push: { backlog: taskData },
  });

  if (!updatedWorkspace) {
    throw new AppError('Workspace not found or update failed', 404);
  }

  return updatedWorkspace;
};

// New function to manually assign existing tasks to specific users
export const assignTaskToUser = async (
  workspaceId: string,
  taskId: string,
  userId: string,
  adminToken: string,
): Promise<IWorkspace> => {
  const adminUserId = await findUserByToken(adminToken);
  
  // Verify admin has permission to assign tasks
  const workspace = await DataAccess.findById<IWorkspace>(workspaceModel, workspaceId);
  if (!workspace) {
    throw new AppError('Workspace not found', 404);
  }
  
  const adminUser = workspace.users.find(
    (user) => user.userId.toString() === adminUserId && user.role === 'admin'
  );
  
  if (!adminUser) {
    throw new AppError('You do not have admin access to this workspace', 403);
  }
  
  // Check if task exists in workspace backlog
  const taskExists = workspace.backlog && workspace.backlog.some(task => task._id.toString() === taskId);
  if (!taskExists) {
    throw new AppError('Task not found in workspace', 404);
  }
  
  // Check if user exists in workspace
  const targetUser = workspace.users.find(user => user.userId.toString() === userId);
  if (!targetUser) {
    throw new AppError('User not found in workspace', 404);
  }
  
  // Check if task is already assigned to user
  const taskAlreadyAssigned = targetUser.quest?.some(quest => 
    quest.tasks.some(task => task.toString() === taskId)
  );
  
  if (taskAlreadyAssigned) {
    throw new AppError('Task is already assigned to this user', 400);
  }
  
  // Assign task to user
  const taskEntry = {
    taskId: taskId,
    status: 'Backlog',
    createdAt: new Date(),
    updatedAt: new Date(),
    comments: [],
  };
  
  const updatedWorkspace = await DataAccess.updateOne<IWorkspace>(
    workspaceModel,
    { _id: workspaceId, 'users.userId': userId },
    { $push: { 'users.$.quest': taskEntry } }
  );
  
  if (!updatedWorkspace) {
    throw new AppError('Failed to assign task to user', 500);
  }
  
  return updatedWorkspace;
};

// New function to get user task progress for admin viewing
export const getUserTaskProgress = async (
  workspaceId: string,
  userId: string,
  adminToken: string,
): Promise<any> => {
  const adminUserId = await findUserByToken(adminToken);
  
  // Verify admin has permission
  const workspace = await DataAccess.findById<IWorkspace>(workspaceModel, workspaceId);
  if (!workspace) {
    throw new AppError('Workspace not found', 404);
  }
  
  const adminUser = workspace.users.find(
    (user) => user.userId.toString() === adminUserId && (user.role === 'admin' || user.role === 'mentor')
  );
  
  if (!adminUser) {
    throw new AppError('You do not have permission to view user progress', 403);
  }
  
  // Get user's task progress
  const pipeline = [
    { $match: { _id: workspaceId } },
    { $unwind: '$users' },
    { $match: { 'users.userId': userId } },
    { $unwind: '$users.quest' },
    {
      $lookup: {
        from: 'tasks',
        localField: 'users.quest.taskId',
        foreignField: '_id',
        as: 'taskDetails'
      }
    },
    { $unwind: '$taskDetails' },
    {
      $project: {
        taskId: '$users.quest.taskId',
        status: '$users.quest.status',
        createdAt: '$users.quest.createdAt',
        updatedAt: '$users.quest.updatedAt',
        comments: '$users.quest.comments',
        taskTitle: '$taskDetails.title',
        taskDescription: '$taskDetails.description',
        taskCategory: '$taskDetails.category',
        starsEarned: '$taskDetails.starsEarned'
      }
    }
  ];
  
  const userProgress = await DataAccess.aggregate(workspaceModel, pipeline);
  return userProgress || [];
};
const updateUserPersonalQuests = async (
  workspaceId: string,
  updatedWorkspace: IWorkspace,
  taskData: ITask,
): Promise<void> => {
  if (!taskData.positions || taskData.positions?.length === 0) {
    throw new AppError('Position data is missing or empty', 400);
  }

  if (!updatedWorkspace.backlog || updatedWorkspace.backlog.length === 0) {
    throw new AppError('Task could not be added to the user backlog', 500);
  }

  const newTaskId = updatedWorkspace.backlog[updatedWorkspace.backlog.length - 1]._id;
  const matchCriteria = {
    'users.userId': taskData.userId,
    'users.role': 'mentee',
    'users.planet': taskData.planets[0],
    'users.position': taskData.positions[0],
  };

  await DataAccess.updateOne(
    workspaceModel,
    { _id: workspaceId, ...matchCriteria },
    { $push: { 'users.$.quest': { tasks: newTaskId, status: 'Backlog' } } },
  );
};

export const updateTaskInWorkspace = async (
  workspaceId: string,
  taskId: string,
  taskUpdates: Partial<ITask>,
  positionsToRemove?: string[],
  planetsToRemove?: string[],
  newPositions?: string[],
  newPlanets?: string[],
): Promise<IWorkspace> => {
  const update = {
    $set: {
      'backlog.$[elem]': taskUpdates,
    },
  };

  const options = {
    arrayFilters: [{ 'elem._id': taskId }],
    new: true,
  };

  const updatedWorkspace = await DataAccess.updateById<IWorkspace>(
    workspaceModel,
    workspaceId,
    update,
    options,
  );

  if (!updatedWorkspace || !updatedWorkspace.backlog) {
    throw new AppError('Workspace or task not found', 404);
  }

  const task = findTaskInWorkspace(updatedWorkspace, taskId);

  if (!task) {
    throw new AppError('Task not found in backlog', 404);
  }

  const existingPositions = (task.positions || []).map((pos) => pos.toString());
  const existingPlanets = task.planets || [];

  const bulkUpdateOperations = buildBulkUpdateOperations(
    workspaceId,
    taskId,
    positionsToRemove,
    planetsToRemove,
    newPositions,
    newPlanets,
    existingPositions,
    existingPlanets,
    taskUpdates.isGlobal,
  );

  await executeBulkUpdateOperations(bulkUpdateOperations);

  await updateTaskPositionsAndPlanets(
    workspaceId,
    taskId,
    positionsToRemove,
    planetsToRemove,
    newPositions,
    newPlanets,
  );

  return updatedWorkspace;
};
const findTaskInWorkspace = (workspace: IWorkspace, taskId: string): ITask | undefined => {
  return workspace.backlog?.find((task) => task._id.toString() === taskId);
};
const buildBulkUpdateOperations = (
  workspaceId: string,
  taskId: string,
  positionsToRemove: string[] | undefined,
  planetsToRemove: string[] | undefined,
  newPositions: string[] | undefined,
  newPlanets: string[] | undefined,
  existingPositions: string[],
  existingPlanets: string[],
  isGlobal: boolean | undefined,
): BulkUpdateOperation[] => {
  const bulkUpdateOperations: BulkUpdateOperation[] = [];

  const addRemoveOps = (
    positions: string[] | undefined,
    planets: string[] | undefined,
    action: '$pull' | '$addToSet',
    taskId: string,
  ): void => {
    if (positions && planets) {
      positions.forEach((position) => {
        planets.forEach((planet) => {
          bulkUpdateOperations.push({
            updateMany: {
              filter: {
                _id: workspaceId,
                'users.role': 'mentee',
                'users.position': position,
                'users.planet': planet,
              },
              update: { [action]: { 'users.$.quest.tasks': taskId } },
            },
          });
        });
      });
    }
  };

  // Handle deletions from users
  addRemoveOps(positionsToRemove, existingPlanets, '$pull', taskId);
  addRemoveOps(existingPositions, planetsToRemove, '$pull', taskId);

  // Handle additions to users
  addRemoveOps(newPositions, newPlanets, '$addToSet', taskId);
  addRemoveOps(newPositions, existingPlanets, '$addToSet', taskId);
  addRemoveOps(existingPositions, newPlanets, '$addToSet', taskId);

  // Handle global task update
  handleGlobalTaskUpdate(
    workspaceId,
    taskId,
    isGlobal,
    newPositions,
    newPlanets,
    bulkUpdateOperations,
  );

  return bulkUpdateOperations;
};
const handleGlobalTaskUpdate = (
  workspaceId: string,
  taskId: string,
  isGlobal: boolean | undefined,
  newPositions: string[] | undefined,
  newPlanets: string[] | undefined,
  bulkUpdateOperations: BulkUpdateOperation[],
): void => {
  if (isGlobal !== undefined) {
    if (isGlobal) {
      bulkUpdateOperations.push({
        updateMany: {
          filter: {
            _id: workspaceId,
            'users.role': 'mentee',
            'users.quest.tasks': { $ne: taskId },
          },
          update: { $addToSet: { 'users.$.taskIds': taskId } },
        },
      });
    } else {
      bulkUpdateOperations.push({
        updateMany: {
          filter: {
            _id: workspaceId,
            'users.role': 'mentee',
            'users.quest.tasks': taskId,
            'users.position': { $nin: newPositions },
            'users.planet': { $nin: newPlanets },
          },
          update: { $pull: { 'users.$.quest.tasks': taskId } },
        },
      });
    }
  }
};
const executeBulkUpdateOperations = async (operations: BulkUpdateOperation[]): Promise<void> => {
  if (operations.length > 0) {
    const result = await DataAccess.bulkWrite(workspaceModel, operations);
    if (!result.ok) {
      throw new AppError('Bulk update operation failed', 500);
    }
  }
};
const updateTaskPositionsAndPlanets = async (
  workspaceId: string,
  taskId: string,
  positionsToRemove: string[] | undefined,
  planetsToRemove: string[] | undefined,
  newPositions: string[] | undefined,
  newPlanets: string[] | undefined,
): Promise<void> => {
  const taskUpdate = {
    $pull: {
      'backlog.$.positions': { $in: positionsToRemove || [] },
      'backlog.$.planets': { $in: planetsToRemove || [] },
    },
    $addToSet: {
      'backlog.$.positions': { $each: newPositions || [] },
      'backlog.$.planets': { $each: newPlanets || [] },
    },
  };

  const taskUpdateResult = await DataAccess.updateOne<IWorkspace>(
    workspaceModel,
    { _id: workspaceId, 'backlog._id': taskId },
    taskUpdate,
  );

  if (!taskUpdateResult) {
    throw new AppError('Failed to update task with new positions and planets', 500);
  }
};

export const deleteTaskFromWorkspace = async (
  workspaceId: string,
  taskId: string,
): Promise<void> => {
  const userUpdateResult = await DataAccess.updateMany(
    workspaceModel,
    {
      _id: workspaceId,
      'users.quest': { $elemMatch: { taskId: taskId } },
    },
    { $pull: { 'users.$.quest': { taskId: taskId } } },
  );

  if (!userUpdateResult) {
    throw new AppError('Failed to update users with task removal', 500);
  }

  const taskRemoveResult = await DataAccess.updateById<IWorkspace>(workspaceModel, workspaceId, {
    $pull: { backlog: { _id: taskId } },
  });

  if (!taskRemoveResult) {
    throw new AppError('Failed to remove task from backlog', 500);
  }
};
