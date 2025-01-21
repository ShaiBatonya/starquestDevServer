import { Request, Response, NextFunction } from 'express';

const attachCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  res.locals.csrfToken = req.csrfToken();
  next();
};

export default attachCsrfToken;
