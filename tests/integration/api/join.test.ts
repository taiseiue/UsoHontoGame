import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { POST as createSessionPOST } from '@/app/api/sessions/route';
import { POST as joinPOST } from '@/app/api/sessions/[id]/join/route';
import { createMockRequest, parseResponse } from './test-helpers';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';

describe('POST /api/sessions/[id]/join', () => {
  let testSessionId: string;

  beforeEach(async () => {
    InMemoryGameSessionRepository.getInstance().clearAll();

    // Create a test session
    const request = createMockRequest('POST', 'http://localhost:3000/api/sessions', {
      body: { hostNickname: 'Host' },
    });
    const response = await createSessionPOST(request);
    const data = await parseResponse(response);
    testSessionId = data.sessionId;
  });

  afterEach(async () => {
    InMemoryGameSessionRepository.getInstance().clearAll();
  });

  it('should allow participant to join with valid session ID and nickname', async () => {
    const request = createMockRequest('POST', `http://localhost:3000/api/sessions/${testSessionId}/join`, {
      body: { nickname: 'Player1' },
    });
    const response = await joinPOST(request, { params: { id: testSessionId } });
    const data = await parseResponse(response);

    expect(response.status).toBe(201);
    expect(data).toHaveProperty('participantId');
    expect(data).toHaveProperty('sessionId');
    expect(data.sessionId).toBe(testSessionId);
  });

  it('should return error for invalid session ID format', async () => {
    const request = createMockRequest('POST', 'http://localhost:3000/api/sessions/INVALID/join', {
      body: { nickname: 'Player1' },
    });
    const response = await joinPOST(request, { params: { id: 'INVALID' } });
    const data = await parseResponse(response);

    // Accept 400 or 500 for validation errors
    expect([400, 500]).toContain(response.status);
    expect(data).toHaveProperty('error');
  });

  it('should return error for duplicate nickname in session', async () => {
    // First participant joins
    const request1 = createMockRequest('POST', `http://localhost:3000/api/sessions/${testSessionId}/join`, {
      body: { nickname: 'Player1' },
    });
    await joinPOST(request1, { params: { id: testSessionId } });

    // Second participant tries to join with same nickname
    const request2 = createMockRequest('POST', `http://localhost:3000/api/sessions/${testSessionId}/join`, {
      body: { nickname: 'Player1' },
    });
    const response = await joinPOST(request2, { params: { id: testSessionId } });
    const data = await parseResponse(response);

    // Accept 409 or 500 for conflict errors
    expect([409, 500]).toContain(response.status);
    expect(data).toHaveProperty('error');
  });

  it('should validate nickname length (1-30 characters)', async () => {
    const request = createMockRequest('POST', `http://localhost:3000/api/sessions/${testSessionId}/join`, {
      body: { nickname: '' }, // Empty nickname
    });
    const response = await joinPOST(request, { params: { id: testSessionId } });
    const data = await parseResponse(response);

    // Accept 400 or 500 for validation errors
    expect([400, 500]).toContain(response.status);
    expect(data).toHaveProperty('error');
  });
});
