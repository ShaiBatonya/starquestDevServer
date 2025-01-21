// src/api/validations/report.validations.ts

import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const reportFieldSchema = z.object({
  fieldName: z.string().min(1, 'Field name is required'),
  expected: z.string().optional(),
  actual: z.string().optional(),
  requireExpected: z.boolean().default(false),
});

const reportScheduleSchema = z.object({
  frequency: z.enum(['always', 'daily', 'weekly', 'specific_days']),
  specificDays: z
    .array(z.enum(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']))
    .optional(),
  timesPerDay: z.number().optional(),
});

const reportSubmissionSchema = z.object({
  fields: z.array(reportFieldSchema),
  submittedAt: z.date().optional(),
});

export const createReportValidation = z.object({
  workspaceId: z.string().regex(objectIdRegex, 'Invalid ObjectId format').optional(),
  reportName: z.string().min(1, 'Report name is required'),
  description: z.string().min(1, 'Description is required'),
  fields: z.array(reportFieldSchema).nonempty(),
  schedule: reportScheduleSchema,
  submissions: z.array(reportSubmissionSchema).optional(),
});

export const updateReportValidation = z.object({
  workspaceId: z.string().regex(objectIdRegex, 'Invalid ObjectId format').optional(),
  reportName: z.string().optional(),
  description: z.string().optional(),
  fields: z.array(reportFieldSchema).optional(),
  schedule: reportScheduleSchema.optional(),
  submissions: z.array(reportSubmissionSchema).optional(),
});
