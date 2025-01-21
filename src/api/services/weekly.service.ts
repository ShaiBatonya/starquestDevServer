// src/api/services/weekly.service.js

import DataAccess from '@/api/utils/dataAccess';
import { IWeeklyReport } from '@/api/types/weekly.interface';
import { findUserByToken } from '@/api/services/jwt.service';
import AppError from '@/api/utils/appError';

const weeklyModel = 'WeeklyReport';

export const createWeeklyReport = async (
  token: string,
  reportData: Partial<IWeeklyReport>,
): Promise<IWeeklyReport> => {
  const userId = await findUserByToken(token);

  const today = new Date();

  verifyDayForReport(today);
  await checkExistingWeeklyReport(userId, today);

  const completeWeeklyReportData = { ...reportData, userId: userId };
  return DataAccess.create<IWeeklyReport>(weeklyModel, completeWeeklyReportData);
};

const verifyDayForReport = (today: Date): void => {
  const dayOfWeek = today.getDay();
  if (dayOfWeek !== 2 && dayOfWeek !== 3 && dayOfWeek !== 4) {
    throw new AppError('Weekly reports can only be created on Wednesday or Thursday.', 400);
  }
};

const checkExistingWeeklyReport = async (userId: string, today: Date): Promise<void> => {
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today.setDate(today.getDate() - dayOfWeek));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const existingReport = await DataAccess.exists<IWeeklyReport>(weeklyModel, {
    userId,
    createdAt: {
      $gte: startOfWeek,
      $lte: endOfWeek,
    },
  });

  if (existingReport) {
    throw new AppError('A weekly report has already been created this week.', 409);
  }
};

export const updateWeeklyReport = async (
  reportId: string,
  updateData: Partial<IWeeklyReport>,
): Promise<IWeeklyReport | null> => {
  const report = await DataAccess.findById<IWeeklyReport>(weeklyModel, reportId);
  if (!report) {
    throw new AppError('No report found with that ID', 404);
  }

  await DataAccess.updateById(weeklyModel, reportId, updateData);
  return report;
};

export const getUserWeeklyReports = async (token: string): Promise<IWeeklyReport[] | null> => {
  const userId = await findUserByToken(token);
  const options = { sort: { createdAt: -1 } };
  return DataAccess.findByConditions<IWeeklyReport>(weeklyModel, { userId }, null, options);
};
