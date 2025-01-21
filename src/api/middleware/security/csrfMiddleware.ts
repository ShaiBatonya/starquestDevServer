import csrf from 'csrf';
import { Request, Response, NextFunction } from 'express';

const csrfProtection = new csrf();

const csrfMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.csrfToken) {
    req.csrfToken = () => csrfProtection.create(req.sessionID);
    const token = req.csrfToken();
    res.cookie('XSRF-TOKEN', token);
  }
  next();
};

export default csrfMiddleware;
