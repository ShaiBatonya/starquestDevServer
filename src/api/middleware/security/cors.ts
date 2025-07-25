// src/api/middleware/security/cors.ts

import cors from 'cors';
import { CorsOptions } from 'cors';
import AppError from '@/api/utils/appError';
import { vars } from '@/config/vars';

// Production-safe allowed origins
const allowedOrigins = (() => {
  const origins = [];
  
  // Always allow production URL
  if (process.env.CLIENT_PROD_URL) {
    origins.push(process.env.CLIENT_PROD_URL);
  }
  origins.push('https://starquest.app'); // Primary production domain
  
  // Add development origins only in development mode
  if (vars.nodeEnv === 'development') {
    if (process.env.CLIENT_DEV_URL) origins.push(process.env.CLIENT_DEV_URL);
    origins.push('http://localhost:3000');
    origins.push('http://localhost:5173');
    origins.push('http://127.0.0.1:6500');
    origins.push('http://localhost:6500');
  }
  
  return origins.filter(Boolean);
})();

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.) only in development
    if (!origin && vars.nodeEnv === 'development') {
      return callback(null, true);
    }
    
    if (!origin && vars.nodeEnv === 'production') {
      return callback(new AppError('Origin required in production', 403));
    }
    
    if (allowedOrigins.includes(origin!)) {
      callback(null, true);
    } else {
      callback(new AppError(`Origin ${origin} not allowed by CORS policy`, 403));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token',
    'X-XSRF-Token'
  ],
  exposedHeaders: ['X-CSRF-Token'],
  optionsSuccessStatus: 200,
};

export const configureCors = cors(corsOptions);
