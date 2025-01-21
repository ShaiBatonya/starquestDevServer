// src/api/middleware/error.middleware.ts

import { Request, Response, NextFunction } from 'express';
import AppError from '@/api/utils/appError';
import { vars } from '@/config/vars';
import logger from '@/config/logger'; // Import the logger

const { nodeEnv } = vars;

interface ErrorWithStatus extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  errmsg?: string;
  code?: number;
  errors?: any;
}

// Handles errors for invalid database casting (e.g., invalid ObjectId)
const handleCastErrorDB = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// Handles duplicate database field errors (e.g., trying to use an existing unique field value)
const handleDuplicateFieldsDB = (err: any): AppError => {
  const valueMatch = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  const value = valueMatch ? valueMatch[0] : 'unknown'; // Default to 'unknown' if no match found
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

// Handles validation errors from the database (e.g., required fields, type checks)
const handleValidationErrorDB = (err: any): AppError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Creates a new instance of the `AppError` class with a message indicating an invalid token.
const handleJWTError = (): AppError => new AppError('Invalid token. Please log in again!', 401);

// Creates a new instance of the `AppError` class with a specific error message and status code.
const handleJWTExpiredError = (): AppError =>
  new AppError('Your token has expired! Please log in again.', 401);

// Error response for development environment - includes more error details
const sendErrorDev = (err: ErrorWithStatus, res: Response): void => {
  logger.error('Development error:', err);
  res.status(err.statusCode || 500).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
// Error response for production environment - less detailed, more user-friendly
const sendErrorProd = (err: ErrorWithStatus, res: Response): void => {
  if (err.isOperational) {
    logger.error('Operational error:', err); // Log the error details
    res.status(err.statusCode || 500).json({
      status: err.status,
      message: err.message,
    });
  } else {
    logger.error('Non-operational error:', err); // Log the error details
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

// Main error handling middleware
const errorController = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (nodeEnv === 'development') {
    sendErrorDev(err, res);
  } else if (nodeEnv === 'production') {
    let error: ErrorWithStatus = { ...err, message: err.message };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

export default errorController;
