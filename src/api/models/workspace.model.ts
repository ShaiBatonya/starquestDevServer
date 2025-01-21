// src/api/models/workspace.model.ts

import mongoose, { Schema } from 'mongoose';
import { IWorkspaceUser, IWorkspace, IPosition } from '@/api/types/workspace.interface';
import { userTaskSchema } from '@/api/models/userTask.model';
import { taskSchema } from '@/api/models/task.model';

const positionSchema = new Schema<IPosition>({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
});

const userWorkspaceSchema = new Schema<IWorkspaceUser>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  inviterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  role: {
    type: String,
    enum: ['admin', 'mentee', 'mentor'],
    default: 'mentee',
  },
  position: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position',
    required: false,
  },
  planet: {
    type: String,
    required: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  quest: [userTaskSchema],
  stars: {
    type: Number,
    default: 0,
  },
});

const workspaceSchema = new Schema<IWorkspace>({
  name: {
    type: String,
    required: [true, 'Workspace name is required'],
    default: 'New Workspace',
  },
  description: {
    type: String,
    required: [true, 'Workspace description is required'],
    default: 'A newly created workspace awaiting description.',
  },
  rules: {
    type: String,
    required: [true, 'Workspace rules are required'],
    default: 'Standard workspace rules apply. Customize as needed.',
  },
  image: {
    type: String,
  },
  positions: [positionSchema],
  planets: {
    type: [String],
    default: [
      'Nebulae',
      'Solaris minor',
      'Solaris major',
      'White dwarf',
      'Supernova',
      'Space station',
    ],
  },
  backlog: [taskSchema],
  users: [userWorkspaceSchema],
});

const Workspace = mongoose.model<IWorkspace>('Workspace', workspaceSchema);

export default Workspace;
