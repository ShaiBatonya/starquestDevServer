// src/api/controllers/auth.controller.ts

import { Request, Response, NextFunction } from 'express';
import catchAsync from '@/api/utils/catchAsync';
import AppError from '@/api/utils/appError';
import {
  authenticate,
  signup,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updateUserPassword,
} from '@/api/services/auth.service';
import { sendSuccessResponse } from '@/api/utils/appResponse';

interface CustomRequest extends Request {
  user?: any;
}

export const protect = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const user = await authenticate(req, next);
  req.user = user;
  next();
});

export const restrictTo = (...roles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    return next();
  };
};

export const signupController = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await signup(req.body);
    sendSuccessResponse(res, 200, result);
  },
);

/* export const verifyEmailController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code, email } = req.body;
    const result = await verifyEmail(code, email, next);
    sendSuccessResponse(res, 200, result);
  },
); */

export const loginController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await login(req.body.email, req.body.password, next, res);
  },
);

export const logoutController = (req: Request, res: Response): void => {
  const { cookieName, cookieValue, cookieOptions } = logout();
  res.cookie(cookieName, cookieValue, cookieOptions);
  sendSuccessResponse(res, 200);
};

export const forgotPasswordController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await forgotPassword(req.body.email, req, next);
    sendSuccessResponse(res, 200, undefined, result);
  },
);

export const resetPasswordController = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { token } = req.params;
    const { password } = req.body;
    const result = await resetPassword(token, password);
    sendSuccessResponse(res, 200, undefined, result);
  },
);

export const updatePasswordController = catchAsync(
  async (req: CustomRequest, res: Response, _next: NextFunction) => {
    const { passwordCurrent, password } = req.body;
    await updateUserPassword(req.user.id, passwordCurrent, password, res);
  },
);
