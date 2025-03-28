import { Request, Response, NextFunction } from 'express';

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handling middleware
export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errorStack = undefined;

  // Check if the error is our custom API error
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    // Handle validation errors from libraries like Zod or Express Validator
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    // Handle JWT authorization errors
    statusCode = 401;
    message = 'Unauthorized access';
  } else {
    // Any other error
    message = err.message;
  }

  // Include stack trace in development environment
  if (process.env.NODE_ENV === 'development') {
    errorStack = err.stack;
  }

  // Log error
  console.error(`[ERROR] ${statusCode} - ${message}`, err);

  // Send response
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(errorStack && { stack: errorStack }),
  });
}; 