// src/api/validations/position.validations.ts
import { z } from 'zod';

export const createPositionSchema = z.object({
  name: z.string().min(1, {
    message: 'Position name cannot be empty',
  }),
  color: z.string().min(1, {
    message: 'Color cannot be empty',
  }),
});
