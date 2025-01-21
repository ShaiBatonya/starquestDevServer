// src/api/utils/catchAsync.ts

import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line no-unused-vars
type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

const catchAsync = (fn: AsyncRouteHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
