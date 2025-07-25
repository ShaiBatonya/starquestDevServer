// src/app.ts
import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
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
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Removed 'unsafe-eval' for production safety
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
      upgradeInsecureRequests: vars.nodeEnv === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for development tools
}));

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

// 🔍 TEMPORARY DEBUG ENDPOINT FOR PRODUCTION TROUBLESHOOTING
app.get('/env-debug', (req: Request, res: Response) => {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      nodeEnv: vars.nodeEnv,
      IS_PRODUCTION: process.env.IS_PRODUCTION,
      IS_DEVELOPMENT: process.env.IS_DEVELOPMENT,
      port: vars.port,
      PORT: process.env.PORT,
    },
    cors: {
      productionMode: vars.nodeEnv === 'production',
      developmentMode: vars.nodeEnv === 'development',
      allowedOrigins: vars.nodeEnv === 'development' 
        ? ['https://starquest.app', 'CLIENT_PROD_URL', 'CLIENT_DEV_URL', 'localhost origins...']
        : ['https://starquest.app', process.env.CLIENT_PROD_URL].filter(Boolean),
    },
    cookies: {
      secure: vars.nodeEnv === 'production',
      sameSite: vars.nodeEnv === 'production' ? 'none' : 'lax',
    },
    request: {
      origin: req.get('Origin'),
      host: req.get('Host'),
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.url,
    },
    headers: req.headers,
  };
  
  res.json(debugInfo);
});

// Add CORS debugging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.get('Origin');
  if (origin) {
    logger.info(`🌍 CORS Request from origin: ${origin} to ${req.method} ${req.path}`);
  }
  
  // Log response headers after they're set
  const originalSend = res.send;
  res.send = function(body: any) {
    logger.info(`📤 Response headers for ${req.method} ${req.path}:`, {
      'access-control-allow-origin': res.get('Access-Control-Allow-Origin'),
      'access-control-allow-credentials': res.get('Access-Control-Allow-Credentials'),
      'access-control-allow-methods': res.get('Access-Control-Allow-Methods'),
    });
    return originalSend.call(this, body);
  };
  
  next();
});

// API Routing - Defined after all middleware to ensure they are applied
app.use('/api', allRoutes);

// Environment-safe static file serving
const getClientDistPath = (): string => {
  // Try environment variable first, then relative path
  const envPath = process.env.CLIENT_DIST_PATH;
  if (envPath) {
    return path.resolve(envPath);
  }
  
  // Default fallback - try multiple possible locations
  const possiblePaths = [
    path.resolve(__dirname, '../client_dist'),
    path.resolve(__dirname, '../../client_dist'),
    path.resolve(process.cwd(), 'client_dist'),
  ];
  
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      return possiblePath;
    }
  }
  
  // If no client dist found, return the default path but log warning
  const defaultPath = path.resolve(__dirname, '../client_dist');
  logger.warn(`Client dist directory not found. Checked: ${possiblePaths.join(', ')}. Using default: ${defaultPath}`);
  return defaultPath;
};

const clientDistPath = getClientDistPath();
logger.info(`Serving static files from: ${clientDistPath}`);

// Serve static files from React build with proper caching
app.use(express.static(clientDistPath, {
  maxAge: vars.nodeEnv === 'production' ? '1y' : '0', // Cache for 1 year in production
  etag: true,
  lastModified: true,
  setHeaders: (res: Response, filePath: string) => {
    // Set cache control based on file type
    if (filePath.endsWith('.html')) {
      // HTML files should not be cached to ensure updates are loaded
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (filePath.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      // Assets can be cached for a long time
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Client-side routing fallback - serve index.html for all non-API routes
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  // Skip API routes and known backend endpoints
  if (req.path.startsWith('/api') || req.path === '/docs') {
    logger.info(`Skipping static serve for API/backend route: ${req.path}`);
    return next();
  }
  
  logger.info(`Attempting to serve client route: ${req.path}`);
  const indexPath = path.join(clientDistPath, 'index.html');
  logger.info(`Trying to serve index.html from: ${indexPath}`);
  
  // Check if index.html exists before serving
  if (!fs.existsSync(indexPath)) {
    logger.error(`index.html not found at ${indexPath}`);
    const errorMsg = `Frontend assets not found. Cannot serve ${req.originalUrl}`;
    return next(new AppError(errorMsg, 404));
  }
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      logger.error(`Error serving index.html from ${indexPath}: ${err.message}`);
      const errorMsg = `Can't find ${req.originalUrl} on this server!`;
      logger.warn(errorMsg);
      next(new AppError(errorMsg, 404));
    } else {
      logger.info(`Successfully served index.html for route: ${req.path}`);
    }
  });
});

// Handle non-GET requests that don't match API routes
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  // Only handle non-GET methods here (GET is handled above)
  if (req.method === 'GET') {
    return next();
  }
  
  const errorMsg = `Can't find ${req.originalUrl} on this server!`;
  logger.warn(errorMsg);
  next(new AppError(errorMsg, 404));
});

// Global Error Handler - Catch and process any errors from the entire stack
app.use(globalErrorHandler);

export default app;
