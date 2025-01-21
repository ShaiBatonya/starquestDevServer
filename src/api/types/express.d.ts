//  src/api/types/express.d.ts

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    requestTime?: string;
    csrfToken(): string;
    session: session.Session & Partial<session.SessionData>;
  }
}
