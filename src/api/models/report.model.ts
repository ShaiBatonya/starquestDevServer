// src/api/models/report.model.ts

import mongoose, { Schema } from 'mongoose';
import {
  IReport,
  IReportField,
  IReportSchedule,
  IReportSubmission,
} from '@/api/types/report.interface';

const reportFieldSchema = new Schema<IReportField>(
  {
    fieldName: {
      type: String,
      required: true,
    },
    expected: {
      type: Schema.Types.Mixed,
      required: false,
    },
    actual: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  { _id: false },
);

const reportScheduleSchema = new Schema<IReportSchedule>(
  {
    frequency: {
      type: String,
      enum: ['always', 'daily', 'weekly', 'specific_days'],
      required: true,
    },
    specificDays: [
      {
        type: String,
        enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
    ],
    timesPerDay: {
      type: Number,
      default: 1,
    },
  },
  { _id: false },
);

const reportSubmissionSchema = new Schema<IReportSubmission>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  fields: [reportFieldSchema],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const reportSchema = new Schema<IReport>({
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
  },
  reportName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fields: [reportFieldSchema],
  requireExpected: {
    type: Boolean,
    required: true,
  },
  schedule: reportScheduleSchema,
  submissions: [reportSubmissionSchema],
});

const Report = mongoose.model<IReport>('Report', reportSchema);

export default Report;
