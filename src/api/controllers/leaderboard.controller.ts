import { Request, Response } from 'express';
import catchAsync from '@/api/utils/catchAsync';
import { getLeaderboard } from '@/api/services/leaderboard.service';
import { sendSuccessResponse } from '@/api/utils/appResponse';

export const getLeaderboardController = catchAsync(async (req: Request, res: Response) => {
  const leaderboard = await getLeaderboard(req.params.workspaceId);
  sendSuccessResponse(res, 200, leaderboard);
});
