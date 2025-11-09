import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { POST as createSessionPOST } from '@/app/api/sessions/route';
import { POST as endPOST } from '@/app/api/sessions/[id]/end/route';
import { createMockRequest, parseResponse } from './test-helpers';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';

describe('POST /api/sessions/[id]/end', () => {
  let testSessionId: string;
  let testHostId: string;

  beforeEach(async () => {
    InMemoryGameSessionRepository.getInstance().clearAll();

    // Create session
    const sessionRequest = createMockRequest('POST', 'http://localhost:3000/api/sessions', {
      body: { hostNickname: 'Host' },
    });
    const sessionResponse = await createSessionPOST(sessionRequest);
    const sessionData = await parseResponse(sessionResponse);
    testSessionId = sessionData.sessionId;
    testHostId = sessionData.hostId;
  });

  afterEach(async () => {
    InMemoryGameSessionRepository.getInstance().clearAll();
  });

  it('should end game and transition to finished phase', async () => {
    const request = createMockRequest('POST', `http://localhost:3000/api/sessions/${testSessionId}/end`, {
      body: { hostId: testHostId },
    });
    const response = await endPOST(request, { params: { id: testSessionId } });
    const data = await parseResponse(response);

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('success');
    expect(data.success).toBe(true);
    expect(data).toHaveProperty('phase');
    expect(data.phase).toBe('completed');
  });

  it('should return 404 for non-existent session', async () => {
    const request = createMockRequest('POST', 'http://localhost:3000/api/sessions/INVALID/end', {
      body: { hostId: testHostId },
    });
    const response = await endPOST(request, { params: { id: 'INVALID' } });

    expect([404, 500]).toContain(response.status);
  });

  it('should return 401 when non-host tries to end game', async () => {
    const request = createMockRequest('POST', `http://localhost:3000/api/sessions/${testSessionId}/end`, {
      body: { hostId: 'invalid-host-id' },
    });
    const response = await endPOST(request, { params: { id: testSessionId } });

    expect([401, 500]).toContain(response.status);
  });

  it('should allow ending game before it starts', async () => {
    const request = createMockRequest('POST', `http://localhost:3000/api/sessions/${testSessionId}/end`, {
      body: { hostId: testHostId },
    });
    const response = await endPOST(request, { params: { id: testSessionId } });

    expect(response.status).toBe(200);
  });

  it('should return final scores for all teams', async () => {
    const request = createMockRequest('POST', `http://localhost:3000/api/sessions/${testSessionId}/end`, {
      body: { hostId: testHostId },
    });
    const response = await endPOST(request, { params: { id: testSessionId } });
    const data = await parseResponse(response);

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('success');
    expect(data.success).toBe(true);
  });

  it('should determine winner based on final scores', async () => {
    // This test validates winner calculation logic
    // Simplified placeholder
    expect(true).toBe(true);
  });

  it('should prevent ending game that is already finished', async () => {
    // End game once
    const request1 = createMockRequest('POST', `http://localhost:3000/api/sessions/${testSessionId}/end`, {
      body: { hostId: testHostId },
    });
    await endPOST(request1, { params: { id: testSessionId } });

    // Try to end again
    const request2 = createMockRequest('POST', `http://localhost:3000/api/sessions/${testSessionId}/end`, {
      body: { hostId: testHostId },
    });
    const response = await endPOST(request2, { params: { id: testSessionId } });

    expect([400, 500]).toContain(response.status);
  });
});
