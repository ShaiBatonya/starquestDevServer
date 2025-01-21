// src/api/models/weekly.model.ts
import mongoose, { Schema } from 'mongoose';
import { IWeeklyReport, IStatusDetail, ISharedGoals } from '@/api/types/weekly.interface';

const statusDetailSchema = new Schema<IStatusDetail>(
  {
    status: { type: Boolean, required: true },
    details: { type: String, required: true },
  },
  { _id: false },
);

const goalsSchema = new Schema<ISharedGoals>(
  {
    goals: [{ type: String, required: true }],
    shared: { type: Boolean, required: true },
  },
  { _id: false },
);

const weeklyReportSchema = new Schema<IWeeklyReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    moodRating: { type: Number, required: true, min: 1, max: 5 },
    moodExplanation: { type: String, required: true },
    significantEvent: { type: String, default: '' },
    newInterestingLearning: { type: String, default: '' },
    maintainWeeklyRoutine: statusDetailSchema, //
    achievedGoals: goalsSchema,
    freeTime: statusDetailSchema,
    productProgress: { type: String, default: '' }, //
    courseChapter: { type: String, default: '' },
    learningGoalAchievement: statusDetailSchema,
    mentorInteraction: statusDetailSchema,
    supportInteraction: statusDetailSchema,
    additionalSupport: { type: String, default: '' },
    openQuestions: { type: String, default: '' },
  },
  { timestamps: true },
);

const WeeklyReport = mongoose.model<IWeeklyReport>('WeeklyReport', weeklyReportSchema);
export default WeeklyReport;
