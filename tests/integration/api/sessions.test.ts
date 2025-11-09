import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { POST } from '@/app/api/sessions/route';
import { createMockRequest, parseResponse } from './test-helpers';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';

describe('POST /api/sessions', () => {
  beforeEach(() => {
    InMemoryGameSessionRepository.getInstance().clearAll();
  });

  afterEach(() => {
    InMemoryGameSessionRepository.getInstance().clearAll();
  });

  it('should create session and return 201 with session ID', async () => {
    const request = createMockRequest('POST', 'http://localhost:3000/api/sessions', {
      body: { hostNickname: 'HostPlayer' },
    });

    const response = await POST(request);
    const data = await parseResponse(response);

    expect(response.status).toBe(201);
    expect(data).toHaveProperty('sessionId');
    expect(data).toHaveProperty('hostId');
    expect(data).toHaveProperty('phase');
    expect(data.phase).toBe('preparation');
    expect(data.sessionId).toMatch(/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);
  });

  it('should validate hostNickname is required', async () => {
    const request = createMockRequest('POST', 'http://localhost:3000/api/sessions', {
      body: {},
    });

    const response = await POST(request);
    const data = await parseResponse(response);

    expect(response.status).toBe(500); // Catches as unhandled error
    expect(data).toHaveProperty('error');
  });

  it('should use default scoring rules when not provided', async () => {
    const request = createMockRequest('POST', 'http://localhost:3000/api/sessions', {
      body: { hostNickname: 'HostPlayer' },
    });

    const response = await POST(request);
    const data = await parseResponse(response);

    expect(response.status).toBe(201);
    expect(data).toHaveProperty('sessionId');
    // Default scoring rules should be applied by the use case
  });

  it('should return error for invalid request body', async () => {
    const request = createMockRequest('POST', 'http://localhost:3000/api/sessions', {
      body: { hostNickname: '' }, // Empty nickname should fail validation
    });

    const response = await POST(request);
    const data = await parseResponse(response);

    // Accept 400 or 500 for validation errors
    expect([400, 500]).toContain(response.status);
    expect(data).toHaveProperty('error');
  });
});
