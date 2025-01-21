// src/api/models/dailyReport.model.ts
import mongoose, { Schema } from 'mongoose';
import { IGoal, IDailyReport, IActivity } from '@/api/types/dailyReport.interface';

const goalSchema = new Schema<IGoal>(
  {
    description: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { _id: false },
);

const activitySchema = new Schema<IActivity>(
  {
    duration: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'learning',
        'better me',
        'project',
        'product refinement',
        'technical sessions',
        'networking',
      ],
    },
  },
  { _id: false },
);

const dailyReportSchema = new Schema<IDailyReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    wakeupTime: { type: String, required: true },
    mood: {
      startOfDay: { type: Number, required: true },
      endOfDay: { type: Number, required: false },
    },
    morningRoutine: {
      routine: { type: String, required: true },
      completed: { type: Boolean, required: true, default: false },
    },
    dailyGoals: {
      type: [goalSchema],
      required: [true, 'Please provide between 3 to 5 daily goals'],
    },
    expectedActivity: [activitySchema],
    actualActivity: [activitySchema],
  },
  { timestamps: true },
);

dailyReportSchema.pre('save', function (next) {
  if (this.mood.startOfDay && !this.mood.endOfDay) {
    this.mood.endOfDay = this.mood.startOfDay;
  }
  next();
});

const DailyReport = mongoose.model<IDailyReport>('DailyReport', dailyReportSchema);

export default DailyReport;
