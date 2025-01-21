import session from 'express-session';
import { vars } from '@/config/vars';

const sessionMiddleware = session({
  secret: vars.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' },
});

export default sessionMiddleware;
