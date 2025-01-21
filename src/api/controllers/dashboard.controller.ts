// src/api/controllers/dashboard.controller.ts

import { Request, Response } from 'express';
import catchAsync from '@/api/utils/catchAsync';
import { getWeeklyDashboardStats, getMonthlyDashboard } from '@/api/services/dashboard.service';
import { sendSuccessResponse } from '@/api/utils/appResponse';

export const getWeeklyDashboardStatsController = catchAsync(async (req: Request, res: Response) => {
  const stats = await getWeeklyDashboardStats(req.cookies?.jwt);
  sendSuccessResponse(res, 200, stats);
});

export const getMonthlyDashboardStatsController = catchAsync(
  async (req: Request, res: Response) => {
    const stats = await getMonthlyDashboard(req.cookies?.jwt);
    sendSuccessResponse(res, 200, stats);
  },
);
