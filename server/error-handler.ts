import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class ValidationError extends Error implements AppError {
  statusCode = 400;
  isOperational = true;
  
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends Error implements AppError {
  statusCode = 500;
  isOperational = true;
  
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class RateLimitError extends Error implements AppError {
  statusCode = 429;
  isOperational = true;
  
  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function errorHandler(err: AppError, req: Request, res: Response, next: NextFunction) {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  console.error(`Error: ${err.message}`);
  console.error(`Stack: ${err.stack}`);
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ValidationError(message);
  }
  
  // Mongoose duplicate key
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ValidationError(message);
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError' && (err as any).errors) {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
    error = new ValidationError(message);
  }

  // Handle Drizzle/PostgreSQL errors
  if (err.message?.includes('duplicate key value violates unique constraint')) {
    error = new ValidationError('Duplicate entry found');
  }
  
  if (err.message?.includes('relation') && err.message?.includes('does not exist')) {
    error = new DatabaseError('Database schema error');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new ValidationError(message);
  }
  
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new ValidationError(message);
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Internal server error';
  
  // Don't leak error details in production
  const errorResponse = process.env.NODE_ENV === 'production' 
    ? { 
        success: false, 
        error: message,
        ...(statusCode < 500 && { details: error.message })
      }
    : {
        success: false,
        error: message,
        stack: err.stack,
        details: error
      };

  res.status(statusCode).json(errorResponse);
}

export function notFound(req: Request, res: Response, next: NextFunction) {
  const error = new ValidationError(`Not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

// Global unhandled promise rejection handler
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  // In production, you might want to gracefully shut down
  if (process.env.NODE_ENV === 'production') {
    console.log('Shutting down server due to unhandled promise rejection');
    process.exit(1);
  }
});

// Global uncaught exception handler
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  console.log('Shutting down server due to uncaught exception');
  process.exit(1);
});

export default {
  asyncHandler,
  errorHandler,
  notFound,
  ValidationError,
  DatabaseError,
  RateLimitError
};