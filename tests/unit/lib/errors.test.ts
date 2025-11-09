import { describe, expect, it } from 'vitest';
import {
  DomainError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ConflictError,
  BusinessRuleError,
  getHttpStatusForError,
  formatErrorResponse,
} from '@/lib/errors';

describe('errors', () => {
  describe('DomainError', () => {
    it('should create error with correct message and name', () => {
      const error = new DomainError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('DomainError');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('NotFoundError', () => {
    it('should create error with resource and ID', () => {
      const error = new NotFoundError('Session', 'ABC123');
      expect(error.message).toBe('Session with ID ABC123 not found');
      expect(error.name).toBe('NotFoundError');
      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.name).toBe('ValidationError');
      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('UnauthorizedError', () => {
    it('should create unauthorized error with custom message', () => {
      const error = new UnauthorizedError('Not authorized to perform action');
      expect(error.message).toBe('Not authorized to perform action');
      expect(error.name).toBe('UnauthorizedError');
      expect(error).toBeInstanceOf(DomainError);
    });

    it('should use default message when not provided', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('Unauthorized operation');
      expect(error.name).toBe('UnauthorizedError');
    });
  });

  describe('ConflictError', () => {
    it('should create conflict error', () => {
      const error = new ConflictError('Resource already exists');
      expect(error.message).toBe('Resource already exists');
      expect(error.name).toBe('ConflictError');
      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('BusinessRuleError', () => {
    it('should create business rule error', () => {
      const error = new BusinessRuleError('Cannot vote on own team');
      expect(error.message).toBe('Cannot vote on own team');
      expect(error.name).toBe('BusinessRuleError');
      expect(error).toBeInstanceOf(DomainError);
    });
  });

  describe('getHttpStatusForError', () => {
    it('should return 404 for NotFoundError', () => {
      const error = new NotFoundError('Session', 'ABC123');
      expect(getHttpStatusForError(error)).toBe(404);
    });

    it('should return 400 for ValidationError', () => {
      const error = new ValidationError('Invalid input');
      expect(getHttpStatusForError(error)).toBe(400);
    });

    it('should return 403 for UnauthorizedError', () => {
      const error = new UnauthorizedError('Not authorized');
      expect(getHttpStatusForError(error)).toBe(403);
    });

    it('should return 409 for ConflictError', () => {
      const error = new ConflictError('Resource already exists');
      expect(getHttpStatusForError(error)).toBe(409);
    });

    it('should return 422 for BusinessRuleError', () => {
      const error = new BusinessRuleError('Business rule violation');
      expect(getHttpStatusForError(error)).toBe(422);
    });

    it('should return 500 for generic Error', () => {
      const error = new Error('Generic error');
      expect(getHttpStatusForError(error)).toBe(500);
    });
  });

  describe('formatErrorResponse', () => {
    it('should format DomainError with message', () => {
      const error = new ValidationError('Invalid input');
      const response = formatErrorResponse(error);
      expect(response).toEqual({
        error: 'Invalid input',
      });
    });

    it('should format NotFoundError with message', () => {
      const error = new NotFoundError('Session', 'ABC123');
      const response = formatErrorResponse(error);
      expect(response).toEqual({
        error: 'Session with ID ABC123 not found',
      });
    });

    it('should format generic Error with generic message', () => {
      const error = new Error('Internal error');
      const response = formatErrorResponse(error);
      expect(response.error).toBe('An unexpected error occurred');
    });

    it('should include details in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Internal error details');
      const response = formatErrorResponse(error);

      expect(response.error).toBe('An unexpected error occurred');
      expect(response.details).toBe('Internal error details');

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include details in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Internal error details');
      const response = formatErrorResponse(error);

      expect(response.error).toBe('An unexpected error occurred');
      expect(response.details).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });
  });
});
