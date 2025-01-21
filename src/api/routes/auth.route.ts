// src/api/routes/auth.route.ts

import express from 'express';

import {
  signupController,
  /* verifyEmailController, */
  loginController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
  updatePasswordController,
  /* protect, */
} from '@/api/controllers/auth.controller';

import {
  signUpSchema,
  changePasswordValidationSchema,
  forgotPasswordValidationSchena,
  resetPasswordValidationSchema,
  verifyEmailSchema,
  loginSchema,
} from '@/api/validations/user.validations';

import { validateRequest } from '@/api/middleware/validateRequest';

const router = express.Router();

router.post('/signup', /* validateRequest(signUpSchema), */ signupController);

router.post('/verifyEmail', /* validateRequest(verifyEmailSchema), */ /* verifyEmailController */);

router.post('/login', /* validateRequest(loginSchema), */ loginController);

router.get('/logout', logoutController);

router.post(
  '/forgotPassword',
  validateRequest(forgotPasswordValidationSchena),
  forgotPasswordController,
);

router.patch(
  '/resetPassword/:token',
  validateRequest(resetPasswordValidationSchema),
  resetPasswordController,
);

/* router.use(protect); */

router.patch(
  '/updateMyPassword',
  validateRequest(changePasswordValidationSchema),
  updatePasswordController,
);

export default router;
