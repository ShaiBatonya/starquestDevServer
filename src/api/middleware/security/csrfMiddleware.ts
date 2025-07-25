import csrf from 'csrf';
import { Request, Response, NextFunction } from 'express';
import AppError from '@/api/utils/appError';
import logger from '@/config/logger';

const csrfProtection = new csrf();

const csrfMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Generate and attach CSRF token for all requests
  if (!req.csrfToken) {
    req.csrfToken = () => csrfProtection.create(req.sessionID);
    const token = req.csrfToken();
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false, // Client needs to read this for AJAX requests
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    });
  }

  // Skip CSRF validation for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for development if explicitly disabled
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_CSRF === 'true') {
    logger.warn('CSRF validation skipped in development mode');
    return next();
  }

  // Validate CSRF token for state-changing requests
  const token = req.get('X-CSRF-Token') || req.get('X-XSRF-Token') || req.body._csrf;
  
  if (!token) {
    logger.warn(`CSRF token missing for ${req.method} ${req.path} from IP ${req.ip}`);
    return next(new AppError('CSRF token missing', 403));
  }

  if (!csrfProtection.verify(req.sessionID, token)) {
    logger.warn(`Invalid CSRF token for ${req.method} ${req.path} from IP ${req.ip}`);
    return next(new AppError('Invalid CSRF token', 403));
  }

  next();
};

export default csrfMiddleware;
