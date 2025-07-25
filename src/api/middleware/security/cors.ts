// src/api/middleware/security/cors.ts

import cors from 'cors';
import { CorsOptions } from 'cors';
import AppError from '@/api/utils/appError';
import { vars } from '@/config/vars';
import logger from '@/config/logger';

// Production-safe allowed origins with environment variable support
const allowedOrigins = (() => {
  const origins = [];
  
  // Primary: Use CORS_ORIGIN environment variable (comma-separated)
  if (process.env.CORS_ORIGIN) {
    const corsOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean);
    origins.push(...corsOrigins);
    logger.info(`🌍 CORS: Using CORS_ORIGIN environment variable: ${corsOrigins.join(', ')}`);
  } else {
    // Fallback: Use legacy environment variables and hardcoded values
    logger.info('🌍 CORS: CORS_ORIGIN not set, using fallback origins');
    
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
  }
  
  return origins.filter(Boolean);
})();

// 🔍 LOG CORS CONFIGURATION ON STARTUP
console.log('\n🔍 ===== CORS CONFIGURATION =====');
console.log('Environment mode:', vars.nodeEnv);
console.log('CORS_ORIGIN env var:', process.env.CORS_ORIGIN || 'NOT SET');
console.log('Final allowed origins:', allowedOrigins);
console.log('Credentials enabled:', true);
console.log('🔍 ===== END CORS CONFIG =====\n');

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // 🔍 LOG EVERY CORS CHECK
    logger.info(`🌍 CORS Check - Origin: ${origin || 'NO ORIGIN'}, Environment: ${vars.nodeEnv}`);
    logger.info(`🌍 Allowed origins: ${JSON.stringify(allowedOrigins)}`);
    
    // Allow requests with no origin (mobile apps, curl, etc.) only in development
    if (!origin && vars.nodeEnv === 'development') {
      logger.info('✅ CORS: Allowing request with no origin (development mode)');
      return callback(null, true);
    }
    
    if (!origin && vars.nodeEnv === 'production') {
      const errorMsg = 'CORS Error: Origin header required in production mode';
      logger.error(`❌ ${errorMsg}`);
      return callback(new AppError(errorMsg, 403));
    }
    
    if (allowedOrigins.includes(origin!)) {
      logger.info(`✅ CORS: Allowing origin ${origin}`);
      callback(null, true);
    } else {
      const errorMsg = `CORS Error: Origin '${origin}' not allowed. Allowed origins: ${allowedOrigins.join(', ')}`;
      logger.error(`❌ ${errorMsg}`);
      callback(new AppError(errorMsg, 403));
    }
  },
  credentials: true, // Enable cookies and auth headers
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
  optionsSuccessStatus: 200, // Handle preflight requests
};

export const configureCors = cors(corsOptions);
