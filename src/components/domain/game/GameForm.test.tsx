import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { GameForm } from './GameForm';

// Mock the useGameForm hook
vi.mock('@/hooks/useGameForm', () => ({
  useGameForm: vi.fn(),
}));

import { useGameForm } from '@/hooks/useGameForm';

const mockUseGameForm = useGameForm as Mock;

describe('GameForm', () => {
  const mockHandleSubmit = vi.fn((e) => e.preventDefault());

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    mockUseGameForm.mockReturnValue({
      handleSubmit: mockHandleSubmit,
      isSubmitting: false,
      errors: {},
      isSuccess: false,
    });
  });

  describe('create mode', () => {
    it('should render create form with all fields', () => {
      render(<GameForm mode="create" />);

      // Title
      expect(screen.getByText('新しいゲームを作成')).toBeInTheDocument();

      // Game name field
      expect(screen.getByLabelText(/ゲーム名/)).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('未入力の場合はゲームIDが表示されます')
      ).toBeInTheDocument();

      // Player limit field
      const playerLimitInput = screen.getByLabelText(/プレイヤー数上限/);
      expect(playerLimitInput).toBeInTheDocument();
      expect(playerLimitInput).toHaveAttribute('type', 'number');
      expect(playerLimitInput).toHaveAttribute('min', '1');
      expect(playerLimitInput).toHaveAttribute('max', '100');
      expect(playerLimitInput).toHaveAttribute('required');

      // Submit button
      expect(screen.getByRole('button', { name: 'ゲームを作成' })).toBeInTheDocument();

      // Cancel link
      expect(screen.getByRole('link', { name: 'キャンセル' })).toHaveAttribute('href', '/top');

      // Help text
      expect(
        screen.getByText(/作成されたゲームは「準備中」ステータスで開始されます/)
      ).toBeInTheDocument();
    });

    it('should use default player limit of 10', () => {
      render(<GameForm mode="create" />);

      const playerLimitInput = screen.getByLabelText(/プレイヤー数上限/) as HTMLInputElement;
      expect(playerLimitInput.defaultValue).toBe('10');
    });

    it('should not show gameId hidden field', () => {
      render(<GameForm mode="create" />);

      const hiddenInputs = document.querySelectorAll('input[type="hidden"]');
      expect(hiddenInputs.length).toBe(0);
    });

    it('should call handleSubmit when form is submitted', async () => {
      const user = userEvent.setup();
      render(<GameForm mode="create" />);

      const submitButton = screen.getByRole('button', { name: 'ゲームを作成' });
      await user.click(submitButton);

      expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('edit mode', () => {
    it('should render edit form without title and help text', () => {
      render(<GameForm mode="edit" gameId="game-123" />);

      // Should not show create title
      expect(screen.queryByText('新しいゲームを作成')).not.toBeInTheDocument();

      // Should not show help text
      expect(
        screen.queryByText(/作成されたゲームは「準備中」ステータスで開始されます/)
      ).not.toBeInTheDocument();

      // Should show form fields
      expect(screen.getByLabelText(/ゲーム名/)).toBeInTheDocument();
      expect(screen.getByLabelText(/プレイヤー数上限/)).toBeInTheDocument();
    });

    it('should include hidden gameId field', () => {
      render(<GameForm mode="edit" gameId="game-123" />);

      const hiddenInput = document.querySelector('input[type="hidden"][name="gameId"]');
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveAttribute('value', 'game-123');
    });

    it('should use initialPlayerLimit prop for default value', () => {
      render(<GameForm mode="edit" gameId="game-123" initialPlayerLimit={25} />);

      const playerLimitInput = screen.getByLabelText(/プレイヤー数上限/) as HTMLInputElement;
      expect(playerLimitInput.defaultValue).toBe('25');
    });

    it('should set minimum player limit based on currentPlayers', () => {
      render(<GameForm mode="edit" gameId="game-123" currentPlayers={5} />);

      const playerLimitInput = screen.getByLabelText(/プレイヤー数上限/);
      expect(playerLimitInput).toHaveAttribute('min', '5');
    });

    it('should show hint text when currentPlayers > 0', () => {
      render(<GameForm mode="edit" gameId="game-123" currentPlayers={7} />);

      expect(
        screen.getByText(/現在7人が参加しているため、7人以上の値を設定してください/)
      ).toBeInTheDocument();
    });

    it('should not show hint text when currentPlayers = 0', () => {
      render(<GameForm mode="edit" gameId="game-123" currentPlayers={0} />);

      expect(screen.queryByText(/現在.*人が参加しているため/)).not.toBeInTheDocument();
    });

    it('should show update button text', () => {
      render(<GameForm mode="edit" gameId="game-123" />);

      expect(screen.getByRole('button', { name: '設定を更新' })).toBeInTheDocument();
    });

    it('should have cancel link to game detail page', () => {
      render(<GameForm mode="edit" gameId="game-123" />);

      expect(screen.getByRole('link', { name: 'キャンセル' })).toHaveAttribute(
        'href',
        '/games/game-123'
      );
    });
  });

  describe('validation errors', () => {
    it('should display name field error', () => {
      mockUseGameForm.mockReturnValue({
        handleSubmit: mockHandleSubmit,
        isSubmitting: false,
        errors: { name: ['名前が長すぎます'] },
        isSuccess: false,
      });

      render(<GameForm mode="create" />);

      expect(screen.getByText('名前が長すぎます')).toBeInTheDocument();
      expect(screen.getByText('名前が長すぎます')).toHaveAttribute('role', 'alert');

      const nameInput = screen.getByLabelText(/ゲーム名/);
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
    });

    it('should display playerLimit field error', () => {
      mockUseGameForm.mockReturnValue({
        handleSubmit: mockHandleSubmit,
        isSubmitting: false,
        errors: { playerLimit: ['プレイヤー数は1以上100以下でなければなりません'] },
        isSuccess: false,
      });

      render(<GameForm mode="create" />);

      expect(
        screen.getByText('プレイヤー数は1以上100以下でなければなりません')
      ).toBeInTheDocument();

      const playerLimitInput = screen.getByLabelText(/プレイヤー数上限/);
      expect(playerLimitInput).toHaveAttribute('aria-invalid', 'true');
      expect(playerLimitInput).toHaveAttribute('aria-describedby', 'playerLimit-error');
    });

    it('should display form-level error', () => {
      mockUseGameForm.mockReturnValue({
        handleSubmit: mockHandleSubmit,
        isSubmitting: false,
        errors: { _form: ['予期しないエラーが発生しました'] },
        isSuccess: false,
      });

      render(<GameForm mode="create" />);

      const errorMessage = screen.getByText('予期しないエラーが発生しました');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage.closest('div')).toHaveAttribute('role', 'alert');
    });

    it('should not set aria-invalid when no errors', () => {
      render(<GameForm mode="create" />);

      const nameInput = screen.getByLabelText(/ゲーム名/);
      const playerLimitInput = screen.getByLabelText(/プレイヤー数上限/);

      expect(nameInput).toHaveAttribute('aria-invalid', 'false');
      expect(playerLimitInput).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('loading states', () => {
    it('should disable inputs when submitting', () => {
      mockUseGameForm.mockReturnValue({
        handleSubmit: mockHandleSubmit,
        isSubmitting: true,
        errors: {},
        isSuccess: false,
      });

      render(<GameForm mode="create" />);

      expect(screen.getByLabelText(/ゲーム名/)).toBeDisabled();
      expect(screen.getByLabelText(/プレイヤー数上限/)).toBeDisabled();
      expect(screen.getByRole('button', { name: '作成中...' })).toBeDisabled();
    });

    it('should show creating text in create mode when submitting', () => {
      mockUseGameForm.mockReturnValue({
        handleSubmit: mockHandleSubmit,
        isSubmitting: true,
        errors: {},
        isSuccess: false,
      });

      render(<GameForm mode="create" />);

      expect(screen.getByRole('button', { name: '作成中...' })).toBeInTheDocument();
    });

    it('should show updating text in edit mode when submitting', () => {
      mockUseGameForm.mockReturnValue({
        handleSubmit: mockHandleSubmit,
        isSubmitting: true,
        errors: {},
        isSuccess: false,
      });

      render(<GameForm mode="edit" gameId="game-123" />);

      expect(screen.getByRole('button', { name: '更新中...' })).toBeInTheDocument();
    });

    it('should disable inputs when success', () => {
      mockUseGameForm.mockReturnValue({
        handleSubmit: mockHandleSubmit,
        isSubmitting: false,
        errors: {},
        isSuccess: true,
      });

      render(<GameForm mode="create" />);

      expect(screen.getByLabelText(/ゲーム名/)).toBeDisabled();
      expect(screen.getByLabelText(/プレイヤー数上限/)).toBeDisabled();
      expect(screen.getByRole('button', { name: 'ゲームを作成' })).toBeDisabled();
    });
  });

  describe('success states', () => {
    it('should show success message in create mode', () => {
      mockUseGameForm.mockReturnValue({
        handleSubmit: mockHandleSubmit,
        isSubmitting: false,
        errors: {},
        isSuccess: true,
      });

      render(<GameForm mode="create" />);

      const successMessage = screen.getByText(
        'ゲームを作成しました！ゲーム一覧にリダイレクトしています...'
      );
      expect(successMessage).toBeInTheDocument();
      expect(successMessage.closest('div')).toHaveAttribute('role', 'alert');
    });

    it('should show success message in edit mode', () => {
      mockUseGameForm.mockReturnValue({
        handleSubmit: mockHandleSubmit,
        isSubmitting: false,
        errors: {},
        isSuccess: true,
      });

      render(<GameForm mode="edit" gameId="game-123" />);

      const successMessage = screen.getByText('ゲーム設定を更新しました！');
      expect(successMessage).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper form structure', () => {
      render(<GameForm mode="create" />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should associate labels with inputs', () => {
      render(<GameForm mode="create" />);

      const nameLabel = screen.getByLabelText(/ゲーム名/);
      const playerLimitLabel = screen.getByLabelText(/プレイヤー数上限/);

      expect(nameLabel).toHaveAttribute('id', 'name');
      expect(playerLimitLabel).toHaveAttribute('id', 'playerLimit');
    });

    it('should have descriptive helper text', () => {
      render(<GameForm mode="create" />);

      expect(
        screen.getByText('ゲームを識別しやすい名前を付けることができます')
      ).toBeInTheDocument();
    });
  });

  describe('input constraints', () => {
    it('should enforce maxLength on game name', () => {
      render(<GameForm mode="create" />);

      const nameInput = screen.getByLabelText(/ゲーム名/);
      expect(nameInput).toHaveAttribute('maxLength', '100');
    });

    it('should have number type with min/max for player limit', () => {
      render(<GameForm mode="create" />);

      const playerLimitInput = screen.getByLabelText(/プレイヤー数上限/);
      expect(playerLimitInput).toHaveAttribute('type', 'number');
      expect(playerLimitInput).toHaveAttribute('min', '1');
      expect(playerLimitInput).toHaveAttribute('max', '100');
    });

    it('should mark player limit as required', () => {
      render(<GameForm mode="create" />);

      const playerLimitInput = screen.getByLabelText(/プレイヤー数上限/);
      expect(playerLimitInput).toHaveAttribute('required');
    });
  });
});
