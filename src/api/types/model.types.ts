// src/api/types/model.types.ts

import { IDailyReport } from './dailyReport.interface';
import { IReport } from './report.interface';
import { IUser } from './user.interface';
import { IWeeklyReport } from './weekly.interface';
import { IWorkspace } from './workspace.interface';

type ModelTypes = {
  DailyReport: IDailyReport;
  Report: IReport;
  User: IUser;
  WeeklyReport: IWeeklyReport;
  Workspace: IWorkspace;
};

export default ModelTypes;
