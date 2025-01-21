// src/server.ts
import 'module-alias/register';
import { connectDB } from '@/api/utils/connect';
import { vars } from '@/config/vars';
import logger from '@/config/logger';

const { port } = vars;

interface ErrorDetails {
  message: string;
  stack: string | undefined;
  name: string;
}

const formatErrorDetails = (err: Error): ErrorDetails => ({
  message: err.message,
  stack: err.stack,
  name: err.name,
});
// Handling uncaught exceptions at the top level
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', formatErrorDetails(err));
  process.exit(1);
});

import app from './app';

connectDB();

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Handling unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', formatErrorDetails(err));
  server.close(() => {
    process.exit(1);
  });
});
