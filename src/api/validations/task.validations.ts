// src/api/validations/task.validations.ts

import { z } from 'zod';

const validPlanets = [
  'Nebulae',
  'Solaris minor',
  'Solaris major',
  'White dwarf',
  'Supernova',
  'Space station',
] as const;

export const createTaskSchema = z.object({
  title: z
    .string({
      required_error: 'Title is required',
      invalid_type_error: 'Title must be a string',
    })
    .min(1, 'Title cannot be empty'),
  description: z
    .string({
      required_error: 'Description is required',
      invalid_type_error: 'Description must be a string',
    })
    .min(1, 'Description cannot be empty'),
  category: z.enum(['Learning courses', 'Product refinement', 'Mandatory sessions']),
  positions: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'))
    .min(1)
    .optional(),
  planet: z.array(
    z.enum(validPlanets, {
      required_error: 'Planet is required',
      invalid_type_error: 'Invalid planet name',
    }),
  ),
  isGlobal: z.boolean().default(false),
  starsEarned: z
    .number({
      required_error: 'Stars earned is required',
      invalid_type_error: 'Stars earned must be a number',
    })
    .nonnegative(),
  link: z.string().optional(),
});

export const createPersonalTaskSchema = z.object({
  title: z
    .string({
      required_error: 'Title is required',
      invalid_type_error: 'Title must be a string',
    })
    .min(1, 'Title cannot be empty'),
  description: z
    .string({
      required_error: 'Description is required',
      invalid_type_error: 'Description must be a string',
    })
    .min(1, 'Description cannot be empty'),
  category: z.enum(['Learning courses', 'Product refinement', 'Mandatory sessions']),
  planet: z.array(
    z.enum(validPlanets, {
      required_error: 'Planet is required',
      invalid_type_error: 'Invalid planet name',
    }),
  ),
  positions: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'))
    .min(1)
    .max(1)
    .optional(),
  userId: z
    .string({
      required_error: 'User ID is required',
      invalid_type_error: 'User ID must be a string',
    })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'),
  starsEarned: z
    .number({
      required_error: 'Stars earned is required',
      invalid_type_error: 'Stars earned must be a number',
    })
    .nonnegative(),
  link: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string({
      required_error: 'Title is required',
      invalid_type_error: 'Title must be a string',
    })
    .min(1, 'Title cannot be empty')
    .optional(),
  description: z
    .string({
      required_error: 'Description is required',
      invalid_type_error: 'Description must be a string',
    })
    .min(1, 'Description cannot be empty')
    .optional(),
  category: z.enum(['Learning courses', 'Product refinement', 'Mandatory sessions']).optional(),
  newPositions: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'))
    .optional(),
  newPlanets: z.array(z.enum(validPlanets)).optional(),
  positionsToRemove: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'))
    .optional(),
  planetsToRemove: z.array(z.enum(validPlanets)).optional(),
  isGlobal: z.boolean().optional(),
  starsEarned: z
    .number({
      required_error: 'Stars earned is required',
      invalid_type_error: 'Stars earned must be a number',
    })
    .nonnegative()
    .optional(),
  link: z.string().optional(),
});
