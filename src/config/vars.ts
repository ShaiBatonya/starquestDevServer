// src/config/vars.ts

import dotenv from 'dotenv';
import path from 'path';
import { defaults } from './default';

// Environment loading debug info (safe for production)
const isProduction = process.env.NODE_ENV === 'production';
if (!isProduction) {
  console.log('🔧 Environment Debug Info:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('__dirname:', __dirname);
  console.log('process.cwd():', process.cwd());
}

// Load environment file based on NODE_ENV
// When running from dist/, the path needs to be relative to dist/config/
const envProductionPath = path.resolve(__dirname, '../../.env.production');
const envDevelopmentPath = path.resolve(__dirname, '../../.env');

if (isProduction) {
  // In production, load .env.production
  const result = dotenv.config({ path: envProductionPath });
  // Log startup info for production monitoring (no sensitive data)
  console.log(`[${new Date().toISOString()}] Production environment loading...`);
  if (result.error) {
    console.error(`[${new Date().toISOString()}] ERROR: Failed to load .env.production:`, result.error.message);
    console.error(`[${new Date().toISOString()}] Expected path: ${envProductionPath}`);
    process.exit(1);
  } else {
    console.log(`[${new Date().toISOString()}] ✅ Production environment loaded successfully`);
  }
} else {
  // For development, try .env first, then fallback to .env.production
  let envLoaded = false;
  
  // Try .env first
  const devResult = dotenv.config({ path: envDevelopmentPath });
  if (!devResult.error) {
    envLoaded = true;
    console.log('🔧 Loaded development .env file');
  } else {
    console.log('🔧 Development .env not found, trying .env.production');
  }
  
  // Fallback to .env.production if .env failed
  if (!envLoaded) {
    const prodResult = dotenv.config({ path: envProductionPath });
    if (!prodResult.error) {
      console.log('🔧 Loaded .env.production as fallback');
    } else {
      console.log('🔧 Failed to load both .env and .env.production');
      console.log('🔧 .env error:', devResult.error?.message);
      console.log('🔧 .env.production error:', prodResult.error?.message);
    }
  }
}

// Environment variables validation and logging
const requiredVarsForLogging = ['DATABASE', 'JWT_SECRET', 'SESSION_SECRET'];
const missingVars = requiredVarsForLogging.filter(varName => !process.env[varName]);

if (isProduction) {
  // Production logging (no sensitive data, just status)
  if (missingVars.length === 0) {
    console.log(`[${new Date().toISOString()}] ✅ All required environment variables loaded`);
  } else {
    console.error(`[${new Date().toISOString()}] ❌ Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }
} else {
  // Development logging (more detailed)
  console.log('🔧 Environment variables status:');
  requiredVarsForLogging.forEach(varName => {
    console.log(`${varName}:`, process.env[varName] ? '✅ Loaded' : '❌ Missing');
  });
  console.log('NODE_ENV:', process.env.NODE_ENV);
}

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE',
  'JWT_SECRET',
  'SESSION_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} environment variable is not defined.`);
  }
}

// Validate JWT_SECRET and SESSION_SECRET length for security
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long for security.');
}

if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
  throw new Error('SESSION_SECRET must be at least 32 characters long for security.');
}

// Handle both formats: with <PASSWORD> placeholder or direct connection string
const databaseURL = process.env.DATABASE!.includes('<PASSWORD>') 
  ? process.env.DATABASE!.replace('<PASSWORD>', process.env.DATABASE_PASSWORD || '')
  : process.env.DATABASE!;

export const vars = {
  nodeEnv: process.env.NODE_ENV || defaults.nodeEnv,
  port: process.env.PORT || defaults.port,
  domainUrl: process.env.DOMAIN_URL || defaults.domainUrl,
  // Frontend URL configuration for email links
  clientUrl: process.env.NODE_ENV === 'production' 
    ? (process.env.CLIENT_PROD_URL || 'https://starquest.app')
    : (process.env.CLIENT_DEV_URL || 'http://localhost:3000'),
  // Company information for email footers
  companyName: process.env.COMPANY_NAME || 'StarQuest',
  companyAddress: process.env.COMPANY_ADDRESS || 'Virtual Space Station, Galaxy Sector 7',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@starquest.space',
  databaseURL: databaseURL,
  sessionSecret: process.env.SESSION_SECRET || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || defaults.jwtExpiresIn,
  jwtCookieExpiresIn: process.env.JWT_COOKIE_EXPIRES_IN
    ? parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10)
    : defaults.jwtCookieExpiresIn,
  // SendGrid Email Configuration (Production-grade)
  sendGridApiKey: process.env.SENDGRID_API_KEY || '',
  emailFromName: process.env.EMAIL_FROM_NAME || 'StarQuest Team',
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS || '',
  // AWS S3 Configuration
  bucketName: process.env.BUCKET_NAME || '',
  bucketRegion: process.env.BUCKET_REGION || '',
  accessKey: process.env.ACCESS_KEY || '',
  secretAccessKey: process.env.SECRET_ACCESS_KEY || '',
};
