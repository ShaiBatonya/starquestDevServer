import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import mongoose from 'mongoose';
import DataAccess from '@/api/utils/dataAccess';
import { findUserByToken } from '@/api/services/jwt.service';

const dailyModel = 'DailyReport';

interface DashboardStats {
  averageMood: number;
  averageWakeupHour: number;
  morningRoutineSuccessRate: number;
  goalsAchievedDays: number;
  totalDays: number;
  averageStudyHoursPerWeek: number;
}

interface CategoryPercentage {
  category: string;
  totalHours: number;
  percentage: number;
}

interface CategoryTimeInvestment {
  totalMinutesActual: number;
  yearWeek: string;
  category: string;
  totalMinutesExpected: number;
  differenceMinutes: number;
  differenceHours: number;
}

interface CombinedResults {
  dashboardStats: DashboardStats[];
  categoryPercentages: CategoryPercentage[];
  categoryTimeInvestment: CategoryTimeInvestment[];
}

interface PipelineStage {
  $match?: object;
  $unwind?: object | string;
  $group?: object;
  $addFields?: object;
  $project?: object;
  $sort?: object;
}

export const getWeeklyDashboardStats = async (token: string): Promise<CombinedResults> => {
  const user = await findUserByToken(token);
  const startOfTheWeek = startOfWeek(new Date());
  const endOfTheWeek = endOfWeek(new Date());
  const userId = new mongoose.Types.ObjectId(user);

  const dashboardStatsPipeline = constructDashboardStatsPipeline(
    userId,
    startOfTheWeek,
    endOfTheWeek,
  );

  const categoryPercentagePipeline = constructCategoryPercentagePipeline(
    userId,
    startOfTheWeek,
    endOfTheWeek,
  );

  const categoryTimeInvestmentPipeline = constructWeeklyCategoryTimeInvestmentPipeline(
    userId,
    startOfTheWeek,
    endOfTheWeek,
  );

  const [result1, result2, result3] = await Promise.all([
    DataAccess.aggregate(dailyModel, dashboardStatsPipeline),
    DataAccess.aggregate(dailyModel, categoryPercentagePipeline),
    DataAccess.aggregate(dailyModel, categoryTimeInvestmentPipeline),
  ]);

  const combinedResults = {
    dashboardStats: result1,
    categoryPercentages: result2,
    categoryTimeInvestment: result3,
  };

  return combinedResults;
};

