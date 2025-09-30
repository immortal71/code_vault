import type { VercelResponse } from '@vercel/node';
import { ZodError } from 'zod';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleError(res: VercelResponse, error: unknown): void {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      details: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    });
    return;
  }

  // Handle API errors
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      error: error.message,
      ...(error.details && { details: error.details }),
    });
    return;
  }

  // Handle unknown errors
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
  });
}

export function unauthorized(message: string = 'Unauthorized'): ApiError {
  return new ApiError(401, message);
}

export function forbidden(message: string = 'Forbidden'): ApiError {
  return new ApiError(403, message);
}

export function notFound(message: string = 'Not found'): ApiError {
  return new ApiError(404, message);
}

export function badRequest(message: string, details?: any): ApiError {
  return new ApiError(400, message, details);
}

export function conflict(message: string): ApiError {
  return new ApiError(409, message);
}
