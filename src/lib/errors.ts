/**
 * Custom error classes for domain-specific errors
 */

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id: string) {
    super(`${resource} with ID ${id} not found`);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized operation') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class BusinessRuleError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessRuleError';
  }
}

/**
 * Map errors to HTTP status codes
 */
export function getHttpStatusForError(error: Error): number {
  if (error instanceof NotFoundError) {
    return 404;
  }
  if (error instanceof ValidationError) {
    return 400;
  }
  if (error instanceof UnauthorizedError) {
    return 403;
  }
  if (error instanceof ConflictError) {
    return 409;
  }
  if (error instanceof BusinessRuleError) {
    return 422;
  }
  return 500;
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: Error): {
  error: string;
  details?: unknown;
} {
  if (error instanceof DomainError) {
    return {
      error: error.message,
    };
  }
  // Don't expose internal error details in production
  return {
    error: 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
  };
}
