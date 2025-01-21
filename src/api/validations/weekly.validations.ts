// src/api/validations/weekly.validations.ts
import { z } from 'zod';

export const createWeeklyReportSchema = z.object({
  moodRating: z.number().min(1).max(5),
  moodExplanation: z.string().min(1),
  significantEvent: z.string().optional(),
  newInterestingLearning: z.string().optional(),
  maintainWeeklyRoutine: z.object({
    status: z.boolean(),
    details: z.string().min(1),
  }),
  achievedGoals: z.object({
    goals: z.array(z.string()).nonempty(),
    shared: z.boolean(),
  }),
  freeTime: z.object({
    status: z.boolean(),
    details: z.string().min(1),
  }),
  productProgress: z.string().optional(),
  courseChapter: z.string().optional(),
  learningGoalAchievement: z.object({
    status: z.boolean(),
    details: z.string().min(1),
  }),
  mentorInteraction: z.object({
    status: z.boolean(),
    details: z.string().min(1),
  }),
  supportInteraction: z.object({
    status: z.boolean(),
    details: z.string().min(1),
  }),
  additionalSupport: z.string().optional(),
  openQuestions: z.string().optional(),
});

export const updateWeeklyReportSchema = z
  .object({
    moodRating: z.number().min(1).max(5).optional(),
    moodExplanation: z.string().optional(),
    significantEvent: z.string().optional(),
    newInterestingLearning: z.string().optional(),
    maintainWeeklyRoutine: z
      .object({
        status: z.boolean(),
        details: z.string(),
      })
      .optional(),
    achievedGoals: z
      .object({
        goals: z.array(z.string()),
        shared: z.boolean(),
      })
      .optional(),
    freeTime: z
      .object({
        status: z.boolean(),
        details: z.string(),
      })
      .optional(),
    productProgress: z.string().optional(),
    courseChapter: z.string().optional(),
    learningGoalAchievement: z
      .object({
        status: z.boolean(),
        details: z.string(),
      })
      .optional(),
    mentorInteraction: z
      .object({
        status: z.boolean(),
        details: z.string(),
      })
      .optional(),
    supportInteraction: z
      .object({
        status: z.boolean(),
        details: z.string(),
      })
      .optional(),
    additionalSupport: z.string().optional(),
    openQuestions: z.string().optional(),
  })
  .partial();
