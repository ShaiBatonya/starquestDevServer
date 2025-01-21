import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per `window` (here, per minute)
  standardHeaders: true,
  legacyHeaders: false,
});

export default limiter;
