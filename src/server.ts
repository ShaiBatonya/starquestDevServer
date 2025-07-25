// src/server.ts
import 'module-alias/register';
import { connectDB } from '@/api/utils/connect';
import { vars } from '@/config/vars';
import logger from '@/config/logger';

const { port } = vars;

interface ErrorDetails {
  message: string;
  stack?: string;
  name: string;
}

const formatErrorDetails = (err: Error): ErrorDetails => ({
  message: err.message,
  stack: err.stack,
  name: err.name,
});

// Handling uncaught exceptions at the top level
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', formatErrorDetails(err));
  process.exit(1);
});

import app from './app';

// 🔍 COMPREHENSIVE ENVIRONMENT DEBUGGING
console.log('\n🔍 ===== ENVIRONMENT DEBUG =====');
console.log('Raw process.env.NODE_ENV:', process.env.NODE_ENV);
console.log('vars.nodeEnv:', vars.nodeEnv);
console.log('process.env.IS_PRODUCTION:', process.env.IS_PRODUCTION);
console.log('process.env.IS_DEVELOPMENT:', process.env.IS_DEVELOPMENT);
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Port:', port);
console.log('process.env.PORT:', process.env.PORT);

// 🔍 CRITICAL: Check CORS environment variables
console.log('\n🔍 CORS Environment Variables:');
console.log('process.env.CORS_ORIGIN:', process.env.CORS_ORIGIN);
console.log('process.env.CLIENT_PROD_URL:', process.env.CLIENT_PROD_URL);
console.log('process.env.CLIENT_DEV_URL:', process.env.CLIENT_DEV_URL);

// Log all environment variables starting with NODE_ or containing PROD/DEV/CORS
console.log('\n🔍 Environment Variables (NODE_*, *PROD*, *DEV*, *CORS*):');
Object.keys(process.env)
  .filter(key => key.startsWith('NODE_') || key.includes('PROD') || key.includes('DEV') || key.includes('CORS'))
  .forEach(key => {
    console.log(`${key}:`, process.env[key]);
  });

// 🔍 Check if .env.production was loaded correctly
console.log('\n🔍 Common Docker Environment Issues:');
console.log('DATABASE env var exists:', !!process.env.DATABASE);
console.log('JWT_SECRET env var exists:', !!process.env.JWT_SECRET);
console.log('SESSION_SECRET env var exists:', !!process.env.SESSION_SECRET);

console.log('\n🔍 CORS Configuration Will Use:');
console.log('Production mode?', vars.nodeEnv === 'production');
console.log('Development mode?', vars.nodeEnv === 'development');
console.log('🔍 ===== END DEBUG =====\n');

connectDB();

const server = app.listen(port, '0.0.0.0', () => {
  logger.info(`🚀 App running on port ${port}...`);
  logger.info(`🌍 Environment: ${vars.nodeEnv}`);
  logger.info(`🔧 NODE_ENV: ${process.env.NODE_ENV}`);
  logger.info(`📍 Production mode: ${vars.nodeEnv === 'production'}`);
  
  // Validate SendGrid integration
  const sendGridConfigured = !!process.env.SENDGRID_API_KEY;
  const emailFromConfigured = !!process.env.EMAIL_FROM_ADDRESS;
  
  if (sendGridConfigured && emailFromConfigured) {
    logger.info('✅ SendGrid email service fully configured');
    // Test email connection in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      const { testEmailConnection } = require('@/config/nodeMailer');
      testEmailConnection().then((result: any) => {
        if (result.success) {
          logger.info('✅ SendGrid connection test successful');
        } else {
          logger.error('❌ SendGrid connection test failed:', result.error);
        }
      });
    }
  } else {
    const missingConfig = [];
    if (!sendGridConfigured) missingConfig.push('SENDGRID_API_KEY');
    if (!emailFromConfigured) missingConfig.push('EMAIL_FROM_ADDRESS');
    
    logger.warn(`⚠️ SendGrid incomplete configuration. Missing: ${missingConfig.join(', ')}`);
    logger.warn('📧 Email functionality will not work properly without proper SendGrid configuration');
  }
});

// Handling unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', formatErrorDetails(err));
  server.close(() => {
    process.exit(1);
  });
});
