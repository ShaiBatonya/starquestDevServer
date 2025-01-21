// src/api/types/userTask.interface.ts

import { ObjectId } from 'mongoose';

export interface IComment {
  userId: ObjectId;
  content: string;
  createdAt: Date;
}

export interface IUserTask {
  _id?: ObjectId;
  tasks: ObjectId[];
  status: 'Backlog' | 'To Do' | 'In Progress' | 'In Review' | 'Done';
  createdAt: Date;
  updatedAt: Date;
  comments: IComment[];
}
