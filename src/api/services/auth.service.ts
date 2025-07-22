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
import { processPendingInvitations } from '@/api/services/workspace.service';
import mongoose from 'mongoose';

const { nodeEnv } = vars;
const userModel = 'User';
const workspaceModel = 'Workspace';

 export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<IUser | null | void> => {
  try {
    console.log('🔐 Authentication middleware started for:', req.method, req.path);
    console.log('🔐 Request headers:', req.headers);
    console.log('🔐 Request cookies:', req.cookies);
    
    console.log('🔐 Step 1: Extracting token...');
    const token = extractToken(req);
    console.log('🔐 Extracted token:', token ? `${token.substring(0, 20)}...` : 'null');
    
    if (!token) {
      console.log('❌ No token found, returning 401');
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    console.log('🔐 Step 2: Verifying token...');
    const decoded = await verifyToken(token);
    console.log('🔐 Token verification result:', decoded ? 'valid' : 'invalid');
    
    if (!decoded) {
      console.log('❌ Token verification failed, returning 401');
      return next(new AppError('Invalid token or token expired', 401));
    }

    console.log('🔐 Step 3: Getting user and checking...');
    // eslint-disable-next-line no-return-await
    const result = await getUserAndCheck(decoded, next);
    console.log('🔐 getUserAndCheck result:', result ? 'success' : 'failed');
    console.log('✅ Authentication middleware completed successfully');
    return result;
  } catch (error: any) {
    console.error('❌ Authentication middleware error:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    return next(error);
  }
}; 

export const signup = async (
  userData: Partial<IUser>,
): Promise<{ status: string; message: string; hasInvitations?: boolean }> => {
  await isUserExists(userData.email);
  const newUser = await DataAccess.create<IUser>(userModel, userData);

  // Check for pending invitations before creating default workspace
  let hasInvitations = false;
  if (userData.email) {
    try {
      console.log(`🔍 Checking for pending invitations for ${userData.email}`);
      await processPendingInvitations(userData.email, newUser._id.toString());
      
      // Check if user now has workspaces (indicating they had pending invitations)
      const updatedUser = await DataAccess.findById<IUser>(userModel, newUser._id);
      hasInvitations = !!(updatedUser && updatedUser.workspaces.length > 0);
      
      if (hasInvitations) {
        console.log(`✅ User ${userData.email} auto-joined workspaces via pending invitations`);
      }
    } catch (error) {
      console.error(`❌ Error processing pending invitations for ${userData.email}:`, error);
      // Continue with registration even if invitation processing fails
    }
  }

  // Only create default workspace if user doesn't have any from invitations
  if (!hasInvitations) {
    console.log(`📝 Creating default workspace for ${userData.email}`);
    const newWorkspace = await createDefaultWorkspace(newUser._id);
    await addWorkspaceToUser(newUser, newWorkspace._id);
  }

  const verificationCode = newUser.generateEmailVerificationCode();
  await DataAccess.saveDocument(newUser);

  await sendVerificationEmail(newUser, verificationCode);

  const message = hasInvitations 
    ? 'Verification email sent. You have been automatically added to invited workspaces!'
    : 'Verification email sent to user';

  return {
    status: 'success',
    message,
    hasInvitations,
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
  const { message, htmlMessage, subject } = generateVerificationEmailContent(user, verificationCode);

  await sendEmail({
    email: user.email,
    subject: subject, // Use dynamic subject from enhanced template
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

   if (!user.isEmailVerified) {
    return next(new AppError('Not verified', 401));
  } 

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
  // Use enhanced reset password email template
  const { subject, plainMessage, htmlMessage } = generateResetPasswordEmailContent(
    user.email,
    `${user.firstName} ${user.lastName}`,
    resetToken
  );

  const isEmailSent = await sendEmail({
    email: user.email,
    subject: subject,
    message: plainMessage,
    html: htmlMessage,
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
