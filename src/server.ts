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

connectDB();

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
  
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
