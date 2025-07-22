// src/api/validations/position.validations.ts

import { z } from 'zod';

export const createPositionSchema = z.object({
  name: z
    .string({
      required_error: 'Position name is required',
      invalid_type_error: 'Position name must be a string',
    })
    .min(1, 'Position name cannot be empty'),
  color: z
    .string({
      required_error: 'Position color is required',
      invalid_type_error: 'Position color must be a string',
    })
    .regex(/^#[0-9a-fA-F]{6}$/, 'Position color must be a valid hex color'),
});

export const updatePositionSchema = z.object({
  name: z
    .string({
      invalid_type_error: 'Position name must be a string',
    })
    .min(1, 'Position name cannot be empty')
    .optional(),
  color: z
    .string({
      invalid_type_error: 'Position color must be a string',
    })
    .regex(/^#[0-9a-fA-F]{6}$/, 'Position color must be a valid hex color')
    .optional(),
}).refine(
  (data) => data.name !== undefined || data.color !== undefined,
  {
    message: 'At least one field (name or color) must be provided for update',
  }
);
