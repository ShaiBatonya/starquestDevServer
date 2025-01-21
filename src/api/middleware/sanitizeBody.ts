import { Request, Response, NextFunction } from 'express';
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Sanitize Data - Protect against NoSQL injections and XSS
const sanitizeBodyMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = DOMPurify.sanitize(req.body[key]);
      }
    });
  }
  next();
};

export default sanitizeBodyMiddleware;
