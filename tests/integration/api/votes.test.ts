import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { POST as createSessionPOST } from '@/app/api/sessions/route';
import { POST as votesPOST } from '@/app/api/votes/route';
import { createMockRequest, parseResponse } from './test-helpers';
import { InMemoryGameSessionRepository } from '@/server/infrastructure/repositories/InMemoryGameSessionRepository';

describe('POST /api/votes', () => {
  let testSessionId: string;
  const testTurnId = 'test-turn-id';
  const testTeamId = 'test-team-id';
  const presentingTeamId = 'presenting-team-id';

  beforeEach(async () => {
    InMemoryGameSessionRepository.getInstance().clearAll();

    // Create session
    const sessionRequest = createMockRequest('POST', 'http://localhost:3000/api/sessions', {
      body: { hostNickname: 'Host' },
    });
    const sessionResponse = await createSessionPOST(sessionRequest);
    const sessionData = await parseResponse(sessionResponse);
    testSessionId = sessionData.sessionId;
  });

  afterEach(async () => {
    InMemoryGameSessionRepository.getInstance().clearAll();
  });

  it('should allow team to submit vote with episode number 1-3', async () => {
    const request = createMockRequest('POST', 'http://localhost:3000/api/votes', {
      body: {
        sessionId: testSessionId,
        teamId: testTeamId,
        turnId: testTurnId,
        selectedEpisodeNumber: 2,
        presentingTeamId: presentingTeamId,
      },
    });
    const response = await votesPOST(request);
    const data = await parseResponse(response);

    expect(response.status).toBe(201);
    expect(data).toHaveProperty('voteId');
    expect(data).toHaveProperty('teamId');
    expect(data).toHaveProperty('selectedEpisodeNumber');
    expect(data.selectedEpisodeNumber).toBe(2);
  });

  it('should prevent duplicate voting by same team', async () => {
    // First vote
    const request1 = createMockRequest('POST', 'http://localhost:3000/api/votes', {
      body: {
        sessionId: testSessionId,
        teamId: testTeamId,
        turnId: testTurnId,
        selectedEpisodeNumber: 1,
        presentingTeamId: presentingTeamId,
      },
    });
    await votesPOST(request1);

    // Try to vote again
    const request2 = createMockRequest('POST', 'http://localhost:3000/api/votes', {
      body: {
        sessionId: testSessionId,
        teamId: testTeamId,
        turnId: testTurnId,
        selectedEpisodeNumber: 2,
        presentingTeamId: presentingTeamId,
      },
    });
    const response = await votesPOST(request2);
    const data = await parseResponse(response);

    expect([422, 500]).toContain(response.status);
    expect(data).toHaveProperty('error');
  });

  it('should prevent presenting team from voting', async () => {
    const request = createMockRequest('POST', 'http://localhost:3000/api/votes', {
      body: {
        sessionId: testSessionId,
        teamId: presentingTeamId, // Same as presenting team
        turnId: testTurnId,
        selectedEpisodeNumber: 1,
        presentingTeamId: presentingTeamId,
      },
    });
    const response = await votesPOST(request);
    const data = await parseResponse(response);

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
  });

  it('should validate selectedEpisodeNumber is between 1 and 3', async () => {
    const request = createMockRequest('POST', 'http://localhost:3000/api/votes', {
      body: {
        sessionId: testSessionId,
        teamId: testTeamId,
        turnId: testTurnId,
        selectedEpisodeNumber: 5, // Invalid: must be 1-3
        presentingTeamId: presentingTeamId,
      },
    });
    const response = await votesPOST(request);
    const data = await parseResponse(response);

    expect([400, 500]).toContain(response.status);
    expect(data).toHaveProperty('error');
  });

  it('should return error for non-existent session', async () => {
    const request = createMockRequest('POST', 'http://localhost:3000/api/votes', {
      body: {
        sessionId: 'INVALID',
        teamId: testTeamId,
        turnId: testTurnId,
        selectedEpisodeNumber: 1,
        presentingTeamId: presentingTeamId,
      },
    });
    const response = await votesPOST(request);
    const data = await parseResponse(response);

    expect([404, 500]).toContain(response.status);
    expect(data).toHaveProperty('error');
  });
});
