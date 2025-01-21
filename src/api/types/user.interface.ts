// src/api/types/user.interface.ts

import { Document } from 'mongoose';
import { IWorkspace } from './workspace.interface';

export interface IUserWorkspace {
  workspaceId: IWorkspace['_id'];
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
  role: 'user' | 'admin';
  password: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  phoneNumber: string;
  workspaces: IUserWorkspace[];
  emailVerificationCode?: string;
  emailVerificationCodeExpires?: Date;
  isEmailVerified: boolean;
  active: boolean;
  correctPassword(candidatePassword: string): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  createPasswordResetToken(): string;
  generateEmailVerificationCode(): string;
}
