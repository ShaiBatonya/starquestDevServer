// src/api/controllers/weekly.controller.ts
import { Request, Response } from 'express';
import catchAsync from '@/api/utils/catchAsync';
import {
  createWeeklyReport,
  updateWeeklyReport,
  getUserWeeklyReports,
} from '@/api/services/weekly.service';
import { getOne } from '@/api/services/factory.service';
import { sendSuccessResponse } from '@/api/utils/appResponse';

export const createWeeklyReportController = catchAsync(async (req: Request, res: Response) => {
  const report = await createWeeklyReport(req.cookies?.jwt, req.body);
  sendSuccessResponse(res, 201, report);
});

export const updateWeeklyReportController = catchAsync(async (req: Request, res: Response) => {
  const { reportId } = req.params;
  const report = await updateWeeklyReport(reportId, req.body);
  sendSuccessResponse(res, 200, report);
});

export const getUserWeeklyReportsController = catchAsync(async (req: Request, res: Response) => {
  const reports = await getUserWeeklyReports(req.cookies?.jwt);
  sendSuccessResponse(res, 200, reports);
});

export const getWeeklyReportController = getOne('WeeklyReport');
