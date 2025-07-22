// src/config/vars.ts

import dotenv from 'dotenv';
import { defaults } from './default';

dotenv.config();

if (!process.env.DATABASE) {
  throw new Error('DATABASE environment variable is not defined.');
}

if (!process.env.DATABASE_PASSWORD) {
  throw new Error('DATABASE_PASSWORD environment variable is not defined.');
}

const databaseURL = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD || '');

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
