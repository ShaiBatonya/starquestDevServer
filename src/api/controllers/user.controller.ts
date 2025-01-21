// src/api/controllers/user.controller.ts

import { Request, Response, NextFunction } from 'express';
import catchAsync from '@/api/utils/catchAsync';
import { getOne, getAll, updateOne, deleteOne } from '@/api/services/factory.service';
import { deactivateUser, updateUserDetails } from '@/api/services/user.service';
import { sendSuccessResponse } from '@/api/utils/appResponse';

const userModel = 'User';

interface CustomRequest extends Request {
  user?: any;
}


export const getMe = (req: CustomRequest, res: Response, next: NextFunction): void => {
  if (req.user) {
    req.params.id = req.user.id;
  }
  return next();
};

export const updateMe = catchAsync(async (req: CustomRequest, res: Response) => {
  if (req.user) {
    const updatedUser = await updateUserDetails(req.user.id, req.body);
    sendSuccessResponse(res, 200, updatedUser);
  }
});

// Deactivate (soft delete) the current user
export const deleteMe = catchAsync(async (req: CustomRequest, res: Response) => {
  if (req.user) {
    await deactivateUser(req.user.id);
    sendSuccessResponse(res, 204);
  }
});

export const getUser = getOne(userModel);
export const getAllUsers = getAll(userModel);
export const updateUser = updateOne(userModel);
export const deleteUser = deleteOne(userModel);
