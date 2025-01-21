// src/api/utils/appError.ts

class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message); // Call parent constructor with the message

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Indicates that this is an operational, rather than a programming, error

    // Attach the stack trace to this error instance (excluding the constructor call)
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
