// src/api/validations/dailyReport.validations.ts
import { z } from 'zod';

export const createDailyReportSchema = z.object({
  wakeupTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide time in HH:mm format'),
  mood: z.object({
    startOfDay: z.number(),
  }),
  morningRoutine: z.object({
    routine: z.string(),
  }),
  dailyGoals: z
    .array(
      z.object({
        description: z.string(),
      }),
    )
    .min(3, 'Please provide between 3 to 5 daily goals')
    .max(5, 'Please provide between 3 to 5 daily goals'),
  expectedActivity: z.array(
    z.object({
      duration: z.number(),
      category: z.enum([
        'learning',
        'better me',
        'project',
        'product refinement',
        'technical sessions',
        'networking',
      ]),
    }),
  ),
});

export const updateDailyReportSchema = z.object({
  mood: z
    .object({
      startOfDay: z.number().optional(),
    })
    .optional(),
  wakeupTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide time in HH:mm format')
    .optional(),
  morningRoutine: z
    .object({
      routine: z.string().optional(),
    })
    .optional(),
  dailyGoals: z
    .array(
      z.object({
        description: z.string(),
        completed: z.boolean().optional(),
      }),
    )
    .min(3, 'Please provide between 3 to 5 daily goals')
    .max(5, 'Please provide between 3 to 5 daily goals')
    .optional(),
  expectedActivity: z
    .array(
      z.object({
        duration: z.number().optional(),
        category: z
          .enum([
            'learning',
            'better me',
            'project',
            'product refinement',
            'technical sessions',
            'networking',
          ])
          .optional(),
      }),
    )
    .optional(),
});

export const updateEndOfDaySchema = z.object({
  mood: z.object({
    endOfDay: z.number(),
  }),
  dailyGoals: z.array(
    z.object({
      description: z.string(),
      completed: z.boolean(),
    }),
  ),
  actualActivity: z.array(
    z.object({
      duration: z.number(),
      category: z.enum([
        'learning',
        'better me',
        'project',
        'product refinement',
        'technical sessions',
        'networking',
      ]),
    }),
  ),
});
