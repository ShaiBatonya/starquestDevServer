// src/config/corsConfig.ts

import cors from 'cors';
import { CorsOptions } from 'cors';
import AppError from '@/api/utils/appError';
import { vars } from '@/config/vars';

const allowedOrigins = [
  ...process.env.CLIENT_PROD_URL?.split(',') || [],
  process.env.CLIENT_DEV_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:6500',
  'http://localhost:6500',
].filter(Boolean);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (vars.nodeEnv === 'development' || !origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new AppError('Not allowed by CORS', 500));
    }
  },
  credentials: true,
};

export const configureCors = cors(corsOptions);
