// src/api/services/dailyReport.service.ts
import DataAccess from '@/api/utils/dataAccess';
import { IActivity, IDailyReport } from '@/api/types/dailyReport.interface';
import { findUserByToken } from '@/api/services/jwt.service';
import AppError from '@/api/utils/appError';

const dailyModel = 'DailyReport';

export const submitDailyReport = async (
  token: string,
  reportData: Partial<IDailyReport>,
): Promise<IDailyReport> => {
  const userId = await findUserByToken(token);

  const currentDate = reportData.date || new Date();

  await checkExistingReport(userId, currentDate);

  const completeReportData = { ...reportData, userId };
  return DataAccess.create<IDailyReport>(dailyModel, completeReportData);
};

const checkExistingReport = async (userId: string, date: Date | undefined): Promise<void> => {
  const checkDate = date ? new Date(date) : new Date();

  checkDate.setHours(0, 0, 0, 0);
  const startOfDay = new Date(checkDate);

  checkDate.setHours(23, 59, 59, 999);
  const endOfDay = new Date(checkDate);

  const exists = await DataAccess.exists<IDailyReport>(dailyModel, {
    userId,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  if (exists) {
    throw new AppError('A report already exists for this user on the specified date', 400);
  }
};

export const updateDailyReport = async (
  reportId: string,
  updateData: Partial<IDailyReport>,
): Promise<IDailyReport | null> => {
  const report = await DataAccess.findById<IDailyReport>(dailyModel, reportId);

  if (!report) {
    throw new AppError('No report found with that ID', 404);
  }

  report.mood.startOfDay = updateData.mood?.startOfDay ?? report.mood.startOfDay;
  report.wakeupTime = updateData.wakeupTime ?? report.wakeupTime;
  report.morningRoutine.routine =
    updateData.morningRoutine?.routine ?? report.morningRoutine.routine;

  if (updateData.dailyGoals && updateData.dailyGoals.length) {
    report.dailyGoals = updateData.dailyGoals;
  }

  await DataAccess.saveDocument(report);

  return report;
};

export const submitEndOfDay = async (
  reportId: string,
  actualActivityData: IActivity[],
  endOfDayMood: number,
): Promise<IDailyReport | null> => {
  const updateData = {
    $set: {
      'mood.endOfDay': endOfDayMood,
      actualActivity: actualActivityData,
    },
  };

  return DataAccess.updateOne<IDailyReport>(dailyModel, { _id: reportId }, updateData);
};

export const getMyDailyReports = async (token: string): Promise<IDailyReport[] | null> => {
  const userId = await findUserByToken(token);
  const options = { sort: { createdAt: -1 } };
  return DataAccess.findByConditions<IDailyReport>(dailyModel, { userId }, null, options);
};
