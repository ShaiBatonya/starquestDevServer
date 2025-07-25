import session from 'express-session';
import MongoStore from 'connect-mongo';
import { vars } from '@/config/vars';

const sessionMiddleware = session({
  secret: vars.sessionSecret,
  resave: false,
  saveUninitialized: false, // Don't save empty sessions
  store: MongoStore.create({
    mongoUrl: vars.databaseURL,
    ttl: 14 * 24 * 60 * 60, // 14 days in seconds
    autoRemove: 'native', // Default
    touchAfter: 24 * 3600, // Only update session once per day unless changed
  }) as any, // Type assertion for compatibility
  cookie: {
    secure: vars.nodeEnv === 'production', // Only secure in production (HTTPS)
    httpOnly: true, // Prevent XSS attacks
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days in milliseconds
    sameSite: vars.nodeEnv === 'production' ? 'none' : 'lax', // Enable cross-origin cookies
  },
  name: 'starquest.sid', // Custom session name for security
});

export default sessionMiddleware;