const constructDashboardStatsPipeline = (
  userId: mongoose.Types.ObjectId,
  startOfTheWeek: Date,
  endOfTheWeek: Date,
): PipelineStage[] => {
  const pipeline = [
    {
      $match: {
        userId,
        date: {
          $gte: new Date(startOfTheWeek.toISOString()),
          $lte: new Date(endOfTheWeek.toISOString()),
        },
      },
    },
    {
      $addFields: {
        allGoalsCompleted: {
          $reduce: {
            input: '$dailyGoals',
            initialValue: true,
            in: { $and: ['$$value', '$$this.completed'] },
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        averageMood: { $avg: '$mood.endOfDay' },
        averageWakeupHour: { $avg: { $toInt: { $substr: ['$wakeupTime', 0, 2] } } },
        morningRoutineSuccessRate: { $sum: { $cond: ['$morningRoutine.completed', 1, 0] } },
        goalsAchievedDays: { $sum: { $cond: ['$allGoalsCompleted', 1, 0] } },
        totalDays: { $sum: 1 },
        totalStudyMinutes: { $sum: { $sum: '$actualActivity.duration' } },
      },
    },
    {
      $addFields: {
        averageStudyHoursPerWeek: {
          $divide: [{ $divide: ['$totalStudyMinutes', '$totalDays'] }, 60],
        },
      },
    },
    {
      $project: {
        averageMood: 1,
        averageWakeupHour: 1,
        morningRoutineSuccessRate: 1,
        goalsAchievedDays: 1,
        averageStudyHoursPerWeek: 1,
        totalDays: 1,
      },
    },
  ];
  return pipeline;
};

const constructCategoryPercentagePipeline = (
  userId: mongoose.Types.ObjectId,
  startOfTheWeek: Date,
  endOfTheWeek: Date,
): PipelineStage[] => {
  const pipeline = [
    {
      $match: {
        userId,
        date: {
          $gte: new Date(startOfTheWeek.toISOString()),
          $lte: new Date(endOfTheWeek.toISOString()),
        },
      },
    },
    {
      $unwind: '$actualActivity',
    },
    {
      $group: {
        _id: '$actualActivity.category',
        totalMinutes: { $sum: '$actualActivity.duration' },
      },
    },
    {
      $group: {
        _id: null,
        categories: {
          $push: {
            category: '$_id',
            totalMinutes: '$totalMinutes',
            totalHours: { $divide: ['$totalMinutes', 60] },
          },
        },
        totalDurationAllCategories: { $sum: '$totalMinutes' },
      },
    },
    {
      $unwind: '$categories',
    },
    {
      $project: {
        _id: 0,
        category: '$categories.category',
        totalHours: {
          $round: [{ $divide: ['$categories.totalMinutes', 60] }, 2],
        },
        percentage: {
          $round: [
            {
              $multiply: [
                { $divide: ['$categories.totalMinutes', '$totalDurationAllCategories'] },
                100,
              ],
            },
            2,
          ],
        },
      },
    },
    {
      $sort: { category: 1 },
    },
  ];

  return pipeline;
};

const constructWeeklyCategoryTimeInvestmentPipeline = (
  userId: mongoose.Types.ObjectId,
  startOfTheWeek: Date,
  endOfTheWeek: Date,
): PipelineStage[] => {
  const pipeline = [
    {
      $match: {
        userId,
        date: {
          $gte: startOfTheWeek,
          $lte: endOfTheWeek,
        },
      },
    },
    {
      $unwind: '$actualActivity',
    },
    {
      $group: {
        _id: {
          yearWeek: { $dateToString: { format: '%Y-%U', date: '$date' } },
          category: '$actualActivity.category',
        },
        totalMinutesActual: { $sum: '$actualActivity.duration' },
      },
    },
    {
      $lookup: {
        from: 'dailyreports', // Assuming the expected activities are in the same collection
        as: 'expectedData',
        let: { category: '$_id.category', yearWeek: '$_id.yearWeek' },
        pipeline: [
          {
            $unwind: '$expectedActivity',
          },
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$$category', '$expectedActivity.category'] },
                  { $eq: [{ $dateToString: { format: '%Y-%U', date: '$date' } }, '$$yearWeek'] },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalMinutesExpected: { $sum: '$expectedActivity.duration' },
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$expectedData',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        yearWeek: '$_id.yearWeek',
        category: '$_id.category',
        totalMinutesActual: 1,
        totalMinutesExpected: '$expectedData.totalMinutesExpected',
        differenceMinutes: {
          $subtract: ['$totalMinutesActual', '$expectedData.totalMinutesExpected'],
        },
      },
    },
    {
      $addFields: {
        differenceHours: { $divide: ['$differenceMinutes', 60] },
      },
    },
    {
      $sort: { yearWeek: 1, category: 1 },
    },
  ];
  return pipeline;
};

export const getMonthlyDashboard = async (token: string): Promise<any> => {
  const user = await findUserByToken(token);
  const currentMonth = endOfMonth(new Date());
  const sixMonthsAgo = startOfMonth(subMonths(currentMonth, 6));
  const userId = new mongoose.Types.ObjectId(user);

  const monthlyCategoryPipeline = constructMonthlyCategoryTimeInvestmentPipeline(
    userId,
    currentMonth,
    sixMonthsAgo,
  );
  const result1 = await DataAccess.aggregate(dailyModel, monthlyCategoryPipeline);

  return result1;
};

const constructMonthlyCategoryTimeInvestmentPipeline = (
  userId: mongoose.Types.ObjectId,
  currentMonth: Date,
  sixMonthsAgo: Date,
): PipelineStage[] => {
  const pipeline = [
    {
      $match: {
        userId,
        date: {
          $gte: sixMonthsAgo,
          $lte: currentMonth,
        },
      },
    },
    {
      $project: {
        yearMonth: { $substr: ['$date', 0, 7] },
        actualActivity: 1,
      },
    },
    {
      $unwind: '$actualActivity',
    },
    {
      $group: {
        _id: {
          yearMonth: '$yearMonth',
          category: '$actualActivity.category',
        },
        totalMinutes: { $sum: '$actualActivity.duration' },
      },
    },
    {
      $group: {
        _id: '$_id.category',
        monthlyStats: {
          $push: {
            yearMonth: { $toDate: '$_id.yearMonth' },
            totalHours: { $round: [{ $divide: ['$totalMinutes', 60] }, 2] },
            percentage: { $round: [{ $multiply: [{ $divide: ['$totalMinutes', 60] }, 100] }, 2] },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        monthlyStats: 1,
      },
    },
  ];
  return pipeline;
};
