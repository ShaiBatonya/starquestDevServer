// src/api/routes/user.route.ts

/**
 * @file userRoutes.ts
 * Defines routes for user-related operations including profile management, and administrative actions.
 */

import express from 'express';

import {
  getMe,
  getUser,
  updateMe,
  deleteUser,
  getAllUsers,
  updateUser,
  deleteMe,
} from '@/api/controllers/user.controller';

import { protect, restrictTo } from '@/api/controllers/auth.controller';

import { updateUserValidationSchema } from '@/api/validations/user.validations';

import { validateRequest } from '@/api/middleware/validateRequest';

const router = express.Router();

router.use(protect);

router.get('/me', getMe, getUser);

router.patch('/updateMe', validateRequest(updateUserValidationSchema), updateMe);

router.delete('/deleteMe', deleteMe);

router.use(restrictTo('admin'));

router.get('/', getAllUsers);

router
  .route('/:id')
  .get(getUser)
  .patch(validateRequest(updateUserValidationSchema), updateUser)
  .delete(deleteUser);

export default router;
