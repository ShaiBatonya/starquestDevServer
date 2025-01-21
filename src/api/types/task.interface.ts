// src/api/types/task.interface.ts

import { Document, ObjectId } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  createdAt: Date;
  category: 'Learning courses' | 'Product refinement' | 'Mandatory sessions';
  updatedAt: Date;
  starsEarned: number;
  planets: (
    | 'Nebulae'
    | 'Solaris minor'
    | 'Solaris major'
    | 'White dwarf'
    | 'Supernova'
    | 'Space station'
  )[];
  positions?: ObjectId[];
  isGlobal?: boolean;
  userId: ObjectId;
  link?: string;
}
