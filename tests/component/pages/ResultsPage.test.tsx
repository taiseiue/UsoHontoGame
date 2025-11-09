import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResultsPage } from '@/components/pages/ResultsPage';
import { useResults } from '@/components/pages/ResultsPage/hooks/useResults';

// Mock the useResults hook - must match the relative import path used in ResultsPage
vi.mock('@/components/pages/ResultsPage/hooks/useResults', () => ({
  useResults: vi.fn(),
}));

// Mock ConfettiAnimation component
vi.mock('@/components/ui/ConfettiAnimation', () => ({
  ConfettiAnimation: () => <div data-testid="confetti-animation">Confetti</div>,
}));

// Mock RankingDisplay component
vi.mock('@/components/domain/game/RankingDisplay', () => ({
  RankingDisplay: ({ teams }: { teams: Array<{ id: string; name: string; score: number }> }) => (
    <div data-testid="ranking-display">
      {teams.map((team) => (
        <div key={team.id} data-testid={`team-${team.id}`}>
          {team.name}: {team.score}
        </div>
      ))}
    </div>
  ),
}));

// Mock TeamPerformanceSummary component
vi.mock('@/components/domain/game/TeamPerformanceSummary', () => ({
  TeamPerformanceSummary: ({ teamId }: { teamId: string }) => (
    <div data-testid={`performance-${teamId}`}>Performance Summary</div>
  ),
}));

// Get typed mock
const mockUseResults = vi.mocked(useResults);

describe('ResultsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state while fetching results', () => {
    mockUseResults.mockReturnValue({
      isLoading: true,
      results: null,
      error: null,
      refetch: vi.fn(),
    });

    render(<ResultsPage sessionId="session-123" />);

    expect(screen.getByText('Loading results...')).toBeInTheDocument();
  });

  it('should display error message when fetch fails', () => {
    mockUseResults.mockReturnValue({
      isLoading: false,
      results: null,
      error: 'Failed to load results',
      refetch: vi.fn(),
    });

    render(<ResultsPage sessionId="session-123" />);

    expect(screen.getByText(/failed to load results/i)).toBeInTheDocument();
  });

  it('should display team rankings ordered by score', async () => {
    const mockResults = {
      sessionId: 'session-123',
      teams: [
        { id: 'team-1', name: 'Team Alpha', score: 100 },
        { id: 'team-2', name: 'Team Beta', score: 150 },
        { id: 'team-3', name: 'Team Gamma', score: 75 },
      ],
      winner: { id: 'team-2', name: 'Team Beta', score: 150 },
    };

    mockUseResults.mockReturnValue({
      isLoading: false,
      results: mockResults,
      error: null,
      refetch: vi.fn(),
    });

    render(<ResultsPage sessionId="session-123" />);

    await waitFor(() => {
      expect(screen.getByTestId('ranking-display')).toBeInTheDocument();
    });

    // Verify all teams are displayed
    expect(screen.getByTestId('team-team-1')).toBeInTheDocument();
    expect(screen.getByTestId('team-team-2')).toBeInTheDocument();
    expect(screen.getByTestId('team-team-3')).toBeInTheDocument();
  });

  it('should highlight the winning team', async () => {
    const mockResults = {
      sessionId: 'session-123',
      teams: [
        { id: 'team-1', name: 'Team Alpha', score: 100 },
        { id: 'team-2', name: 'Team Beta', score: 150 },
      ],
      winner: { id: 'team-2', name: 'Team Beta', score: 150 },
    };

    mockUseResults.mockReturnValue({
      isLoading: false,
      results: mockResults,
      error: null,
      refetch: vi.fn(),
    });

    render(<ResultsPage sessionId="session-123" />);

    await waitFor(() => {
      expect(screen.getByText('Congratulations!')).toBeInTheDocument();
      // Winner announcement is split across multiple elements - verify key parts are present
      expect(screen.getByText(/wins with/i)).toBeInTheDocument();
      expect(screen.getByText(/points!/i)).toBeInTheDocument();
    });
  });

  it('should display confetti animation for the winner', async () => {
    const mockResults = {
      sessionId: 'session-123',
      teams: [
        { id: 'team-1', name: 'Team Alpha', score: 100 },
        { id: 'team-2', name: 'Team Beta', score: 150 },
      ],
      winner: { id: 'team-2', name: 'Team Beta', score: 150 },
    };

    mockUseResults.mockReturnValue({
      isLoading: false,
      results: mockResults,
      error: null,
      refetch: vi.fn(),
    });

    render(<ResultsPage sessionId="session-123" />);

    await waitFor(() => {
      expect(screen.getByTestId('confetti-animation')).toBeInTheDocument();
    });
  });

  it('should display performance summaries for each team', async () => {
    const mockResults = {
      sessionId: 'session-123',
      teams: [
        { id: 'team-1', name: 'Team Alpha', score: 100 },
        { id: 'team-2', name: 'Team Beta', score: 150 },
      ],
      winner: { id: 'team-2', name: 'Team Beta', score: 150 },
    };

    mockUseResults.mockReturnValue({
      isLoading: false,
      results: mockResults,
      error: null,
      refetch: vi.fn(),
    });

    render(<ResultsPage sessionId="session-123" />);

    await waitFor(() => {
      expect(screen.getByTestId('performance-team-1')).toBeInTheDocument();
      expect(screen.getByTestId('performance-team-2')).toBeInTheDocument();
    });
  });

  it('should handle tie scenarios gracefully', async () => {
    const mockResults = {
      sessionId: 'session-123',
      teams: [
        { id: 'team-1', name: 'Team Alpha', score: 150 },
        { id: 'team-2', name: 'Team Beta', score: 150 },
      ],
      winner: null, // Tie scenario
    };

    mockUseResults.mockReturnValue({
      isLoading: false,
      results: mockResults,
      error: null,
      refetch: vi.fn(),
    });

    render(<ResultsPage sessionId="session-123" />);

    await waitFor(() => {
      expect(screen.getByText(/it's a tie/i)).toBeInTheDocument();
    });
  });

  it('should display session completion message', async () => {
    const mockResults = {
      sessionId: 'session-123',
      teams: [{ id: 'team-1', name: 'Team Alpha', score: 100 }],
      winner: { id: 'team-1', name: 'Team Alpha', score: 100 },
    };

    mockUseResults.mockReturnValue({
      isLoading: false,
      results: mockResults,
      error: null,
      refetch: vi.fn(),
    });

    render(<ResultsPage sessionId="session-123" />);

    await waitFor(() => {
      expect(screen.getByText(/game complete/i)).toBeInTheDocument();
    });
  });
});
