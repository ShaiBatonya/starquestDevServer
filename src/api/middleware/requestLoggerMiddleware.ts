import { Request, Response, NextFunction } from 'express';
import logger from '@/config/logger';

const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  req.requestTime = new Date().toISOString();

  const start = Date.now();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  res.on('finish', () => {
    const logDetails = {
      method: req.method,
      path: req.path,
      time: req.requestTime,
      ip: clientIp,
      statusCode: res.statusCode,
      responseTime: `${Date.now() - start}ms`,
    };

    logger.info(`Request-Response details: ${JSON.stringify(logDetails)}`);
  });

  next();
};

export default requestLoggerMiddleware;
