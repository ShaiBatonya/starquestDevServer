// src/api/types/workspace.interface.ts

import { Document, ObjectId } from 'mongoose';
import { IUserTask } from '@/api/types/userTask.interface';
import { ITask } from '@/api/types/task.interface';

export interface IPosition extends Document {
  name: string;
  color: string;
}

export interface IWorkspaceUser extends Document {
  userId: ObjectId;
  inviterId?: ObjectId;
  role: 'admin' | 'mentee' | 'mentor';
  position?: ObjectId;
  planet?: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  quest?: IUserTask[];
  stars: number;
}

export interface IWorkspace extends Document {
  name: string;
  description: string;
  rules: string;
  image?: string;
  positions: IPosition[];
  planets: string[];
  backlog?: ITask[];
  users: [IWorkspaceUser];
}
