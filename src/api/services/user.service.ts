// src/api/services/user.service.js

import DataAccess from '@/api/utils/dataAccess';
import AppError from '@/api/utils/appError';
import { filterObj } from '@/api/services/helper.service';
import { IUser } from '../types/user.interface';

const userModel = 'User';

interface UserUpdateBody {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
  [key: string]: any;
}

// update user details, excluding password updates.
export const updateUserDetails = async (
  userId: string,
  body: UserUpdateBody,
): Promise<IUser | null> => {
  // 1) Check for password fields to avoid updates through this route
  if (body.password || body.passwordConfirm) {
    throw new AppError(
      'This route is not for password updates. Please use /updateMyPassword.',
      400,
    );
  }

  // 2) Filter out unwanted fields that are not allowed to be updated
  const filteredBody = filterObj(body, 'name', 'email', 'position', 'phoneNumber');

  // 3) Perform the update
  const updatedUser = await DataAccess.updateById(userModel, userId, filteredBody);
  if (!updatedUser) {
    throw new AppError('No user found with that ID', 404);
  }

  return updatedUser as IUser;
};

export const deactivateUser = async (userId: string): Promise<IUser | null> => {
  const updatedUser = await DataAccess.updateById(userModel, userId, { active: false });
  if (!updatedUser) {
    throw new AppError('No user found with that ID', 404);
  }
  return updatedUser as IUser;
};
