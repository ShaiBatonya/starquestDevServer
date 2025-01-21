// src/api/controllers/auth.controller.ts
import { Request, Response } from 'express';
import catchAsync from '@/api/utils/catchAsync';
import {
  submitDailyReport,
  getMyDailyReports,
  updateDailyReport,
  submitEndOfDay,
} from '@/api/services/dailyReport.service';
import { getOne } from '@/api/services/factory.service';
import { sendSuccessResponse } from '@/api/utils/appResponse';

export const submitDailyReportContoller = catchAsync(async (req: Request, res: Response) => {
  const report = await submitDailyReport(req.cookies?.jwt, req.body);
  sendSuccessResponse(res, 201, report);
});

export const updateDailyReportController = catchAsync(async (req: Request, res: Response) => {
  const { reportId } = req.params;
  const report = await updateDailyReport(reportId, req.body);
  sendSuccessResponse(res, 200, report);
});

export const submitEndOfDayController = catchAsync(async (req: Request, res: Response) => {
  const { reportId } = req.params;
  const { actualActivityData, endOfDayMood } = req.body;
  const report = await submitEndOfDay(reportId, actualActivityData, endOfDayMood);
  sendSuccessResponse(res, 200, report);
});

export const getMyDailyReportsController = catchAsync(async (req: Request, res: Response) => {
  const reports = await getMyDailyReports(req.cookies?.jwt);
  sendSuccessResponse(res, 200, reports);
});

export const getDailyReportController = getOne('DailyReport');
