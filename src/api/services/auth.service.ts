// src/api/services/auth.service.ts

import AppError from '@/api/utils/appError';
import DataAccess from '@/api/utils/dataAccess';
import sendEmail from '@/config/nodeMailer';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { IUser } from '@/api/types/user.interface';
import { IWorkspace } from '@/api/types/workspace.interface';
import { vars } from '@/config/vars';
import { generateVerificationEmailContent } from '@/api/emailTemplate/verificationEmailTemplate';
import { generateResetPasswordEmailContent } from '@/api/emailTemplate/resetPasswordEmailTemplate';
import {
  createTokenSendResponse,
  extractToken,
  verifyToken,
  getUserAndCheck,
} from '@/api/services/jwt.service';
import mongoose from 'mongoose';

const { nodeEnv } = vars;
const userModel = 'User';
const workspaceModel = 'Workspace';

export const authenticate = async (
  req: Request,
  next: NextFunction,
): Promise<IUser | null | void> => {
  const token = extractToken(req);
  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return next(new AppError('Invalid token or token expired', 401));
  }

  // eslint-disable-next-line no-return-await
  return await getUserAndCheck(decoded, next);
};

export const signup = async (
  userData: Partial<IUser>,
): Promise<{ status: string; message: string }> => {
  await isUserExists(userData.email);
  const newUser = await DataAccess.create<IUser>(userModel, userData);
  const newWorkspace = await createDefaultWorkspace(newUser._id);
  await addWorkspaceToUser(newUser, newWorkspace._id);

  const verificationCode = newUser.generateEmailVerificationCode();
  await DataAccess.saveDocument(newUser);

  await sendVerificationEmail(newUser, verificationCode);

  return {
    status: 'success',
    message: 'Verification email sent to user',
  };
};

const isUserExists = async (email: string | undefined): Promise<void> => {
  const existingUser = await DataAccess.findOneByConditions<IUser>(userModel, { email });
  if (existingUser) {
    throw new AppError('User already exists', 400);
  }
};

const createDefaultWorkspace = async (userId: mongoose.Types.ObjectId): Promise<IWorkspace> => {
  const defaultWorkspaceData = {
    name: 'Default Workspace',
    description: 'Your personal workspace',
    rules: 'Standard workspace rules',
    users: [
      {
        userId,
        isVerified: true,
        verificationToken: '',
        verificationTokenExpires: new Date(Date.now() + 30 * 60 * 1000),
      },
    ],
  };

  const workspace = await DataAccess.create<IWorkspace>(workspaceModel, defaultWorkspaceData);

  return workspace;
};

const addWorkspaceToUser = async (
  user: IUser,
  workspaceId: mongoose.Types.ObjectId,
): Promise<void> => {
  user.workspaces.push({
    workspaceId,
  });
};

const sendVerificationEmail = async (user: IUser, verificationCode: string): Promise<void> => {
  const { message, htmlMessage } = generateVerificationEmailContent(user, verificationCode);

  await sendEmail({
    email: user.email,
    subject: 'Please verify your account',
    message: message,
    html: htmlMessage,
  });
};

const updateUserVerificationStatus = async (user: IUser): Promise<void> => {
  user.isEmailVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationCodeExpires = undefined;
  console.log(user);
  await DataAccess.saveDocument(user, { validateBeforeSave: false });
};

export const verifyEmail = async (
  code: string,
  email: string,
  _next: NextFunction,
): Promise<{ status: string; message: string } | any> => {
  const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
  const user = await findUser(
    {
      email: email,
      emailVerificationCode: hashedCode,
      emailVerificationCodeExpires: { $gt: new Date() },
    },
    'Token is invalid or has expired',
    400,
  );

  await updateUserVerificationStatus(user);

  return {
    status: 'success',
    message: 'Email verified successfully.',
  };
};

export const login = async (
  email: string,
  password: string,
  next: NextFunction,
  res: Response,
): Promise<void> => {
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await DataAccess.findOneByConditions<IUser>(userModel, { email }, '+password');
  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  /* if (!user.isEmailVerified) {
    return next(new AppError('Not verified', 401));
  } */

  return createTokenSendResponse(user, 200, res);
};

export const logout = (): {
  cookieName: string;
  cookieValue: string;
  cookieOptions: Record<string, any>;
} => {
  return {
    cookieName: 'jwt',
    cookieValue: 'loggedout',
    cookieOptions: {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      secure: nodeEnv === 'production',
    },
  };
};

export const forgotPassword = async (
  email: string,
  req: Request,
  _next: NextFunction,
): Promise<string | void> => {
  const user = await findUser({ email }, 'There is no user with that email address.');
  const resetToken = await generateAndSaveResetToken(user);
  await sendResetPasswordEmail(req, user, resetToken);

  return 'Token sent to email!';
};

async function findUser(
  conditions: Record<string, any>,
  errorMessage: string,
  errorCode: number = 404,
  selectFields?: string | string[],
): Promise<IUser> {
  const user = await DataAccess.findOneByConditions<IUser>(userModel, conditions, selectFields);
  if (!user) {
    throw new AppError(errorMessage, errorCode);
  }
  return user;
}

async function sendResetPasswordEmail(
  req: Request,
  user: IUser,
  resetToken: string,
): Promise<void> {
  const message = generateResetPasswordEmailContent(req, resetToken);

  const isEmailSent = await sendEmail({
    email: user.email,
    subject: 'Your password reset token (valid for 10 min)',
    message,
  });

  if (!isEmailSent) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await DataAccess.saveDocument(user, { validateBeforeSave: false });
    throw new AppError('There was an error sending the email. Try again later!', 500);
  }
}

async function generateAndSaveResetToken(user: IUser): Promise<string> {
  const resetToken = user.createPasswordResetToken();
  await DataAccess.saveDocument(user, { validateBeforeSave: false });
  return resetToken;
}

export const resetPassword = async (token: string, newPassword: string): Promise<string> => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await findUser(
    {
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    },
    'Token is invalid or has expired',
    400,
  );

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await DataAccess.saveDocument(user);

  return 'Password has been reset successfully.';
};

export const updateUserPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
  res: Response,
): Promise<void> => {
  const user = await findUser({ _id: userId }, 'User not found.', 404, '+password');

  if (!user || !(await user.correctPassword(currentPassword))) {
    throw new AppError('Your current password is wrong.', 401);
  }

  user.password = newPassword;

  await DataAccess.saveDocument(user);

  createTokenSendResponse(user, 200, res);
};
