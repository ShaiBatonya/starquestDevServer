// src/api/models/task.model.ts

import { Schema } from 'mongoose';
import { ITask } from '@/api/types/task.interface';

const validPlanets = [
  'Nebulae',
  'Solaris minor',
  'Solaris major',
  'White dwarf',
  'Supernova',
  'Space station',
];

export const taskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Learning courses', 'Product refinement', 'Mandatory sessions'],
    required: true,
  },
  starsEarned: {
    type: Number,
    default: 0,
  },
  planets: {
    type: [String],
    required: true,
    enum: validPlanets,
  },
  positions: {
    type: [Schema.Types.ObjectId],
    required: true,
  },
  isGlobal: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'User',
  },
  link: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
