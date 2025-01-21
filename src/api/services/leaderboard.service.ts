// src/api/services/leaderboard.service.ts
import DataAccess from '@/api/utils/dataAccess';
import AppError from '@/api/utils/appError';
import { ILeaderboardUser } from '@/api/types/leaderboard.interface';

const workspaceModel = 'Workspace';

export const getLeaderboard = async (workspaceId: string): Promise<ILeaderboardUser[]> => {
  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const participants = await DataAccess.aggregate(workspaceModel, [
    { $match: { _id: workspaceId } },
    { $unwind: '$users' },
    {
      $lookup: {
        from: 'users',
        localField: 'users.userId',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    { $unwind: '$userDetails' },
    {
      $lookup: {
        from: 'tasks',
        let: { userId: '$userDetails._id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$userId', '$$userId'] },
              createdAt: { $gte: startOfWeek },
              status: 'Done',
            },
          },
          {
            $group: {
              _id: null,
              totalStars: { $sum: '$starsEarned' },
              weeklyStars: { $sum: '$starsEarned' },
              coursesCompleted: { $push: '$title' },
            },
          },
        ],
        as: 'taskDetails',
      },
    },
    {
      $addFields: {
        totalStars: { $arrayElemAt: ['$taskDetails.totalStars', 0] },
        weeklyStars: { $arrayElemAt: ['$taskDetails.weeklyStars', 0] },
        badgesCount: { $size: '$userDetails.badges' },
        completedCourses: { $arrayElemAt: ['$taskDetails.coursesCompleted', 0] },
      },
    },
    {
      $project: {
        _id: 0,
        rank: { $literal: 0 },
        name: { $concat: ['$userDetails.firstName', ' ', '$userDetails.lastName'] },
        position: '$users.position',
        badgesCount: 1,
        totalStars: 1,
        weeklyStars: 1,
        completedCourses: 1,
      },
    },
    { $sort: { totalStars: -1, badgesCount: -1 } },
  ]);

  if (participants?.length === 0) {
    throw new AppError('No participants found in this workspace', 404);
  }

  // Assign ranks based on the sorted order
  participants.forEach((part, index) => (part.rank = index + 1));

  return participants;
};
