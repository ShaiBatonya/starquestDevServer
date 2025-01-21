// src/api/middleware/validateRequest.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import AppError from '@/api/utils/appError';

export const validateRequest =
  (schema: ZodSchema, part: 'body' | 'params' | 'query' = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!schema) {
      throw new AppError('Validation schema is undefined', 500);
    }

    const data = req[part];
    const result = schema.safeParse(data);
    if (!result.success) {
      const errorMessage = result.error.errors
        .map((error) => `${error.path.join('.')}: ${error.message}`)
        .join(', ');

      return next(new AppError(errorMessage, 400));
    }
    return next();
  };
