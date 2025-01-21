// src/api/services/jwt.service.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import AppError from '@/api/utils/appError';
import DataAccess from '@/api/utils/dataAccess';
import { IUser } from '@/api/types/user.interface';
import { vars } from '@/config/vars';
import { sendSuccessResponse } from '@/api/utils/appResponse';

const { jwtSecret, jwtExpiresIn, jwtCookieExpiresIn, nodeEnv } = vars;

interface DecodedToken {
  id: string;
  iat?: number;
}

export const signToken = (id: string): string =>
  jwt.sign({ id }, jwtSecret, { expiresIn: jwtExpiresIn });

export const createTokenSendResponse = (user: IUser, statusCode: number, res: Response): void => {
  const token = signToken(user._id.toString());
  const cookieOptions = {
    expires: new Date(Date.now() + jwtCookieExpiresIn * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: nodeEnv === 'production',
  };

  res.cookie('jwt', token, cookieOptions);

  // Ensure the password is not sent back in the response
  const userForResponse: Partial<IUser> = {
    ...user.toObject(),
    password: undefined,
  };

  sendSuccessResponse(res, statusCode, userForResponse);
};

export const extractToken = (req: Request): string | null => {
  return req.cookies?.jwt || null;
};

export const verifyToken = async (token: string): Promise<DecodedToken | null> => {
  try {
    return (await jwt.verify(token, jwtSecret)) as DecodedToken;
  } catch (error) {
    return null;
  }
};

export const getUserAndCheck = async (
  decoded: DecodedToken,
  _next: NextFunction,
): Promise<IUser | null> => {
  if (!decoded) {
    throw new AppError('Invalid token or token expired', 401);
  }

  const currentUser = await DataAccess.findById<IUser>('User', decoded.id);

  if (!currentUser) {
    throw new AppError('The user belonging to this token does no longer exist.', 401);
  }

  if (
    currentUser.changedPasswordAfter &&
    decoded.iat !== undefined &&
    currentUser.changedPasswordAfter(decoded.iat)
  ) {
    throw new AppError('User recently changed password! Please log in again.', 401);
  }

  return currentUser;
};

export const findUserByToken = async (token: string): Promise<string> => {
  if (!token) {
    throw new AppError('No token provided', 401);
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    throw new AppError('Invalid token or token expired', 401);
  }

  const userId = decoded.id;

  return userId;
};
