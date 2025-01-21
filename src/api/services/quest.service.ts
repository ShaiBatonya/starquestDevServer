// src/api/services/quest.service.ts

import DataAccess from '@/api/utils/dataAccess';
import { IWorkspace } from '@/api/types/workspace.interface';
import AppError from '@/api/utils/appError';
import { findUserByToken } from '@/api/services/jwt.service';
import { IUserTask } from '@/api/types/userTask.interface';
import { ITask } from '@/api/types/task.interface';

const workspaceModel = 'Workspace';
const taskModel = 'Task';

interface ITaskGroup {
  [status: string]: IUserTask[];
}

interface IPreSaveComment {
  userId: string;
  content: string;
  createdAt: Date;
}

type TAggregationPipeline = Array<{ [key: string]: any }>;

interface IChangeTaskByMentor {
  workspaceId: string;
  menteeId: string;
  taskId: string;
  status: string;
}

/*For mentee*/
export const getUserQuest = async (userToken: string, workspaceId: string): Promise<ITaskGroup> => {
  const userId = await findUserByToken(userToken);
  const pipeline = constructAggregationPipeline(userId, workspaceId);
  return aggregateTasks(workspaceModel, pipeline);
};
const constructAggregationPipeline = (
  userId: string,
  workspaceId: string,
): TAggregationPipeline => [
  { $match: { _id: workspaceId } },
  { $unwind: '$users' },
  { $match: { 'users.userId': userId } },
  { $unwind: '$users.quest' },
  {
    $group: {
      _id: '$users.quest.status',
      tasks: { $push: '$users.quest' },
    },
  },
];
const aggregateTasks = async (
  workspaceModel: string,
  pipeline: TAggregationPipeline,
): Promise<ITaskGroup> => {
  const aggregatedTasks = await DataAccess.aggregate(workspaceModel, pipeline);

  if (!aggregatedTasks.length) {
    throw new AppError('No tasks found for the user', 404);
  }

  return aggregatedTasks.reduce((acc: ITaskGroup, curr: { _id: string; tasks: IUserTask[] }) => {
    acc[curr._id] = curr.tasks;
    return acc;
  }, {});
};

export const changeTaskStatus = async (
  userToken: string,
  taskData: { workspaceId: string; taskId: string; newStatus: string },
): Promise<IUserTask> => {
  const userId = await findUserByToken(userToken);
  const updatedWorkspace = await updateTaskStatusInWorkspace(userId, taskData);
  return getUpdatedTaskFromWorkspace(updatedWorkspace, userId, taskData.taskId);
};
const updateTaskStatusInWorkspace = async (
  userId: string,
  { workspaceId, taskId, newStatus }: { workspaceId: string; taskId: string; newStatus: string },
): Promise<IWorkspace> => {
  const filter = { _id: workspaceId, 'users.userId': userId };
  const updateData = { $set: { 'users.$[user].quest.$[task].status': newStatus } };
  const options = { arrayFilters: [{ 'user.userId': userId }, { 'task._id': taskId }], new: true };

  const updatedWorkspace = await DataAccess.updateOne<IWorkspace>(
    workspaceModel,
    filter,
    updateData,
    options,
  );
  if (!updatedWorkspace) {
    throw new AppError('Workspace or user not found', 404);
  }
  return updatedWorkspace;
};
const getUpdatedTaskFromWorkspace = async (
  workspace: IWorkspace,
  userId: string,
  taskId: string,
): Promise<IUserTask> => {
  if (!workspace) {
    throw new AppError('Workspace is undefined', 500);
  }

  const user = workspace.users.find((user) => user.userId.toString() === userId);
  if (!user) {
    throw new AppError('User not found in workspace', 404);
  }

  if (!user.quest) {
    throw new AppError('No quest data available for the user', 404);
  }

  const updatedTask = user.quest.find((task) => task._id && task._id.toString() === taskId);
  if (!updatedTask) {
    throw new AppError('Task not found in user quest', 404);
  }

  return updatedTask;
};

export const addCommentToTask = async (
  userToken: string,
  commentData: { workspaceId: string; taskId: string; content: string },
): Promise<IPreSaveComment> => {
  const userId = await findUserByToken(userToken);
  const { workspaceId, taskId, content } = commentData;
  const comment = { userId, content, createdAt: new Date() };
  const filter = { _id: workspaceId, 'users.userId': userId, 'users.quest._id': taskId };
  const updateData = { $push: { 'users.$.quest.$.comments': comment } };
  await DataAccess.updateOne<IWorkspace>(workspaceModel, filter, updateData);
  return comment;
};

export const mentorChangeTaskStatus = async (
  movingTaskData: IChangeTaskByMentor,
): Promise<IUserTask> => {
  const { workspaceId, menteeId, taskId, status } = movingTaskData;

  const updatedWorkspace = await updateStatusInWorkspace({
    workspaceId,
    menteeId,
    taskId,
    status,
  });

  if (status === 'Done') {
    const starsEarned = await getTaskStarsEarned(taskId);
    if (starsEarned) {
      await addStarsToUser(workspaceId, menteeId, starsEarned);
    }
  }
  return getUpdatedTaskFromWorkspace(updatedWorkspace, menteeId, taskId);
};
const updateStatusInWorkspace = async ({
  workspaceId,
  menteeId,
  taskId,
  status,
}: IChangeTaskByMentor): Promise<IWorkspace> => {
  const filter = { _id: workspaceId, 'users.userId': menteeId };
  const updateData = { $set: { 'users.$[user].quest.$[task].status': status } };
  const options = {
    arrayFilters: [{ 'user.userId': menteeId }, { 'task._id': taskId }],
    new: true,
  };

  const updatedWorkspace = await DataAccess.updateOne<IWorkspace>(
    workspaceModel,
    filter,
    updateData,
    options,
  );

  if (!updatedWorkspace) {
    throw new AppError('Workspace or user not found', 404);
  }

  return updatedWorkspace;
};
const getTaskStarsEarned = async (taskId: string): Promise<number> => {
  const task = await DataAccess.findOneByConditions<ITask>(
    taskModel,
    { _id: taskId },
    { starsEarned: 1 },
  );

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return task.starsEarned;
};
const addStarsToUser = async (workspaceId: string, userId: string, stars: number) => {
  const filter = { _id: workspaceId, 'users.userId': userId };
  const updateData = { $inc: { 'users.$.stars': stars } };

  const updatedWorkspace = await DataAccess.updateOne<IWorkspace>(
    workspaceModel,
    filter,
    updateData,
  );

  if (!updatedWorkspace) {
    throw new AppError('Failed to update user stars', 500);
  }
};
