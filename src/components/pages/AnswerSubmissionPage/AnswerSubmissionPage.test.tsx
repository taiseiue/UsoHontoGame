// Component Tests: AnswerSubmissionPage
// Test-Driven Development: Write FAILING tests first
// Task: T041

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibilityProvider } from '@/components/ui/AccessibilityProvider';
import type { GameAnswerFormData } from './hooks/useAnswerSubmission';
import { useAnswerSubmissionPage } from './hooks/useAnswerSubmissionPage';
import { AnswerSubmissionPage } from './index';

// Mock dependencies
vi.mock('@/components/domain/answer/GameAnswerForm', () => ({
  GameAnswerForm: ({ onSubmit, onReset, ...props }: Record<string, unknown>) => (
    <div data-testid="game-answer-form" data-props={JSON.stringify(props)}>
      <button type="button" onClick={onSubmit as () => void}>
        Submit
      </button>
      <button type="button" onClick={onReset as () => void}>
        Reset
      </button>
    </div>
  ),
}));

// Mock the page hook (which uses the router)
vi.mock('./hooks/useAnswerSubmissionPage');

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

// Mock server actions
vi.mock('@/app/actions/presenter', () => ({
  getPresentersAction: vi.fn(),
}));

const mockUseAnswerSubmissionPage = vi.mocked(useAnswerSubmissionPage);

// Test wrapper with AccessibilityProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AccessibilityProvider>{children}</AccessibilityProvider>
);

