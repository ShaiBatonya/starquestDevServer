// src/api/middleware/security/cors.ts

import cors from 'cors';
import { CorsOptions } from 'cors';
import AppError from '@/api/utils/appError';
import { vars } from '@/config/vars';
import logger from '@/config/logger';

// Utility function to normalize origins for comparison
const normalizeOrigin = (origin: string): string => {
  if (!origin) return origin;
  
  // Convert to lowercase and remove trailing slash
  return origin.toLowerCase().replace(/\/$/, '');
};

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

// Normalize allowed origins for comparison
const normalizedAllowedOrigins = allowedOrigins.map(normalizeOrigin);

// Check if STRICT_CORS mode is enabled (default: false for flexibility)
const strictCorsMode = process.env.STRICT_CORS === 'true';

// 🔍 LOG CORS CONFIGURATION ON STARTUP
console.log('\n🔍 ===== CORS CONFIGURATION =====');
console.log('Environment mode:', vars.nodeEnv);
console.log('CORS_ORIGIN env var:', process.env.CORS_ORIGIN || 'NOT SET');
console.log('STRICT_CORS mode:', strictCorsMode);
console.log('Raw allowed origins:', allowedOrigins);
console.log('Normalized allowed origins:', normalizedAllowedOrigins);
console.log('Credentials enabled:', true);
console.log('🔍 ===== END CORS CONFIG =====\n');

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // 🔍 LOG EVERY CORS CHECK WITH DETAILED INFO
    logger.info(`🌍 ===== CORS ORIGIN CHECK =====`);
    logger.info(`🌍 Raw Origin: "${origin || 'NO ORIGIN'}"`);
    logger.info(`🌍 Environment: ${vars.nodeEnv}`);
    logger.info(`🌍 Strict Mode: ${strictCorsMode}`);
    
    // Allow requests with no origin (mobile apps, curl, etc.) only in development
    if (!origin && vars.nodeEnv === 'development') {
      logger.info('✅ CORS: Allowing request with no origin (development mode)');
      logger.info(`🌍 ===== END CORS CHECK =====\n`);
      return callback(null, true);
    }
    
    if (!origin && vars.nodeEnv === 'production') {
      const errorMsg = 'CORS Error: Origin header required in production mode';
      logger.error(`❌ ${errorMsg}`);
      logger.info(`🌍 ===== END CORS CHECK =====\n`);
      return callback(new AppError(errorMsg, 403));
    }
    
    // Normalize the incoming origin
    const normalizedOrigin = normalizeOrigin(origin!);
    logger.info(`🌍 Normalized Origin: "${normalizedOrigin}"`);
    logger.info(`🌍 Checking against allowed origins: ${JSON.stringify(normalizedAllowedOrigins)}`);
    
    // Check if origin is allowed
    let isAllowed = false;
    
    if (strictCorsMode) {
      // Strict mode: exact match only
      isAllowed = allowedOrigins.includes(origin!);
      logger.info(`🌍 Strict mode check: ${isAllowed ? 'PASSED' : 'FAILED'}`);
    } else {
      // Flexible mode: normalized comparison
      isAllowed = normalizedAllowedOrigins.includes(normalizedOrigin);
      logger.info(`🌍 Flexible mode check: ${isAllowed ? 'PASSED' : 'FAILED'}`);
      
      // Additional check: exact match as fallback
      if (!isAllowed) {
        isAllowed = allowedOrigins.includes(origin!);
        if (isAllowed) {
          logger.info(`🌍 Exact match fallback: PASSED`);
        }
      }
    }
    
    if (isAllowed) {
      logger.info(`✅ CORS: ALLOWING origin "${origin}"`);
      logger.info(`✅ Match details:`);
      logger.info(`   - Raw origin: "${origin}"`);
      logger.info(`   - Normalized: "${normalizedOrigin}"`);
      logger.info(`   - Matched against: ${JSON.stringify(strictCorsMode ? allowedOrigins : normalizedAllowedOrigins)}`);
      logger.info(`🌍 ===== END CORS CHECK =====\n`);
      callback(null, true);
    } else {
      const errorMsg = `CORS Error: Origin '${origin}' not allowed`;
      logger.error(`❌ ${errorMsg}`);
      logger.error(`❌ DETAILED MISMATCH ANALYSIS:`);
      logger.error(`   - Raw origin: "${origin}"`);
      logger.error(`   - Normalized origin: "${normalizedOrigin}"`);
      logger.error(`   - Strict mode: ${strictCorsMode}`);
      logger.error(`   - Raw allowed origins: ${JSON.stringify(allowedOrigins)}`);
      logger.error(`   - Normalized allowed origins: ${JSON.stringify(normalizedAllowedOrigins)}`);
      
      // Check for potential issues
      if (origin!.endsWith('/')) {
        logger.error(`   - ⚠️  Origin has trailing slash - this might be the issue!`);
      }
      if (origin!.toLowerCase() !== origin) {
        logger.error(`   - ⚠️  Origin has uppercase characters - case sensitivity issue!`);
      }
      
      // Check if normalization would help
      const wouldNormalizedMatch = normalizedAllowedOrigins.includes(normalizedOrigin);
      if (wouldNormalizedMatch && strictCorsMode) {
        logger.error(`   - 💡 SOLUTION: This origin would PASS in flexible mode (set STRICT_CORS=false)`);
      }
      
      logger.info(`🌍 ===== END CORS CHECK =====\n`);
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
