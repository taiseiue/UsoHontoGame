/**
 * Application-level error classes
 * These errors represent different types of failures in the application layer
 */

/**
 * Base class for all application errors
 */
export class ApplicationError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * ValidationError
 * Thrown when input validation fails
 * HTTP Status: 400 Bad Request
 */
export class ValidationError extends ApplicationError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

/**
 * NotFoundError
 * Thrown when a requested resource is not found
 * HTTP Status: 404 Not Found
 */
export class NotFoundError extends ApplicationError {
  constructor(resource: string, identifier?: string) {
    const message = identifier ? `${resource} not found: ${identifier}` : `${resource} not found`;
    super(message, 'NOT_FOUND');
  }
}

/**
 * ConflictError
 * Thrown when there is a conflict with existing data
 * HTTP Status: 409 Conflict
 */
export class ConflictError extends ApplicationError {
  constructor(message: string) {
    super(message, 'CONFLICT');
  }
}

/**
 * BusinessRuleError
 * Thrown when a business rule is violated
 * HTTP Status: 422 Unprocessable Entity
 */
export class BusinessRuleError extends ApplicationError {
  constructor(message: string) {
    super(message, 'BUSINESS_RULE_VIOLATION');
  }
}

/**
 * UnauthorizedError
 * Thrown when authentication is required but not provided
 * HTTP Status: 401 Unauthorized
 */
export class UnauthorizedError extends ApplicationError {
  constructor(message = 'Authentication required') {
    super(message, 'UNAUTHORIZED');
  }
}

/**
 * ForbiddenError
 * Thrown when the user doesn't have permission to perform an action
 * HTTP Status: 403 Forbidden
 */
export class ForbiddenError extends ApplicationError {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN');
  }
}