describe('AnswerSubmissionPage', () => {
  const mockGameId = 'game-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading message when data is being fetched', () => {
      mockUseAnswerSubmissionPage.mockReturnValue({
        formData: null,
        isLoading: true,
        error: null,
        successMessage: null,
        handleSelectEpisode: vi.fn(),
        handleSubmit: vi.fn(),
        handleReset: vi.fn(),
      });

      render(
        <TestWrapper>
          <AnswerSubmissionPage gameId={mockGameId} />
        </TestWrapper>
      );

      expect(screen.getByText(/読み込み中/i)).toBeInTheDocument();
    });

    it('should render loading state in main container', () => {
      mockUseAnswerSubmissionPage.mockReturnValue({
        formData: null,
        isLoading: true,
        error: null,
        successMessage: null,
        handleSelectEpisode: vi.fn(),
        handleSubmit: vi.fn(),
        handleReset: vi.fn(),
      });

      const { container } = render(
        <TestWrapper>
          <AnswerSubmissionPage gameId={mockGameId} />
        </TestWrapper>
      );

      const mainElement = container.querySelector('main');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toHaveClass('min-h-screen');
    });
  });

  describe('Error State', () => {
    it('should display error message when loading fails', () => {
      mockUseAnswerSubmissionPage.mockReturnValue({
        formData: null,
        isLoading: false,
        error: 'ゲームが見つかりませんでした',
        successMessage: null,
        handleSelectEpisode: vi.fn(),
        handleSubmit: vi.fn(),
        handleReset: vi.fn(),
      });

      render(
        <TestWrapper>
          <AnswerSubmissionPage gameId={mockGameId} />
        </TestWrapper>
      );

      expect(screen.getByText('ゲームが見つかりませんでした')).toBeInTheDocument();
    });

    it('should display game status error appropriately', () => {
      mockUseAnswerSubmissionPage.mockReturnValue({
        formData: null,
        isLoading: false,
        error: 'このゲームは既に締め切られました',
        successMessage: null,
        handleSelectEpisode: vi.fn(),
        handleSubmit: vi.fn(),
        handleReset: vi.fn(),
      });

      render(
        <TestWrapper>
          <AnswerSubmissionPage gameId={mockGameId} />
        </TestWrapper>
      );

      expect(screen.getByText('このゲームは既に締め切られました')).toBeInTheDocument();
    });

    it('should display participant limit error', () => {
      mockUseAnswerSubmissionPage.mockReturnValue({
        formData: null,
        isLoading: false,
        error: '参加人数が上限に達しました',
        successMessage: null,
        handleSelectEpisode: vi.fn(),
        handleSubmit: vi.fn(),
        handleReset: vi.fn(),
      });

      render(
        <TestWrapper>
          <AnswerSubmissionPage gameId={mockGameId} />
        </TestWrapper>
      );

      expect(screen.getByText('参加人数が上限に達しました')).toBeInTheDocument();
    });

    it('should have error role for accessibility', () => {
      mockUseAnswerSubmissionPage.mockReturnValue({
        formData: null,
        isLoading: false,
        error: 'エラーが発生しました',
        successMessage: null,
        handleSelectEpisode: vi.fn(),
        handleSubmit: vi.fn(),
        handleReset: vi.fn(),
      });

      render(
        <TestWrapper>
          <AnswerSubmissionPage gameId={mockGameId} />
        </TestWrapper>
      );

      const errorMessage = screen.getByText('エラーが発生しました');
      expect(errorMessage.closest('[role="alert"]')).toBeInTheDocument();
    });
  });

  describe('Form Rendering', () => {
    const mockFormData: GameAnswerFormData = {
      presenters: [
        {
          id: 'presenter-1',
          name: '山田太郎',
          episodes: [
            { id: 'episode-1-1', text: 'エピソード1' },
            { id: 'episode-1-2', text: 'エピソード2' },
          ],
        },
      ],
      selections: {},
      isComplete: false,
      isSubmitting: false,
    };

    it('should render GameAnswerForm when data is loaded', () => {
      mockUseAnswerSubmissionPage.mockReturnValue({
        formData: mockFormData,
        isLoading: false,
        error: null,
        successMessage: null,
        handleSelectEpisode: vi.fn(),
        handleSubmit: vi.fn(),
        handleReset: vi.fn(),
      });

      render(
        <TestWrapper>
          <AnswerSubmissionPage gameId={mockGameId} />
        </TestWrapper>
      );

      expect(screen.getByTestId('game-answer-form')).toBeInTheDocument();
    });

    it('should pass correct props to GameAnswerForm', () => {
      mockUseAnswerSubmissionPage.mockReturnValue({
        formData: mockFormData,
        isLoading: false,
        error: null,
        successMessage: null,
        handleSelectEpisode: vi.fn(),
        handleSubmit: vi.fn(),
        handleReset: vi.fn(),
      });

      render(
        <TestWrapper>
          <AnswerSubmissionPage gameId={mockGameId} />
        </TestWrapper>
      );

      const formElement = screen.getByTestId('game-answer-form');
      const props = JSON.parse(formElement.getAttribute('data-props') || '{}');

      expect(props.presenters).toEqual(mockFormData.presenters);
      expect(props.selections).toEqual(mockFormData.selections);
      expect(props.isComplete).toBe(false);
      expect(props.isSubmitting).toBe(false);
    });

    it('should display page header', () => {
      mockUseAnswerSubmissionPage.mockReturnValue({
        formData: mockFormData,
        isLoading: false,
        error: null,
        successMessage: null,
        handleSelectEpisode: vi.fn(),
        handleSubmit: vi.fn(),
        handleReset: vi.fn(),
      });

      render(
        <TestWrapper>
          <AnswerSubmissionPage gameId={mockGameId} />
        </TestWrapper>
      );

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });

  describe('Event Handlers', () => {
    const mockFormData: GameAnswerFormData = {
      presenters: [
        {
          id: 'presenter-1',
          name: '山田太郎',
          episodes: [
            { id: 'episode-1-1', text: 'エピソード1' },
            { id: 'episode-1-2', text: 'エピソード2' },
          ],
        },
      ],
      selections: {},
      isComplete: false,
      isSubmitting: false,
    };

    it('should call handleSubmit when form is submitted', async () => {
      const mockHandleSubmit = vi.fn();
      mockUseAnswerSubmissionPage.mockReturnValue({
        formData: mockFormData,
        isLoading: false,
        error: null,
        successMessage: null,
        handleSelectEpisode: vi.fn(),
        handleSubmit: mockHandleSubmit,
        handleReset: vi.fn(),
      });

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AnswerSubmissionPage gameId={mockGameId} />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
    });

    it('should call handleReset when reset button is clicked', async () => {
      const mockHandleReset = vi.fn();
      mockUseAnswerSubmissionPage.mockReturnValue({
        formData: mockFormData,
        isLoading: false,
        error: null,
        successMessage: null,
        handleSelectEpisode: vi.fn(),
        handleSubmit: vi.fn(),
        handleReset: mockHandleReset,
      });

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <AnswerSubmissionPage gameId={mockGameId} />
        </TestWrapper>
      );

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      expect(mockHandleReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    const mockFormData: GameAnswerFormData = {
      presenters: [
        {
          id: 'presenter-1',
          name: '山田太郎',
          episodes: [{ id: 'episode-1-1', text: 'エピソード1' }],
        },
      ],
      selections: {},
      isComplete: false,
      isSubmitting: false,
    };

    it('should use semantic main element', () => {
      mockUseAnswerSubmissionPage.mockReturnValue({
        formData: mockFormData,
        isLoading: false,
        error: null,
        successMessage: null,
        handleSelectEpisode: vi.fn(),
        handleSubmit: vi.fn(),
        handleReset: vi.fn(),
      });

      const { container } = render(
        <TestWrapper>
          <AnswerSubmissionPage gameId={mockGameId} />
        </TestWrapper>
      );

      expect(container.querySelector('main')).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      mockUseAnswerSubmissionPage.mockReturnValue({
        formData: mockFormData,
        isLoading: false,
        error: null,
        successMessage: null,
        handleSelectEpisode: vi.fn(),
        handleSubmit: vi.fn(),
        handleReset: vi.fn(),
      });

      render(
        <TestWrapper>
          <AnswerSubmissionPage gameId={mockGameId} />
        </TestWrapper>
      );

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    const mockFormData: GameAnswerFormData = {
      presenters: [
        {
          id: 'presenter-1',
          name: '山田太郎',
          episodes: [{ id: 'episode-1-1', text: 'エピソード1' }],
        },
      ],
      selections: {},
      isComplete: false,
      isSubmitting: false,
    };

    it('should apply correct styling classes to main container', () => {
      mockUseAnswerSubmissionPage.mockReturnValue({
        formData: mockFormData,
        isLoading: false,
        error: null,
        successMessage: null,
        handleSelectEpisode: vi.fn(),
        handleSubmit: vi.fn(),
        handleReset: vi.fn(),
      });

      const { container } = render(
        <TestWrapper>
          <AnswerSubmissionPage gameId={mockGameId} />
        </TestWrapper>
      );

      const mainElement = container.querySelector('main');
      expect(mainElement).toHaveClass('min-h-screen', 'bg-gray-50', 'py-8');
    });

    it('should use constrained width container for content', () => {
      mockUseAnswerSubmissionPage.mockReturnValue({
        formData: mockFormData,
        isLoading: false,
        error: null,
        successMessage: null,
        handleSelectEpisode: vi.fn(),
        handleSubmit: vi.fn(),
        handleReset: vi.fn(),
      });

      const { container } = render(
        <TestWrapper>
          <AnswerSubmissionPage gameId={mockGameId} />
        </TestWrapper>
      );

      const contentContainer = container.querySelector('.max-w-4xl');
      expect(contentContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty presenters list', () => {
      const emptyFormData: GameAnswerFormData = {
        presenters: [],
        selections: {},
        isComplete: false,
        isSubmitting: false,
      };

      mockUseAnswerSubmissionPage.mockReturnValue({
        formData: emptyFormData,
        isLoading: false,
        error: null,
        successMessage: null,
        handleSelectEpisode: vi.fn(),
        handleSubmit: vi.fn(),
        handleReset: vi.fn(),
      });

      render(
        <TestWrapper>
          <AnswerSubmissionPage gameId={mockGameId} />
        </TestWrapper>
      );

      expect(screen.getByTestId('game-answer-form')).toBeInTheDocument();
    });

    it('should handle null formData gracefully', () => {
      mockUseAnswerSubmissionPage.mockReturnValue({
        formData: null,
        isLoading: false,
        error: null,
        successMessage: null,
        handleSelectEpisode: vi.fn(),
        handleSubmit: vi.fn(),
        handleReset: vi.fn(),
      });

      const { container } = render(
        <TestWrapper>
          <AnswerSubmissionPage gameId={mockGameId} />
        </TestWrapper>
      );

      // Should render loading state when formData is null
      expect(container.querySelector('main')).toBeInTheDocument();
    });
  });
});
