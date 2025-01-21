// src/api/types/weekly.interface.ts
import { Document, Types } from 'mongoose';

export interface IStatusDetail {
  status: boolean;
  details: string;
}
export interface ISharedGoals {
  goals: string[];
  shared: boolean;
}

export interface IWeeklyReport extends Document {
  userId: Types.ObjectId;
  moodRating: number;
  moodExplanation: string;
  significantEvent: string;
  newInterestingLearning: string;
  maintainWeeklyRoutine: IStatusDetail;
  achievedGoals: ISharedGoals;
  freeTime: IStatusDetail;
  productProgress: string;
  courseChapter: string;
  learningGoalAchievement: IStatusDetail;
  mentorInteraction: IStatusDetail;
  supportInteraction: IStatusDetail;
  additionalSupport: string;
  openQuestions: string;
}
