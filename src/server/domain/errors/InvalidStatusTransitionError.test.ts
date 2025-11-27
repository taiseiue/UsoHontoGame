// InvalidStatusTransitionError Tests
// Tests for invalid status transition error class

import { describe, expect, it } from 'vitest';
import { InvalidStatusTransitionError } from './InvalidStatusTransitionError';

describe('InvalidStatusTransitionError', () => {
  it('should create error with custom message', () => {
    const error = new InvalidStatusTransitionError(
      '準備中',
      '締切',
      '準備中から締切への遷移は無効です'
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(InvalidStatusTransitionError);
    expect(error.message).toBe('準備中から締切への遷移は無効です');
  });

  it('should create error with default message when message not provided', () => {
    // Tests line 11 branch: message || fallback
    const error = new InvalidStatusTransitionError('準備中', '締切');

    expect(error.message).toBe('Cannot transition from 準備中 to 締切');
  });

  it('should set error name to InvalidStatusTransitionError', () => {
    const error = new InvalidStatusTransitionError('準備中', '出題中');

    expect(error.name).toBe('InvalidStatusTransitionError');
  });

  it('should store currentStatus and targetStatus properties', () => {
    const error = new InvalidStatusTransitionError('出題中', '準備中');

    expect(error.currentStatus).toBe('出題中');
    expect(error.targetStatus).toBe('準備中');
  });

  it('should be throwable and catchable', () => {
    expect(() => {
      throw new InvalidStatusTransitionError('締切', '準備中');
    }).toThrow(InvalidStatusTransitionError);

    expect(() => {
      throw new InvalidStatusTransitionError('締切', '準備中');
    }).toThrow('Cannot transition from 締切 to 準備中');
  });

  it('should maintain stack trace', () => {
    const error = new InvalidStatusTransitionError('準備中', '締切');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('InvalidStatusTransitionError');
  });

  it('should handle different status transition combinations', () => {
    const error1 = new InvalidStatusTransitionError('準備中', '締切', 'Invalid transition');
    const error2 = new InvalidStatusTransitionError('出題中', '準備中');
    const error3 = new InvalidStatusTransitionError('締切', '出題中');

    expect(error1.currentStatus).toBe('準備中');
    expect(error1.targetStatus).toBe('締切');
    expect(error2.currentStatus).toBe('出題中');
    expect(error2.targetStatus).toBe('準備中');
    expect(error3.currentStatus).toBe('締切');
    expect(error3.targetStatus).toBe('出題中');
  });
});
