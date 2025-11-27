// Component Tests: NicknameInput
// Feature: 001-session-top-page
// Tests for nickname input form with validation and submission

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { NicknameInput } from './NicknameInput';

// Mock the useNicknameForm hook
vi.mock('./hooks/useNicknameForm', () => ({
  useNicknameForm: vi.fn(),
}));

// Mock the Input component
vi.mock('@/components/ui/Input', () => ({
  Input: vi.fn(
    ({ label, placeholder, value, onChange, error, disabled, maxLength, required, type }) => (
      <div data-testid="input-wrapper">
        <label htmlFor="test-input">{label}</label>
        <input
          id="test-input"
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          maxLength={maxLength}
          required={required}
          data-error={error}
        />
        {error && <span data-testid="input-error">{error}</span>}
      </div>
    )
  ),
}));

// Mock the Button component
vi.mock('@/components/ui/Button', () => ({
  Button: vi.fn(({ type, variant, size, className, disabled, children, ...props }) => (
    <button
      type={type}
      data-variant={variant}
      data-size={size}
      className={className}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )),
}));

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNicknameForm } from './hooks/useNicknameForm';

const mockUseNicknameForm = useNicknameForm as Mock;
const mockInput = Input as Mock;
const mockButton = Button as Mock;

describe('NicknameInput', () => {
  const defaultHookReturn = {
    nickname: '',
    error: null,
    isSubmitting: false,
    handleChange: vi.fn(),
    handleSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNicknameForm.mockReturnValue(defaultHookReturn);
  });

  describe('Rendering', () => {
    it('should render the form title', () => {
      render(<NicknameInput />);

      expect(screen.getByText('ニックネームを設定')).toBeInTheDocument();
    });

    it('should render the form instructions', () => {
      render(<NicknameInput />);

      expect(
        screen.getByText('ゲームに参加するためにニックネームを設定してください')
      ).toBeInTheDocument();
    });

    it('should render the form container with correct styling', () => {
      const { container } = render(<NicknameInput />);

      const formContainer = container.querySelector('.mx-auto.max-w-md.rounded-lg');
      expect(formContainer).toBeInTheDocument();
      expect(formContainer).toHaveClass(
        'border',
        'border-gray-200',
        'bg-white',
        'p-6',
        'shadow-sm'
      );
    });

    it('should render a form element', () => {
      const { container } = render(<NicknameInput />);

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('Input Component Integration', () => {
    it('should render Input component', () => {
      render(<NicknameInput />);

      expect(mockInput).toHaveBeenCalled();
    });

    it('should pass correct props to Input', () => {
      render(<NicknameInput />);

      expect(mockInput).toHaveBeenCalled();
      const callArgs = mockInput.mock.calls[0][0];
      expect(callArgs.type).toBe('text');
      expect(callArgs.label).toBe('ニックネーム');
      expect(callArgs.placeholder).toBe('例: 田中太郎');
      expect(callArgs.value).toBe('');
      expect(callArgs.error).toBe(undefined);
      expect(callArgs.disabled).toBe(false);
      expect(callArgs.maxLength).toBe(50);
      expect(callArgs.required).toBe(true);
    });

    it('should pass nickname value from hook to Input', () => {
      mockUseNicknameForm.mockReturnValue({
        ...defaultHookReturn,
        nickname: '山田太郎',
      });

      render(<NicknameInput />);

      expect(mockInput).toHaveBeenCalled();
      const callArgs = mockInput.mock.calls[0][0];
      expect(callArgs.value).toBe('山田太郎');
    });

    it('should pass error from hook to Input', () => {
      mockUseNicknameForm.mockReturnValue({
        ...defaultHookReturn,
        error: 'ニックネームは必須です',
      });

      render(<NicknameInput />);

      expect(mockInput).toHaveBeenCalled();
      const callArgs = mockInput.mock.calls[0][0];
      expect(callArgs.error).toBe('ニックネームは必須です');
    });

    it('should handle null error from hook', () => {
      mockUseNicknameForm.mockReturnValue({
        ...defaultHookReturn,
        error: null,
      });

      render(<NicknameInput />);

      expect(mockInput).toHaveBeenCalled();
      const callArgs = mockInput.mock.calls[0][0];
      expect(callArgs.error).toBe(undefined);
    });

    it('should disable Input when submitting', () => {
      mockUseNicknameForm.mockReturnValue({
        ...defaultHookReturn,
        isSubmitting: true,
      });

      render(<NicknameInput />);

      expect(mockInput).toHaveBeenCalled();
      const callArgs = mockInput.mock.calls[0][0];
      expect(callArgs.disabled).toBe(true);
    });

    it('should call handleChange when Input value changes', () => {
      const handleChange = vi.fn();
      mockUseNicknameForm.mockReturnValue({
        ...defaultHookReturn,
        handleChange,
      });

      render(<NicknameInput />);

      const input = screen.getByPlaceholderText('例: 田中太郎');
      fireEvent.change(input, { target: { value: '新しい名前' } });

      expect(handleChange).toHaveBeenCalledWith('新しい名前');
    });
  });

  describe('Button Component Integration', () => {
    it('should render Button component', () => {
      render(<NicknameInput />);

      expect(mockButton).toHaveBeenCalled();
    });

    it('should pass correct props to Button', () => {
      render(<NicknameInput />);

      expect(mockButton).toHaveBeenCalled();
      const callArgs = mockButton.mock.calls[0][0];
      expect(callArgs.type).toBe('submit');
      expect(callArgs.variant).toBe('primary');
      expect(callArgs.size).toBe('lg');
      expect(callArgs.className).toBe('w-full');
      expect(callArgs.disabled).toBe(false);
    });

    it('should display default button text', () => {
      render(<NicknameInput />);

      expect(screen.getByRole('button', { name: '設定する' })).toBeInTheDocument();
    });

    it('should display loading text when submitting', () => {
      mockUseNicknameForm.mockReturnValue({
        ...defaultHookReturn,
        isSubmitting: true,
      });

      render(<NicknameInput />);

      expect(screen.getByRole('button', { name: '設定中...' })).toBeInTheDocument();
    });

    it('should disable Button when submitting', () => {
      mockUseNicknameForm.mockReturnValue({
        ...defaultHookReturn,
        isSubmitting: true,
      });

      render(<NicknameInput />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should not disable Button when not submitting', () => {
      render(<NicknameInput />);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('should call handleSubmit when form is submitted', () => {
      const handleSubmit = vi.fn();
      mockUseNicknameForm.mockReturnValue({
        ...defaultHookReturn,
        handleSubmit,
      });

      render(<NicknameInput />);

      const form = screen.getByRole('button').closest('form');
      expect(form).not.toBeNull();

      fireEvent.submit(form!);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('should prevent default form submission', () => {
      const handleSubmit = vi.fn();
      mockUseNicknameForm.mockReturnValue({
        ...defaultHookReturn,
        handleSubmit,
      });

      render(<NicknameInput />);

      const form = screen.getByRole('button').closest('form');
      expect(form).not.toBeNull();

      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');

      form!.dispatchEvent(submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should have submit button that triggers form submission', () => {
      const handleSubmit = vi.fn();
      mockUseNicknameForm.mockReturnValue({
        ...defaultHookReturn,
        handleSubmit,
      });

      render(<NicknameInput />);

      const button = screen.getByRole('button');
      const form = button.closest('form');

      expect(button).toHaveAttribute('type', 'submit');
      expect(form).not.toBeNull();

      // Verify form submission calls handleSubmit
      fireEvent.submit(form!);
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('should handle multiple form submissions', () => {
      const handleSubmit = vi.fn();
      mockUseNicknameForm.mockReturnValue({
        ...defaultHookReturn,
        handleSubmit,
      });

      render(<NicknameInput />);

      const button = screen.getByRole('button');
      const form = button.closest('form');

      // Submit form multiple times
      fireEvent.submit(form!);
      fireEvent.submit(form!);
      fireEvent.submit(form!);

      // Verify handleSubmit was called for each submission
      expect(handleSubmit).toHaveBeenCalled();
      expect(handleSubmit.mock.calls.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Hook Integration', () => {
    it('should call useNicknameForm hook', () => {
      render(<NicknameInput />);

      expect(mockUseNicknameForm).toHaveBeenCalled();
    });

    it('should call useNicknameForm without arguments', () => {
      render(<NicknameInput />);

      expect(mockUseNicknameForm).toHaveBeenCalledWith();
    });

    it('should use all hook return values', () => {
      const customHookReturn = {
        nickname: 'カスタム',
        error: 'カスタムエラー',
        isSubmitting: true,
        handleChange: vi.fn(),
        handleSubmit: vi.fn(),
      };

      mockUseNicknameForm.mockReturnValue(customHookReturn);

      render(<NicknameInput />);

      // Verify Input receives nickname and error
      expect(mockInput).toHaveBeenCalled();
      const inputArgs = mockInput.mock.calls[0][0];
      expect(inputArgs.value).toBe('カスタム');
      expect(inputArgs.error).toBe('カスタムエラー');
      expect(inputArgs.disabled).toBe(true);

      // Verify Button is disabled and shows loading text
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('設定中...');
    });
  });

  describe('Error Display', () => {
    it('should display error from hook', () => {
      mockUseNicknameForm.mockReturnValue({
        ...defaultHookReturn,
        error: 'ニックネームは1文字以上50文字以内で入力してください',
      });

      render(<NicknameInput />);

      expect(screen.getByTestId('input-error')).toHaveTextContent(
        'ニックネームは1文字以上50文字以内で入力してください'
      );
    });

    it('should not display error when error is null', () => {
      mockUseNicknameForm.mockReturnValue({
        ...defaultHookReturn,
        error: null,
      });

      render(<NicknameInput />);

      expect(screen.queryByTestId('input-error')).not.toBeInTheDocument();
    });

    it('should update error display when error changes', () => {
      mockUseNicknameForm.mockReturnValue({
        ...defaultHookReturn,
        error: 'エラー1',
      });

      const { rerender } = render(<NicknameInput />);

      expect(screen.getByTestId('input-error')).toHaveTextContent('エラー1');

      mockUseNicknameForm.mockReturnValue({
        ...defaultHookReturn,
        error: 'エラー2',
      });

      rerender(<NicknameInput />);

      expect(screen.getByTestId('input-error')).toHaveTextContent('エラー2');
    });
  });

  describe('State Transitions', () => {
    it('should transition from idle to submitting state', () => {
      mockUseNicknameForm.mockReturnValue({
        ...defaultHookReturn,
        isSubmitting: false,
      });

      const { rerender } = render(<NicknameInput />);

      // Initial state
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent('設定する');

      // Submitting state
      mockUseNicknameForm.mockReturnValue({
        ...defaultHookReturn,
        isSubmitting: true,
      });

      rerender(<NicknameInput />);

      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('設定中...');
    });

    it('should transition from error to no error', () => {
      mockUseNicknameForm.mockReturnValue({
        ...defaultHookReturn,
        error: 'エラーメッセージ',
      });

      const { rerender } = render(<NicknameInput />);

      expect(screen.getByTestId('input-error')).toBeInTheDocument();

      mockUseNicknameForm.mockReturnValue({
        ...defaultHookReturn,
        error: null,
      });

      rerender(<NicknameInput />);

      expect(screen.queryByTestId('input-error')).not.toBeInTheDocument();
    });

    it('should update nickname value as user types', () => {
      const handleChange = vi.fn();
      mockUseNicknameForm.mockReturnValue({
        ...defaultHookReturn,
        nickname: '',
        handleChange,
      });

      const { rerender } = render(<NicknameInput />);

      const input = screen.getByPlaceholderText('例: 田中太郎');

      // User types first character
      fireEvent.change(input, { target: { value: '山' } });
      expect(handleChange).toHaveBeenCalledWith('山');

      // Update hook to return new value
      mockUseNicknameForm.mockReturnValue({
        ...defaultHookReturn,
        nickname: '山',
        handleChange,
      });

      rerender(<NicknameInput />);

      // Verify the updated value was passed to Input
      const lastCall = mockInput.mock.calls[mockInput.mock.calls.length - 1];
      expect(lastCall[0].value).toBe('山');
    });
  });

  describe('Accessibility', () => {
    it('should have required attribute on input', () => {
      render(<NicknameInput />);

      expect(mockInput).toHaveBeenCalled();
      const callArgs = mockInput.mock.calls[0][0];
      expect(callArgs.required).toBe(true);
    });

    it('should have text input type', () => {
      render(<NicknameInput />);

      expect(mockInput).toHaveBeenCalled();
      const callArgs = mockInput.mock.calls[0][0];
      expect(callArgs.type).toBe('text');
    });

    it('should have submit button type', () => {
      render(<NicknameInput />);

      expect(mockButton).toHaveBeenCalled();
      const callArgs = mockButton.mock.calls[0][0];
      expect(callArgs.type).toBe('submit');
    });

    it('should have label for input', () => {
      render(<NicknameInput />);

      expect(screen.getByText('ニックネーム')).toBeInTheDocument();
    });

    it('should have placeholder text', () => {
      render(<NicknameInput />);

      expect(screen.getByPlaceholderText('例: 田中太郎')).toBeInTheDocument();
    });
  });

  describe('Input Constraints', () => {
    it('should have maxLength of 50', () => {
      render(<NicknameInput />);

      expect(mockInput).toHaveBeenCalled();
      const callArgs = mockInput.mock.calls[0][0];
      expect(callArgs.maxLength).toBe(50);
    });

    it('should enforce maxLength on input element', () => {
      render(<NicknameInput />);

      const input = screen.getByPlaceholderText('例: 田中太郎');
      expect(input).toHaveAttribute('maxLength', '50');
    });
  });
});
