// src/api/types/report.interface.ts

import { Document, ObjectId } from 'mongoose';

export interface IReportField {
  fieldName: string;
  expected?: any;
  actual?: any;
}

export interface IReportSchedule {
  frequency: 'always' | 'daily' | 'weekly' | 'specific_days';
  specificDays?: Array<
    'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
  >;
  timesPerDay?: number;
}

export interface IReportSubmission {
  userId: ObjectId;
  fields: IReportField[];
  submittedAt: Date;
}

export interface IReport extends Document {
  workspaceId: ObjectId;
  reportName: string;
  description?: string;
  createdBy: ObjectId;
  fields: IReportField[];
  requireExpected: boolean;
  schedule: IReportSchedule;
  submissions: IReportSubmission[];
}
