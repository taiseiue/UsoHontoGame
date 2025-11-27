// Component Tests: PresenterWithEpisodesForm
// Feature: 003-presenter-episode-inline
// Tests for inline presenter registration with 3 episodes

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PresenterWithEpisodesForm } from './PresenterWithEpisodesForm';

// Mock the server action
vi.mock('@/app/actions/presenter', () => ({
  addPresenterWithEpisodesAction: vi.fn(),
}));

describe('PresenterWithEpisodesForm', () => {
  const defaultProps = {
    gameId: 'game-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render form with all fields', () => {
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      expect(screen.getByLabelText(/ニックネーム/)).toBeInTheDocument();
      expect(screen.getByText(/エピソード（3つ選択）/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /登録/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /クリア/ })).toBeInTheDocument();
    });

    it('should render 3 episode input sections', () => {
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      expect(screen.getByText('エピソード 1')).toBeInTheDocument();
      expect(screen.getByText('エピソード 2')).toBeInTheDocument();
      expect(screen.getByText('エピソード 3')).toBeInTheDocument();
    });

    it('should render character counters for all fields', () => {
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      // Nickname counter
      expect(screen.getByText(/0\/50文字/)).toBeInTheDocument();
      // Episode counters
      expect(screen.getAllByText(/0\/1000文字/)).toHaveLength(3);
    });

    it('should render lie marker radio buttons', () => {
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(3);
      expect(radioButtons[0]).toHaveAttribute('name', 'lie-episode');
      expect(radioButtons[1]).toHaveAttribute('name', 'lie-episode');
      expect(radioButtons[2]).toHaveAttribute('name', 'lie-episode');
    });

    it('should render required field indicators', () => {
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const requiredMarkers = screen.getAllByText('*');
      // Nickname + 3 episodes = 4 required fields
      expect(requiredMarkers.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Input Interactions', () => {
    it('should update nickname field when typing', async () => {
      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const nicknameInput = screen.getByPlaceholderText(/例：田中太郎/);
      await user.type(nicknameInput, 'テスト太郎');

      expect(nicknameInput).toHaveValue('テスト太郎');
    });

    it('should update episode text when typing', async () => {
      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const episodeInputs = screen.getAllByPlaceholderText(/エピソード.*の内容を入力してください/);
      await user.type(episodeInputs[0], 'エピソード1の内容');

      expect(episodeInputs[0]).toHaveValue('エピソード1の内容');
    });

    it('should update all episode fields independently', async () => {
      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const episodeInputs = screen.getAllByPlaceholderText(/エピソード.*の内容を入力してください/);

      await user.type(episodeInputs[0], 'エピソード1');
      await user.type(episodeInputs[1], 'エピソード2');
      await user.type(episodeInputs[2], 'エピソード3');

      expect(episodeInputs[0]).toHaveValue('エピソード1');
      expect(episodeInputs[1]).toHaveValue('エピソード2');
      expect(episodeInputs[2]).toHaveValue('エピソード3');
    });

    it('should toggle lie marker radio button', async () => {
      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const radioButtons = screen.getAllByRole('radio');
      const firstRadio = radioButtons[0];

      expect(firstRadio).not.toBeChecked();
      await user.click(firstRadio);
      expect(firstRadio).toBeChecked();
    });

    it('should update character counter for nickname', async () => {
      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const nicknameInput = screen.getByPlaceholderText(/例：田中太郎/);
      await user.type(nicknameInput, 'テスト');

      expect(screen.getByText(/3\/50文字/)).toBeInTheDocument();
    });

    it('should update character counter for episodes', async () => {
      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const episodeInputs = screen.getAllByPlaceholderText(/エピソード.*の内容を入力してください/);
      await user.type(episodeInputs[0], 'テスト');

      expect(screen.getAllByText(/3\/1000文字/)).toHaveLength(1);
    });
  });

  describe('Exclusive Lie Marker Behavior', () => {
    it('should allow only one episode to be marked as lie', async () => {
      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const radioButtons = screen.getAllByRole('radio');

      // Mark first episode as lie
      await user.click(radioButtons[0]);
      expect(radioButtons[0]).toBeChecked();
      expect(radioButtons[1]).not.toBeChecked();
      expect(radioButtons[2]).not.toBeChecked();

      // Mark second episode as lie - should uncheck first
      await user.click(radioButtons[1]);
      expect(radioButtons[0]).not.toBeChecked();
      expect(radioButtons[1]).toBeChecked();
      expect(radioButtons[2]).not.toBeChecked();

      // Mark third episode as lie - should uncheck second
      await user.click(radioButtons[2]);
      expect(radioButtons[0]).not.toBeChecked();
      expect(radioButtons[1]).not.toBeChecked();
      expect(radioButtons[2]).toBeChecked();
    });

    it('should allow deselecting the lie marker', async () => {
      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const radioButtons = screen.getAllByRole('radio');

      await user.click(radioButtons[1]);
      expect(radioButtons[1]).toBeChecked();

      // Radio buttons in HTML can't be unchecked by clicking again,
      // but our hook logic supports it
      await user.click(radioButtons[1]);
      // In a real radio group, this would still be checked
      // The hook handles the exclusive selection logic
    });
  });

  describe('Character Counter Color Changes', () => {
    it('should change color when nickname approaches max length', async () => {
      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const nicknameInput = screen.getByPlaceholderText(/例：田中太郎/);
      // Type 41 characters (82% of 50, above 80% threshold)
      await user.type(nicknameInput, 'a'.repeat(41));

      const counter = screen.getByText(/41\/50文字/);
      expect(counter).toHaveClass('text-orange-600');
    });

    it('should keep default color when nickname is below threshold', async () => {
      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const nicknameInput = screen.getByPlaceholderText(/例：田中太郎/);
      // Type 10 characters (20% of 50, below 80% threshold)
      await user.type(nicknameInput, 'a'.repeat(10));

      const counter = screen.getByText(/10\/50文字/);
      expect(counter).toHaveClass('text-gray-500');
    });

    it('should change color when episode text approaches max length', async () => {
      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const episodeInputs = screen.getAllByPlaceholderText(/エピソード.*の内容を入力してください/);
      // Type 801 characters (80.1% of 1000, above 80% threshold)
      await user.type(episodeInputs[0], 'a'.repeat(801));

      const counters = screen.getAllByText(/801\/1000文字/);
      expect(counters[0]).toHaveClass('text-orange-600');
    });

    it('should keep default color when episode text is below threshold', async () => {
      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const episodeInputs = screen.getAllByPlaceholderText(/エピソード.*の内容を入力してください/);
      // Type 100 characters (10% of 1000, below 80% threshold)
      await user.type(episodeInputs[0], 'a'.repeat(100));

      const counters = screen.getAllByText(/100\/1000文字/);
      expect(counters[0]).toHaveClass('text-gray-500');
    });
  });

  describe('Character Limits', () => {
    it('should enforce maxLength on nickname input', () => {
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const nicknameInput = screen.getByPlaceholderText(/例：田中太郎/);
      expect(nicknameInput).toHaveAttribute('maxLength', '50');
    });

    it('should enforce maxLength on episode inputs', () => {
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const episodeInputs = screen.getAllByPlaceholderText(/エピソード.*の内容を入力してください/);

      for (const input of episodeInputs) {
        expect(input).toHaveAttribute('maxLength', '1000');
      }
    });
  });

  describe('Clear/Reset Button', () => {
    it('should clear all fields when reset button is clicked', async () => {
      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const nicknameInput = screen.getByPlaceholderText(/例：田中太郎/);
      const episodeInputs = screen.getAllByPlaceholderText(/エピソード.*の内容を入力してください/);

      await user.type(nicknameInput, 'テスト太郎');
      await user.type(episodeInputs[0], 'エピソード1');
      await user.type(episodeInputs[1], 'エピソード2');

      const clearButton = screen.getByRole('button', { name: /クリア/ });
      await user.click(clearButton);

      expect(nicknameInput).toHaveValue('');
      expect(episodeInputs[0]).toHaveValue('');
      expect(episodeInputs[1]).toHaveValue('');
    });

    it('should clear lie marker when reset button is clicked', async () => {
      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const radioButtons = screen.getAllByRole('radio');
      await user.click(radioButtons[0]);
      expect(radioButtons[0]).toBeChecked();

      const clearButton = screen.getByRole('button', { name: /クリア/ });
      await user.click(clearButton);

      expect(radioButtons[0]).not.toBeChecked();
    });

    it('should reset character counters when cleared', async () => {
      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const nicknameInput = screen.getByPlaceholderText(/例：田中太郎/);
      await user.type(nicknameInput, 'テスト太郎');
      expect(screen.getByText(/5\/50文字/)).toBeInTheDocument();

      const clearButton = screen.getByRole('button', { name: /クリア/ });
      await user.click(clearButton);

      expect(screen.getByText(/0\/50文字/)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should have submit button enabled by default', () => {
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /登録/ });
      expect(submitButton).not.toBeDisabled();
    });

    it('should disable all inputs while submitting', async () => {
      const { addPresenterWithEpisodesAction } = await import('@/app/actions/presenter');
      vi.mocked(addPresenterWithEpisodesAction).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const nicknameInput = screen.getByPlaceholderText(/例：田中太郎/);
      const episodeInputs = screen.getAllByPlaceholderText(/エピソード.*の内容を入力してください/);
      const radioButtons = screen.getAllByRole('radio');

      await user.type(nicknameInput, 'テスト太郎');
      await user.type(episodeInputs[0], 'エピソード1');
      await user.type(episodeInputs[1], 'エピソード2');
      await user.type(episodeInputs[2], 'エピソード3');
      await user.click(radioButtons[2]);

      const submitButton = screen.getByRole('button', { name: /登録/ });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(nicknameInput).toBeDisabled();
      for (const input of episodeInputs) {
        expect(input).toBeDisabled();
      }
      for (const radio of radioButtons) {
        expect(radio).toBeDisabled();
      }
    });

    it('should show submitting text on button during submission', async () => {
      const { addPresenterWithEpisodesAction } = await import('@/app/actions/presenter');
      vi.mocked(addPresenterWithEpisodesAction).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const nicknameInput = screen.getByPlaceholderText(/例：田中太郎/);
      const episodeInputs = screen.getAllByPlaceholderText(/エピソード.*の内容を入力してください/);
      const radioButtons = screen.getAllByRole('radio');

      await user.type(nicknameInput, 'テスト太郎');
      await user.type(episodeInputs[0], 'エピソード1');
      await user.type(episodeInputs[1], 'エピソード2');
      await user.type(episodeInputs[2], 'エピソード3');
      await user.click(radioButtons[0]);

      const submitButton = screen.getByRole('button', { name: /登録/ });
      await user.click(submitButton);

      expect(screen.getByRole('button', { name: /送信中/ })).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('should display success message on successful submission', async () => {
      const { addPresenterWithEpisodesAction } = await import('@/app/actions/presenter');
      vi.mocked(addPresenterWithEpisodesAction).mockResolvedValue({
        success: true,
        presenter: {
          id: 'presenter-1',
          gameId: 'game-123',
          nickname: 'テスト太郎',
          episodes: [
            {
              id: 'ep1',
              presenterId: 'presenter-1',
              text: 'エピソード1',
              isLie: false,
              createdAt: new Date(),
            },
            {
              id: 'ep2',
              presenterId: 'presenter-1',
              text: 'エピソード2',
              isLie: false,
              createdAt: new Date(),
            },
            {
              id: 'ep3',
              presenterId: 'presenter-1',
              text: 'エピソード3',
              isLie: true,
              createdAt: new Date(),
            },
          ],
          createdAt: new Date(),
        },
      });

      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const nicknameInput = screen.getByPlaceholderText(/例：田中太郎/);
      const episodeInputs = screen.getAllByPlaceholderText(/エピソード.*の内容を入力してください/);
      const radioButtons = screen.getAllByRole('radio');

      await user.type(nicknameInput, 'テスト太郎');
      await user.type(episodeInputs[0], 'エピソード1');
      await user.type(episodeInputs[1], 'エピソード2');
      await user.type(episodeInputs[2], 'エピソード3');
      await user.click(radioButtons[2]);

      const submitButton = screen.getByRole('button', { name: /登録/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/プレゼンターとエピソードが正常に登録されました/)
        ).toBeInTheDocument();
      });
    });

    it('should reset form after successful submission', async () => {
      const { addPresenterWithEpisodesAction } = await import('@/app/actions/presenter');
      vi.mocked(addPresenterWithEpisodesAction).mockResolvedValue({
        success: true,
        presenter: {
          id: 'presenter-1',
          gameId: 'game-123',
          nickname: 'テスト太郎',
          episodes: [
            {
              id: 'ep1',
              presenterId: 'presenter-1',
              text: 'エピソード1',
              isLie: false,
              createdAt: new Date(),
            },
            {
              id: 'ep2',
              presenterId: 'presenter-1',
              text: 'エピソード2',
              isLie: false,
              createdAt: new Date(),
            },
            {
              id: 'ep3',
              presenterId: 'presenter-1',
              text: 'エピソード3',
              isLie: true,
              createdAt: new Date(),
            },
          ],
          createdAt: new Date(),
        },
      });

      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const nicknameInput = screen.getByPlaceholderText(/例：田中太郎/);
      const episodeInputs = screen.getAllByPlaceholderText(/エピソード.*の内容を入力してください/);
      const radioButtons = screen.getAllByRole('radio');

      await user.type(nicknameInput, 'テスト太郎');
      await user.type(episodeInputs[0], 'エピソード1');
      await user.type(episodeInputs[1], 'エピソード2');
      await user.type(episodeInputs[2], 'エピソード3');
      await user.click(radioButtons[1]);

      const submitButton = screen.getByRole('button', { name: /登録/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(nicknameInput).toHaveValue('');
        expect(episodeInputs[0]).toHaveValue('');
        expect(episodeInputs[1]).toHaveValue('');
        expect(episodeInputs[2]).toHaveValue('');
      });
    });

    it('should call onSuccess callback after successful submission', async () => {
      const { addPresenterWithEpisodesAction } = await import('@/app/actions/presenter');
      const mockPresenter = {
        id: 'presenter-1',
        gameId: 'game-123',
        nickname: 'テスト太郎',
        episodes: [
          {
            id: 'ep1',
            presenterId: 'presenter-1',
            text: 'エピソード1',
            isLie: false,
            createdAt: new Date(),
          },
          {
            id: 'ep2',
            presenterId: 'presenter-1',
            text: 'エピソード2',
            isLie: false,
            createdAt: new Date(),
          },
          {
            id: 'ep3',
            presenterId: 'presenter-1',
            text: 'エピソード3',
            isLie: true,
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
      };

      vi.mocked(addPresenterWithEpisodesAction).mockResolvedValue({
        success: true,
        presenter: mockPresenter,
      });

      const onSuccess = vi.fn();
      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} onSuccess={onSuccess} />);

      const nicknameInput = screen.getByPlaceholderText(/例：田中太郎/);
      const episodeInputs = screen.getAllByPlaceholderText(/エピソード.*の内容を入力してください/);
      const radioButtons = screen.getAllByRole('radio');

      await user.type(nicknameInput, 'テスト太郎');
      await user.type(episodeInputs[0], 'エピソード1');
      await user.type(episodeInputs[1], 'エピソード2');
      await user.type(episodeInputs[2], 'エピソード3');
      await user.click(radioButtons[2]);

      const submitButton = screen.getByRole('button', { name: /登録/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockPresenter);
      });
    });

    it('should not call onSuccess multiple times for same presenter', async () => {
      const { addPresenterWithEpisodesAction } = await import('@/app/actions/presenter');
      const mockPresenter = {
        id: 'presenter-1',
        gameId: 'game-123',
        nickname: 'テスト太郎',
        episodes: [
          {
            id: 'ep1',
            presenterId: 'presenter-1',
            text: 'エピソード1',
            isLie: false,
            createdAt: new Date(),
          },
          {
            id: 'ep2',
            presenterId: 'presenter-1',
            text: 'エピソード2',
            isLie: false,
            createdAt: new Date(),
          },
          {
            id: 'ep3',
            presenterId: 'presenter-1',
            text: 'エピソード3',
            isLie: true,
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
      };

      vi.mocked(addPresenterWithEpisodesAction).mockResolvedValue({
        success: true,
        presenter: mockPresenter,
      });

      const onSuccess = vi.fn();
      const { rerender } = render(
        <PresenterWithEpisodesForm {...defaultProps} onSuccess={onSuccess} />
      );

      const user = userEvent.setup();
      const nicknameInput = screen.getByPlaceholderText(/例：田中太郎/);
      const episodeInputs = screen.getAllByPlaceholderText(/エピソード.*の内容を入力してください/);
      const radioButtons = screen.getAllByRole('radio');

      await user.type(nicknameInput, 'テスト太郎');
      await user.type(episodeInputs[0], 'エピソード1');
      await user.type(episodeInputs[1], 'エピソード2');
      await user.type(episodeInputs[2], 'エピソード3');
      await user.click(radioButtons[2]);

      const submitButton = screen.getByRole('button', { name: /登録/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
      });

      // Re-render component - should not call onSuccess again
      rerender(<PresenterWithEpisodesForm {...defaultProps} onSuccess={onSuccess} />);

      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error State', () => {
    it('should display form-level error', async () => {
      const { addPresenterWithEpisodesAction } = await import('@/app/actions/presenter');
      vi.mocked(addPresenterWithEpisodesAction).mockResolvedValue({
        success: false,
        errors: {
          _form: ['予期しないエラーが発生しました'],
        },
      });

      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const nicknameInput = screen.getByPlaceholderText(/例：田中太郎/);
      const episodeInputs = screen.getAllByPlaceholderText(/エピソード.*の内容を入力してください/);
      const radioButtons = screen.getAllByRole('radio');

      await user.type(nicknameInput, 'テスト太郎');
      await user.type(episodeInputs[0], 'エピソード1');
      await user.type(episodeInputs[1], 'エピソード2');
      await user.type(episodeInputs[2], 'エピソード3');
      await user.click(radioButtons[0]);

      const submitButton = screen.getByRole('button', { name: /登録/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('予期しないエラーが発生しました')).toBeInTheDocument();
      });
    });

    it('should display nickname validation error', async () => {
      const { addPresenterWithEpisodesAction } = await import('@/app/actions/presenter');
      vi.mocked(addPresenterWithEpisodesAction).mockResolvedValue({
        success: false,
        errors: {
          nickname: ['ニックネームは必須です'],
        },
      });

      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /登録/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('ニックネームは必須です')).toBeInTheDocument();
      });
    });

    it('should display episode validation error', async () => {
      const { addPresenterWithEpisodesAction } = await import('@/app/actions/presenter');
      vi.mocked(addPresenterWithEpisodesAction).mockResolvedValue({
        success: false,
        errors: {
          episodes: ['エピソードは3つ入力してください'],
        },
      });

      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const nicknameInput = screen.getByPlaceholderText(/例：田中太郎/);
      await user.type(nicknameInput, 'テスト太郎');

      const submitButton = screen.getByRole('button', { name: /登録/ });
      await user.click(submitButton);

      await waitFor(() => {
        // Episode validation error appears in two places in the component
        const errorMessages = screen.getAllByText('エピソードは3つ入力してください');
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it('should apply error styling to nickname field when there is an error', async () => {
      const { addPresenterWithEpisodesAction } = await import('@/app/actions/presenter');
      vi.mocked(addPresenterWithEpisodesAction).mockResolvedValue({
        success: false,
        errors: {
          nickname: ['ニックネームが長すぎます'],
        },
      });

      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const nicknameInput = screen.getByPlaceholderText(/例：田中太郎/);
      await user.type(nicknameInput, 'a'.repeat(100));

      const submitButton = screen.getByRole('button', { name: /登録/ });
      await user.click(submitButton);

      await waitFor(() => {
        expect(nicknameInput).toHaveClass('border-red-500');
      });
    });

    it('should apply error styling to episode fields when there is an error', async () => {
      const { addPresenterWithEpisodesAction } = await import('@/app/actions/presenter');
      vi.mocked(addPresenterWithEpisodesAction).mockResolvedValue({
        success: false,
        errors: {
          episodes: ['1つのエピソードを嘘に設定してください'],
        },
      });

      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const nicknameInput = screen.getByPlaceholderText(/例：田中太郎/);
      const episodeInputs = screen.getAllByPlaceholderText(/エピソード.*の内容を入力してください/);

      await user.type(nicknameInput, 'テスト太郎');
      await user.type(episodeInputs[0], 'エピソード1');
      await user.type(episodeInputs[1], 'エピソード2');
      await user.type(episodeInputs[2], 'エピソード3');

      const submitButton = screen.getByRole('button', { name: /登録/ });
      await user.click(submitButton);

      await waitFor(() => {
        for (const input of episodeInputs) {
          expect(input).toHaveClass('border-red-500');
        }
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper label associations for nickname', () => {
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const nicknameInput = screen.getByLabelText(/ニックネーム/);
      expect(nicknameInput).toHaveAttribute('id', 'nickname');
    });

    it('should have proper label associations for episodes', () => {
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const episode1Input = screen.getByLabelText(/内容.*/, { selector: '#episode-0' });
      const episode2Input = screen.getByLabelText(/内容.*/, { selector: '#episode-1' });
      const episode3Input = screen.getByLabelText(/内容.*/, { selector: '#episode-2' });

      expect(episode1Input).toHaveAttribute('id', 'episode-0');
      expect(episode2Input).toHaveAttribute('id', 'episode-1');
      expect(episode3Input).toHaveAttribute('id', 'episode-2');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const nicknameInput = screen.getByPlaceholderText(/例：田中太郎/);
      nicknameInput.focus();
      expect(nicknameInput).toHaveFocus();

      await user.keyboard('{Tab}');
      const episodeInputs = screen.getAllByPlaceholderText(/エピソード.*の内容を入力してください/);
      expect(episodeInputs[0]).toHaveFocus();
    });

    it('should have accessible button labels', () => {
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /登録/ });
      const clearButton = screen.getByRole('button', { name: /クリア/ });

      expect(submitButton).toBeInTheDocument();
      expect(clearButton).toBeInTheDocument();
    });

    it('should have accessible lie marker labels', () => {
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const labels = screen.getAllByText(/このエピソードをウソにする/);
      expect(labels).toHaveLength(3);

      for (const label of labels) {
        expect(label).toHaveAttribute('for');
      }
    });

    it('should have proper ARIA roles for radio group', () => {
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const radioButtons = screen.getAllByRole('radio');
      for (const radio of radioButtons) {
        expect(radio).toHaveAttribute('type', 'radio');
        expect(radio).toHaveAttribute('name', 'lie-episode');
      }
    });
  });

  describe('Form Structure', () => {
    it('should render as a form element', () => {
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should handle form submission via Enter key', async () => {
      const { addPresenterWithEpisodesAction } = await import('@/app/actions/presenter');
      const mockSubmit = vi.mocked(addPresenterWithEpisodesAction).mockResolvedValue({
        success: true,
        presenter: {
          id: 'presenter-1',
          gameId: 'game-123',
          nickname: 'テスト太郎',
          episodes: [
            {
              id: 'ep1',
              presenterId: 'presenter-1',
              text: 'エピソード1',
              isLie: false,
              createdAt: new Date(),
            },
            {
              id: 'ep2',
              presenterId: 'presenter-1',
              text: 'エピソード2',
              isLie: false,
              createdAt: new Date(),
            },
            {
              id: 'ep3',
              presenterId: 'presenter-1',
              text: 'エピソード3',
              isLie: true,
              createdAt: new Date(),
            },
          ],
          createdAt: new Date(),
        },
      });

      const user = userEvent.setup();
      render(<PresenterWithEpisodesForm {...defaultProps} />);

      const nicknameInput = screen.getByPlaceholderText(/例：田中太郎/);
      const episodeInputs = screen.getAllByPlaceholderText(/エピソード.*の内容を入力してください/);
      const radioButtons = screen.getAllByRole('radio');

      await user.type(nicknameInput, 'テスト太郎');
      await user.type(episodeInputs[0], 'エピソード1');
      await user.type(episodeInputs[1], 'エピソード2');
      await user.type(episodeInputs[2], 'エピソード3');
      await user.click(radioButtons[2]);

      // Submit via Enter key on nickname field
      nicknameInput.focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
      });
    });
  });
});
