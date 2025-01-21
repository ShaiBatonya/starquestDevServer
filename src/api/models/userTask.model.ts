// src/api/models/workspace.model.ts

import { Schema } from 'mongoose';
import { IComment, IUserTask } from '@/api/types/userTask.interface';

export const commentSchema = new Schema<IComment>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const userTaskSchema = new Schema<IUserTask>({
  tasks: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },
  ],
  status: {
    type: String,
    enum: ['Backlog', 'To Do', 'In Progress', 'In Review', 'Done'],
    default: 'Backlog',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  comments: [commentSchema],
});
