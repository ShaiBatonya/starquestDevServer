// src/api/validations/userValidations.ts

import { z } from 'zod';

export const signUpSchema = z
  .object({
    firstName: z.string().min(2, 'Please tell us your first name!'),
    lastName: z.string().min(2, 'Please tell us your last name!'),
    email: z.string().email('Please provide a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(10, 'Password must be no longer than 10 characters')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
      .regex(/[0-9]/, 'Password must include at least one digit'),
    passwordConfirm: z.string().min(1, 'Please confirm your password'),
    phoneNumber: z
      .string()
      .regex(/^\d{10}$/, 'Phone number must contain only 10 digits')
      .optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ['passwordConfirm'],
  });

export const verifyEmailSchema = z.object({
  email: z.string().email('Please provide a valid email'),
  code: z
    .string()
    .length(6, 'Verification code must be exactly 6 digits long')
    .regex(/^\d{6}$/, 'Verification code must contain only digits'),
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(10, 'Password must be no longer than 10 characters')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[0-9]/, 'Password must include at least one digit'),
});

export const changePasswordValidationSchema = z
  .object({
    passwordCurrent: z.string(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(10, 'Password must be no longer than 10 characters')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
      .regex(/[0-9]/, 'Password must include at least one digit'),
    passwordConfirm: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });

export const forgotPasswordValidationSchena = z.object({
  email: z.string().email('Please provide a valid email'),
});

export const resetPasswordValidationSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(10, 'Password must be no longer than 10 characters')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
      .regex(/[0-9]/, 'Password must include at least one digit'),
    passwordConfirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ['passwordConfirm'],
  });

export const updateUserValidationSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phoneNumber: z
      .string()
      .regex(/^\d{10}$/, 'Phone number must contain only 10 digits')
      .optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined && v !== null), {
    message: 'At least one field must be provided',
  });
