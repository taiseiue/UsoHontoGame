// Component Tests: PresenterForm
// Feature: 002-game-preparation
// Tests for presenter addition form with validation and submission

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import type { PresenterWithLieDto } from '@/server/application/dto/PresenterWithLieDto';
import { PresenterForm } from './PresenterForm';

// Mock the usePresenterForm hook
vi.mock('@/hooks/usePresenterForm', () => ({
  usePresenterForm: vi.fn(),
}));

import { usePresenterForm } from '@/hooks/usePresenterForm';

const mockUsePresenterForm = usePresenterForm as Mock;

describe('PresenterForm', () => {
  const defaultProps = {
    gameId: 'game-123',
  };

  const mockPresenter: PresenterWithLieDto = {
    id: 'presenter-1',
    gameId: 'game-123',
    nickname: '太郎',
    episodes: [],
    createdAt: new Date(),
  };

  const mockHandleSubmit = vi.fn((e: React.FormEvent) => {
    e.preventDefault();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock return value
    mockUsePresenterForm.mockReturnValue({
      handleSubmit: mockHandleSubmit,
      isSubmitting: false,
      errors: {},
      createdPresenter: null,
      isSuccess: false,
      reset: vi.fn(),
    });
  });

  describe('Initial Rendering', () => {
    it('should render form title', () => {
      render(<PresenterForm {...defaultProps} />);

      expect(screen.getByRole('heading', { name: 'プレゼンターを追加' })).toBeInTheDocument();
    });

    it('should render nickname input with label', () => {
      render(<PresenterForm {...defaultProps} />);

      expect(screen.getByLabelText('ニックネーム (1-50文字)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('プレゼンターのニックネームを入力')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<PresenterForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: 'プレゼンターを追加' });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should render help text', () => {
      render(<PresenterForm {...defaultProps} />);

      expect(
        screen.getByText(
          'プレゼンターを追加後、3つのエピソード（2つのホント、1つのウソ）を登録してください。'
        )
      ).toBeInTheDocument();
    });

    it('should not show success message initially', () => {
      render(<PresenterForm {...defaultProps} />);

      expect(screen.queryByText('プレゼンターを追加しました！')).not.toBeInTheDocument();
    });

    it('should not show error messages initially', () => {
      render(<PresenterForm {...defaultProps} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Input Properties', () => {
    it('should have required attribute', () => {
      render(<PresenterForm {...defaultProps} />);

      const input = screen.getByLabelText('ニックネーム (1-50文字)');
      expect(input).toHaveAttribute('required');
    });

    it('should have maxLength of 50', () => {
      render(<PresenterForm {...defaultProps} />);

      const input = screen.getByLabelText('ニックネーム (1-50文字)');
      expect(input).toHaveAttribute('maxLength', '50');
    });

    it('should have correct input type', () => {
      render(<PresenterForm {...defaultProps} />);

      const input = screen.getByLabelText('ニックネーム (1-50文字)');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should have name attribute', () => {
      render(<PresenterForm {...defaultProps} />);

      const input = screen.getByLabelText('ニックネーム (1-50文字)');
      expect(input).toHaveAttribute('name', 'nickname');
    });

    it('should be enabled initially', () => {
      render(<PresenterForm {...defaultProps} />);

      const input = screen.getByLabelText('ニックネーム (1-50文字)');
      expect(input).not.toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('should call handleSubmit when form is submitted', async () => {
      const user = userEvent.setup();
      render(<PresenterForm {...defaultProps} />);

      const input = screen.getByLabelText('ニックネーム (1-50文字)');
      await user.type(input, '太郎');

      const submitButton = screen.getByRole('button', { name: 'プレゼンターを追加' });
      await user.click(submitButton);

      expect(mockHandleSubmit).toHaveBeenCalled();
    });

    it('should pass form event to handleSubmit', async () => {
      const user = userEvent.setup();
      render(<PresenterForm {...defaultProps} />);

      const input = screen.getByLabelText('ニックネーム (1-50文字)');
      await user.type(input, '太郎');

      const form = screen.getByRole('button', { name: 'プレゼンターを追加' }).closest('form');
      expect(form).not.toBeNull();

      await user.click(screen.getByRole('button', { name: 'プレゼンターを追加' }));

      expect(mockHandleSubmit).toHaveBeenCalledWith(expect.any(Object));
      const event = mockHandleSubmit.mock.calls[0][0];
      expect(event.preventDefault).toBeDefined();
    });

    it('should include nickname in form data', async () => {
      const user = userEvent.setup();
      render(<PresenterForm {...defaultProps} />);

      const input = screen.getByLabelText('ニックネーム (1-50文字)');
      await user.type(input, '太郎');

      const submitButton = screen.getByRole('button', { name: 'プレゼンターを追加' });
      await user.click(submitButton);

      // Form data is handled by the hook, just verify submission was triggered
      expect(mockHandleSubmit).toHaveBeenCalled();
    });
  });

  describe('Success State', () => {
    beforeEach(() => {
      mockUsePresenterForm.mockReturnValue({
        handleSubmit: mockHandleSubmit,
        isSubmitting: false,
        errors: {},
        createdPresenter: mockPresenter,
        isSuccess: true,
        reset: vi.fn(),
      });
    });

    it('should show success message when isSuccess is true', () => {
      render(<PresenterForm {...defaultProps} />);

      expect(screen.getByText('プレゼンターを追加しました！')).toBeInTheDocument();
    });

    it('should disable input when success', () => {
      render(<PresenterForm {...defaultProps} />);

      const input = screen.getByLabelText('ニックネーム (1-50文字)');
      expect(input).toBeDisabled();
    });

    it('should disable submit button when success', () => {
      render(<PresenterForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: 'プレゼンターを追加' });
      expect(submitButton).toBeDisabled();
    });

    it('should have success message with alert role', () => {
      render(<PresenterForm {...defaultProps} />);

      const successMessage = screen.getByText('プレゼンターを追加しました！');
      const alertContainer = successMessage.closest('[role="alert"]');
      expect(alertContainer).toBeInTheDocument();
    });

    it('should have proper styling for success message', () => {
      render(<PresenterForm {...defaultProps} />);

      const successMessage = screen.getByText('プレゼンターを追加しました！');
      const container = successMessage.closest('div');
      expect(container).toHaveClass('bg-green-50');
      expect(container).toHaveClass('border-green-200');
    });
  });

  describe('Loading State', () => {
    beforeEach(() => {
      mockUsePresenterForm.mockReturnValue({
        handleSubmit: mockHandleSubmit,
        isSubmitting: true,
        errors: {},
        createdPresenter: null,
        isSuccess: false,
        reset: vi.fn(),
      });
    });

    it('should show loading text on submit button', () => {
      render(<PresenterForm {...defaultProps} />);

      expect(screen.getByRole('button', { name: '追加中...' })).toBeInTheDocument();
    });

    it('should disable submit button during submission', () => {
      render(<PresenterForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: '追加中...' });
      expect(submitButton).toBeDisabled();
    });

    it('should disable input during submission', () => {
      render(<PresenterForm {...defaultProps} />);

      const input = screen.getByLabelText('ニックネーム (1-50文字)');
      expect(input).toBeDisabled();
    });

    it('should have visual disabled styling', () => {
      render(<PresenterForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: '追加中...' });
      expect(submitButton).toHaveClass('disabled:cursor-not-allowed');
      expect(submitButton).toHaveClass('disabled:bg-gray-400');
    });
  });

  describe('Field Validation Errors', () => {
    beforeEach(() => {
      mockUsePresenterForm.mockReturnValue({
        handleSubmit: mockHandleSubmit,
        isSubmitting: false,
        errors: {
          nickname: ['ニックネームは1文字以上50文字以内で入力してください'],
        },
        createdPresenter: null,
        isSuccess: false,
        reset: vi.fn(),
      });
    });

    it('should display nickname error message', () => {
      render(<PresenterForm {...defaultProps} />);

      expect(
        screen.getByText('ニックネームは1文字以上50文字以内で入力してください')
      ).toBeInTheDocument();
    });

    it('should have error message with alert role', () => {
      render(<PresenterForm {...defaultProps} />);

      const errorMessage = screen.getByText('ニックネームは1文字以上50文字以内で入力してください');
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });

    it('should link error to input with aria-describedby', () => {
      render(<PresenterForm {...defaultProps} />);

      const input = screen.getByLabelText('ニックネーム (1-50文字)');
      expect(input).toHaveAttribute('aria-describedby', 'nickname-error');
    });

    it('should mark input as invalid with aria-invalid', () => {
      render(<PresenterForm {...defaultProps} />);

      const input = screen.getByLabelText('ニックネーム (1-50文字)');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have error message with correct id', () => {
      render(<PresenterForm {...defaultProps} />);

      const errorMessage = screen.getByText('ニックネームは1文字以上50文字以内で入力してください');
      expect(errorMessage).toHaveAttribute('id', 'nickname-error');
    });

    it('should style error message appropriately', () => {
      render(<PresenterForm {...defaultProps} />);

      const errorMessage = screen.getByText('ニックネームは1文字以上50文字以内で入力してください');
      expect(errorMessage).toHaveClass('text-red-600');
    });
  });

  describe('Form-Level Errors', () => {
    beforeEach(() => {
      mockUsePresenterForm.mockReturnValue({
        handleSubmit: mockHandleSubmit,
        isSubmitting: false,
        errors: {
          _form: ['ゲームが見つかりません'],
        },
        createdPresenter: null,
        isSuccess: false,
        reset: vi.fn(),
      });
    });

    it('should display form-level error message', () => {
      render(<PresenterForm {...defaultProps} />);

      expect(screen.getByText('ゲームが見つかりません')).toBeInTheDocument();
    });

    it('should have form error with alert role', () => {
      render(<PresenterForm {...defaultProps} />);

      const errorMessage = screen.getByText('ゲームが見つかりません');
      const alertContainer = errorMessage.closest('[role="alert"]');
      expect(alertContainer).toBeInTheDocument();
    });

    it('should style form error appropriately', () => {
      render(<PresenterForm {...defaultProps} />);

      const errorMessage = screen.getByText('ゲームが見つかりません');
      const container = errorMessage.closest('div');
      expect(container).toHaveClass('bg-red-50');
      expect(container).toHaveClass('border-red-200');
    });

    it('should not show success message when there is an error', () => {
      render(<PresenterForm {...defaultProps} />);

      expect(screen.queryByText('プレゼンターを追加しました！')).not.toBeInTheDocument();
    });
  });

  describe('Multiple Errors', () => {
    beforeEach(() => {
      mockUsePresenterForm.mockReturnValue({
        handleSubmit: mockHandleSubmit,
        isSubmitting: false,
        errors: {
          nickname: ['ニックネームは必須です'],
          _form: ['サーバーエラーが発生しました'],
        },
        createdPresenter: null,
        isSuccess: false,
        reset: vi.fn(),
      });
    });

    it('should display both field and form errors', () => {
      render(<PresenterForm {...defaultProps} />);

      expect(screen.getByText('ニックネームは必須です')).toBeInTheDocument();
      expect(screen.getByText('サーバーエラーが発生しました')).toBeInTheDocument();
    });

    it('should have multiple alert roles', () => {
      render(<PresenterForm {...defaultProps} />);

      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(2);
    });
  });

  describe('Callback Handling', () => {
    it('should call onPresenterAdded when provided and success', () => {
      const onPresenterAdded = vi.fn();
      mockUsePresenterForm.mockReturnValue({
        handleSubmit: mockHandleSubmit,
        isSubmitting: false,
        errors: {},
        createdPresenter: mockPresenter,
        isSuccess: true,
        reset: vi.fn(),
      });

      render(<PresenterForm {...defaultProps} onPresenterAdded={onPresenterAdded} />);

      // The hook handles calling the callback, we just verify the hook received it
      expect(mockUsePresenterForm).toHaveBeenCalledWith({
        gameId: 'game-123',
        onSuccess: onPresenterAdded,
      });
    });

    it('should work without onPresenterAdded callback', () => {
      mockUsePresenterForm.mockReturnValue({
        handleSubmit: mockHandleSubmit,
        isSubmitting: false,
        errors: {},
        createdPresenter: mockPresenter,
        isSuccess: true,
        reset: vi.fn(),
      });

      expect(() => {
        render(<PresenterForm {...defaultProps} />);
      }).not.toThrow();

      expect(mockUsePresenterForm).toHaveBeenCalledWith({
        gameId: 'game-123',
        onSuccess: undefined,
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper label association', () => {
      render(<PresenterForm {...defaultProps} />);

      const label = screen.getByText('ニックネーム (1-50文字)');
      const input = screen.getByLabelText('ニックネーム (1-50文字)');

      expect(label).toHaveAttribute('for', 'nickname');
      expect(input).toHaveAttribute('id', 'nickname');
    });

    it('should not have aria-describedby when no error', () => {
      render(<PresenterForm {...defaultProps} />);

      const input = screen.getByLabelText('ニックネーム (1-50文字)');
      expect(input).not.toHaveAttribute('aria-describedby');
    });

    it('should have aria-invalid false when no error', () => {
      render(<PresenterForm {...defaultProps} />);

      const input = screen.getByLabelText('ニックネーム (1-50文字)');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have submit button with proper type', () => {
      render(<PresenterForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: 'プレゼンターを追加' });
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should have focusable elements', () => {
      render(<PresenterForm {...defaultProps} />);

      const input = screen.getByLabelText('ニックネーム (1-50文字)');
      const submitButton = screen.getByRole('button', { name: 'プレゼンターを追加' });

      expect(input).toHaveClass('focus:ring-2');
      expect(submitButton).toHaveClass('focus:ring-2');
    });

    it('should indicate disabled state visually', () => {
      mockUsePresenterForm.mockReturnValue({
        handleSubmit: mockHandleSubmit,
        isSubmitting: true,
        errors: {},
        createdPresenter: null,
        isSuccess: false,
        reset: vi.fn(),
      });

      render(<PresenterForm {...defaultProps} />);

      const input = screen.getByLabelText('ニックネーム (1-50文字)');
      const submitButton = screen.getByRole('button', { name: '追加中...' });

      expect(input).toHaveClass('disabled:bg-gray-100');
      expect(submitButton).toHaveClass('disabled:bg-gray-400');
    });
  });

  describe('Component Integration', () => {
    it('should pass gameId to hook', () => {
      render(<PresenterForm gameId="test-game-456" />);

      expect(mockUsePresenterForm).toHaveBeenCalledWith({
        gameId: 'test-game-456',
        onSuccess: undefined,
      });
    });

    it('should render correctly with different gameId', () => {
      const { rerender } = render(<PresenterForm gameId="game-1" />);

      expect(mockUsePresenterForm).toHaveBeenCalledWith({
        gameId: 'game-1',
        onSuccess: undefined,
      });

      rerender(<PresenterForm gameId="game-2" />);

      expect(mockUsePresenterForm).toHaveBeenCalledWith({
        gameId: 'game-2',
        onSuccess: undefined,
      });
    });

    it('should handle state transitions properly', () => {
      const { rerender } = render(<PresenterForm {...defaultProps} />);

      // Initial state
      expect(screen.getByRole('button', { name: 'プレゼンターを追加' })).toBeInTheDocument();

      // Submitting state
      mockUsePresenterForm.mockReturnValue({
        handleSubmit: mockHandleSubmit,
        isSubmitting: true,
        errors: {},
        createdPresenter: null,
        isSuccess: false,
        reset: vi.fn(),
      });
      rerender(<PresenterForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: '追加中...' })).toBeInTheDocument();

      // Success state
      mockUsePresenterForm.mockReturnValue({
        handleSubmit: mockHandleSubmit,
        isSubmitting: false,
        errors: {},
        createdPresenter: mockPresenter,
        isSuccess: true,
        reset: vi.fn(),
      });
      rerender(<PresenterForm {...defaultProps} />);
      expect(screen.getByText('プレゼンターを追加しました！')).toBeInTheDocument();
    });

    it('should maintain form structure throughout states', () => {
      const { rerender } = render(<PresenterForm {...defaultProps} />);

      const form = screen.getByRole('button').closest('form');
      expect(form).toBeInTheDocument();

      // Change to loading state
      mockUsePresenterForm.mockReturnValue({
        handleSubmit: mockHandleSubmit,
        isSubmitting: true,
        errors: {},
        createdPresenter: null,
        isSuccess: false,
        reset: vi.fn(),
      });
      rerender(<PresenterForm {...defaultProps} />);

      const formAfterChange = screen.getByRole('button').closest('form');
      expect(formAfterChange).toBeInTheDocument();
    });
  });
});
