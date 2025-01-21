// src/app.ts
import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import logger from '@/config/logger';
import { configureCors } from '@/api/middleware/security/cors';
import AppError from '@/api/utils/appError';
import globalErrorHandler from '@/api/middleware/errorMiddleware';
import allRoutes from '@/api/routes/index';
import { vars } from '@/config/vars';
import loadModels from '@/api/middleware/modelLoader';
import limiter from '@/api/middleware/security/rateLimiter';
import sanitizeBodyMiddleware from '@/api/middleware/security/sanitizeBody';
import hppMiddleware from '@/api/middleware/security/hpp';
import sessionMiddleware from '@/api/middleware/security/sessionMiddleware';
import csrfMiddleware from '@/api/middleware/security/csrfMiddleware';
import attachCsrfToken from '@/api/middleware/security/attachCsrfToken';
import requestLoggerMiddleware from '@/api/middleware/requestLoggerMiddleware';
import { setupSwaggerDocs } from '@/api/utils/swagger'; // Import the setup function

const app = express();

// Trust proxy settings for accurate IP capture behind proxies
app.set('trust proxy', 1);

// Load models - Ensuring all models are loaded before any routes or middleware
loadModels();

// Compress - compress the response bodies for all requests that passthrough it.
app.use(compression());
// Helmet - Set security headers early in the middleware stack
app.use(helmet());
// CORS - Setup CORS before defining routes to ensure all routes support CORS
app.use(configureCors);

// Morgan - Logging middleware for development environment
if (vars.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiting - To protect against brute-force attacks
app.use(limiter);

// Body Parsing - Parse incoming request bodies before handling routes
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// Cookie Parsing - Parse cookies before routes that may need cookie information
app.use(cookieParser());

// Setting up a session middleware in the Express application
app.use(sessionMiddleware);
// Generate a CSRF token and set it in a cookie
app.use(csrfMiddleware);
// Setting up Cross-Site Request Forgery (CSRF) protection
app.use(attachCsrfToken);

// Sanitize Data - Protect against NoSQL injections and XSS
app.use(mongoSanitize());
app.use(sanitizeBodyMiddleware);

// Prevent HTTP Parameter Pollution
app.use(hppMiddleware);

// Logging and tracking details to each incoming request
app.use(requestLoggerMiddleware);

// Initialize Swagger UI
setupSwaggerDocs(app);

// Routing - Defined after all middleware to ensure they are applied
app.use('/api', allRoutes);

// Undefined Routes - Catch any requests that don't match the routes defined above
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  const errorMsg = `Can't find ${req.originalUrl} on this server!`;
  logger.warn(errorMsg);
  next(new AppError(errorMsg, 404));
});

// Global Error Handler - Catch and process any errors from the entire stack
app.use(globalErrorHandler);

export default app;
