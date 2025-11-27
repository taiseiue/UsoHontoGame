// Component Tests: GameAnswerForm
// Test-Driven Development: Write FAILING tests first
// Task: T037

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibilityProvider } from '@/components/ui/AccessibilityProvider';
import { GameAnswerForm } from './index';

// Test wrapper with AccessibilityProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AccessibilityProvider>{children}</AccessibilityProvider>
);

describe('GameAnswerForm', () => {
  const mockPresenters = [
    {
      id: 'presenter-1',
      name: '山田太郎',
      episodes: [
        { id: 'episode-1-1', text: 'エピソード1: 初めての成功' },
        { id: 'episode-1-2', text: 'エピソード2: 大きな失敗' },
      ],
    },
    {
      id: 'presenter-2',
      name: '佐藤花子',
      episodes: [
        { id: 'episode-2-1', text: 'エピソード1: 転職の決断' },
        { id: 'episode-2-2', text: 'エピソード2: 新しい挑戦' },
      ],
    },
  ];

  const mockOnSubmit = vi.fn();
  const mockOnReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render the form with submit button', () => {
      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{}}
            isComplete={false}
            isSubmitting={false}
            error={null}
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /回答を送信/i })).toBeInTheDocument();
    });

    it('should render PresenterEpisodeList component', () => {
      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{}}
            isComplete={false}
            isSubmitting={false}
            error={null}
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      expect(screen.getByText('山田太郎')).toBeInTheDocument();
      expect(screen.getByText('佐藤花子')).toBeInTheDocument();
    });

    it('should render form as HTML form element', () => {
      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{}}
            isComplete={false}
            isSubmitting={false}
            error={null}
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
    });

    it('should display game title or heading', () => {
      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{}}
            isComplete={false}
            isSubmitting={false}
            error={null}
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });
  });

  describe('Form State Management', () => {
    it('should disable submit button when form is incomplete', () => {
      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{ 'presenter-1': 'episode-1-1' }}
            isComplete={false}
            isSubmitting={false}
            error={null}
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /回答を送信/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when form is complete', () => {
      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{
              'presenter-1': 'episode-1-1',
              'presenter-2': 'episode-2-1',
            }}
            isComplete={true}
            isSubmitting={false}
            error={null}
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /回答を送信/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('should display loading state when submitting', () => {
      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{
              'presenter-1': 'episode-1-1',
              'presenter-2': 'episode-2-1',
            }}
            isComplete={true}
            isSubmitting={true}
            error={null}
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      expect(screen.getByText(/送信中/i)).toBeInTheDocument();
    });

    it('should disable submit button when submitting', () => {
      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{
              'presenter-1': 'episode-1-1',
              'presenter-2': 'episode-2-1',
            }}
            isComplete={true}
            isSubmitting={true}
            error={null}
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /送信中/i });
      expect(submitButton).toBeDisabled();
    });

    it('should disable episode selection when submitting', () => {
      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{}}
            isComplete={false}
            isSubmitting={true}
            error={null}
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      const episodeButtons = screen.getAllByRole('button', {
        name: /エピソード/i,
      });
      for (const button of episodeButtons) {
        expect(button).toBeDisabled();
      }
    });
  });

  describe('Form Validation', () => {
    it('should show validation message when incomplete', () => {
      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{ 'presenter-1': 'episode-1-1' }}
            isComplete={false}
            isSubmitting={false}
            error={null}
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      expect(screen.getByText(/すべての出題者のエピソードを選択してください/i)).toBeInTheDocument();
    });

    it('should not show validation message when complete', () => {
      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{
              'presenter-1': 'episode-1-1',
              'presenter-2': 'episode-2-1',
            }}
            isComplete={true}
            isSubmitting={false}
            error={null}
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      expect(
        screen.queryByText(/すべての出題者のエピソードを選択してください/i)
      ).not.toBeInTheDocument();
    });

    it('should display completion indicator', () => {
      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{
              'presenter-1': 'episode-1-1',
              'presenter-2': 'episode-2-1',
            }}
            isComplete={true}
            isSubmitting={false}
            error={null}
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      expect(screen.getByText(/回答準備完了/i)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit when form is submitted', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{
              'presenter-1': 'episode-1-1',
              'presenter-2': 'episode-2-1',
            }}
            isComplete={true}
            isSubmitting={false}
            error={null}
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /回答を送信/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should prevent default form submission', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn((e) => e.preventDefault());

      render(
        <TestWrapper>
          <form onSubmit={handleSubmit}>
            <GameAnswerForm
              presenters={mockPresenters}
              selections={{
                'presenter-1': 'episode-1-1',
                'presenter-2': 'episode-2-1',
              }}
              isComplete={true}
              isSubmitting={false}
              error={null}
              successMessage={null}
              onSelectEpisode={vi.fn()}
              onSubmit={mockOnSubmit}
              onReset={mockOnReset}
            />
          </form>
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /回答を送信/i });
      await user.click(submitButton);

      expect(handleSubmit).toHaveBeenCalled();
    });

    it('should not submit when form is incomplete', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{ 'presenter-1': 'episode-1-1' }}
            isComplete={false}
            isSubmitting={false}
            error={null}
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /回答を送信/i });
      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should not submit when already submitting', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{
              'presenter-1': 'episode-1-1',
              'presenter-2': 'episode-2-1',
            }}
            isComplete={true}
            isSubmitting={true}
            error={null}
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /送信中/i });
      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when error prop is set', () => {
      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{}}
            isComplete={false}
            isSubmitting={false}
            error="ゲームが見つかりません"
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      expect(screen.getByText('ゲームが見つかりません')).toBeInTheDocument();
    });

    it('should style error message appropriately', () => {
      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{}}
            isComplete={false}
            isSubmitting={false}
            error="エラーメッセージ"
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      const errorMessage = screen.getByText('エラーメッセージ');
      expect(errorMessage).toHaveClass('text-red-600');
    });

    it('should have error role for screen readers', () => {
      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{}}
            isComplete={false}
            isSubmitting={false}
            error="エラーが発生しました"
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      const errorMessage = screen.getByText('エラーが発生しました');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage.closest('[role="alert"]')).toBeInTheDocument();
    });
  });

  describe('Success Handling', () => {
    it('should display success message when successMessage prop is set', () => {
      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{}}
            isComplete={false}
            isSubmitting={false}
            error={null}
            successMessage="回答を送信しました"
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      expect(screen.getByText('回答を送信しました')).toBeInTheDocument();
    });

    it('should style success message appropriately', () => {
      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{}}
            isComplete={false}
            isSubmitting={false}
            error={null}
            successMessage="成功しました"
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      const successMessage = screen.getByText('成功しました');
      expect(successMessage).toHaveClass('text-green-600');
    });

    it('should have success role for screen readers', () => {
      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{}}
            isComplete={false}
            isSubmitting={false}
            error={null}
            successMessage="送信完了"
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      const successMessage = screen.getByText('送信完了');
      expect(successMessage).toBeInTheDocument();
      expect(successMessage.closest('output')).toBeInTheDocument();
    });
  });

  describe('Reset Functionality', () => {
    it('should render reset button', () => {
      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{ 'presenter-1': 'episode-1-1' }}
            isComplete={false}
            isSubmitting={false}
            error={null}
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /リセット/i })).toBeInTheDocument();
    });

    it('should call onReset when reset button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{ 'presenter-1': 'episode-1-1' }}
            isComplete={false}
            isSubmitting={false}
            error={null}
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      const resetButton = screen.getByRole('button', { name: /リセット/i });
      await user.click(resetButton);

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it('should disable reset button when no selections', () => {
      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{}}
            isComplete={false}
            isSubmitting={false}
            error={null}
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      const resetButton = screen.getByRole('button', { name: /リセット/i });
      expect(resetButton).toBeDisabled();
    });

    it('should disable reset button when submitting', () => {
      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{ 'presenter-1': 'episode-1-1' }}
            isComplete={false}
            isSubmitting={true}
            error={null}
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      const resetButton = screen.getByRole('button', { name: /リセット/i });
      expect(resetButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and structure', () => {
      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{}}
            isComplete={false}
            isSubmitting={false}
            error={null}
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      const form = screen.getByRole('form');
      expect(form).toHaveAccessibleName();
    });

    it('should announce form state changes to screen readers', async () => {
      const { rerender } = render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{ 'presenter-1': 'episode-1-1' }}
            isComplete={false}
            isSubmitting={false}
            error={null}
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      rerender(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{
              'presenter-1': 'episode-1-1',
              'presenter-2': 'episode-2-1',
            }}
            isComplete={true}
            isSubmitting={false}
            error={null}
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/回答準備完了/i)).toBeInTheDocument();
      });
    });

    it('should provide keyboard navigation for all interactive elements', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <GameAnswerForm
            presenters={mockPresenters}
            selections={{}}
            isComplete={false}
            isSubmitting={false}
            error={null}
            successMessage={null}
            onSelectEpisode={vi.fn()}
            onSubmit={mockOnSubmit}
            onReset={mockOnReset}
          />
        </TestWrapper>
      );

      // Tab through form elements
      await user.tab();
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveFocus();
    });
  });
});
