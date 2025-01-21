// src/api/types/dailyReport.interface.ts
import { Document, Types } from 'mongoose';

export interface IGoal {
  description: string;
  completed?: boolean;
}

export interface IActivity {
  duration: number;
  category:
    | 'learning'
    | 'better me'
    | 'project'
    | 'product refinement'
    | 'technical sessions'
    | 'networking';
}

export interface IDailyReport extends Document {
  userId: Types.ObjectId;
  date: Date;
  mood: {
    startOfDay: number;
    endOfDay: number;
  };

  wakeupTime: string;
  morningRoutine: {
    routine: string;
    completed?: boolean;
  };
  dailyGoals: IGoal[];
  expectedActivity: IActivity[];
  actualActivity?: IActivity[];
}
