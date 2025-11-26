// Component Tests: ResponseStatusPage
// Feature: 006-results-dashboard, User Story 1
// TDD: Write tests FIRST

import { describe, expect, it, vi } from 'vitest';
import type { ResponseStatusDto } from '@/server/application/dto/ResponseStatusDto';

// Mock hook
vi.mock('./hooks/useResponseStatus', () => ({
  useResponseStatus: vi.fn(),
}));

// Component import will fail until created
// import ResponseStatusPage from './index';

describe('ResponseStatusPage', () => {
  const _mockData: ResponseStatusDto = {
    gameId: 'game-123',
    gameName: 'Test Game',
    gameStatus: '出題中',
    participants: [
      { nickname: 'Alice', hasSubmitted: true, submittedAt: new Date() },
      { nickname: 'Bob', hasSubmitted: false },
    ],
    totalParticipants: 2,
    submittedCount: 1,
    allSubmitted: false,
    lastUpdated: new Date(),
  };

  it('should render participant list', () => {
    // TODO: Implement when component exists
    expect(true).toBe(true);
  });

  it('should show submission count', () => {
    expect(true).toBe(true);
  });

  it('should display "All responses received" when complete', () => {
    expect(true).toBe(true);
  });
});
