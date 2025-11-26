// Component Tests: Input
// UI Primitive component for text input with label and error states

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should render wrapper div', () => {
      const { container } = render(<Input />);

      const wrapper = container.firstChild;
      expect(wrapper).toBeInstanceOf(HTMLDivElement);
    });

    it('should have full width wrapper', () => {
      const { container } = render(<Input />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('w-full');
    });

    it('should render with placeholder', () => {
      render(<Input placeholder="Enter text" />);

      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should render with value', () => {
      render(<Input value="Test value" readOnly />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Test value');
    });
  });

  describe('Label', () => {
    it('should render label when provided', () => {
      render(<Input label="Username" />);

      expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('should not render label when not provided', () => {
      const { container } = render(<Input />);

      const label = container.querySelector('label');
      expect(label).not.toBeInTheDocument();
    });

    it('should link label to input with htmlFor', () => {
      render(<Input label="Email" id="email-input" />);

      const label = screen.getByText('Email') as HTMLLabelElement;
      expect(label).toHaveAttribute('for', 'email-input');
    });

    it('should generate ID and link label when no ID provided', () => {
      render(<Input label="Password" />);

      const label = screen.getByText('Password') as HTMLLabelElement;
      const input = screen.getByRole('textbox');

      expect(label).toHaveAttribute('for');
      const htmlFor = label.getAttribute('for');
      expect(input).toHaveAttribute('id', htmlFor);
    });

    it('should style label correctly', () => {
      render(<Input label="Name" />);

      const label = screen.getByText('Name');
      expect(label).toHaveClass('mb-2', 'block', 'text-sm', 'font-medium', 'text-gray-700');
    });

    it('should handle Japanese label text', () => {
      render(<Input label="ニックネーム" />);

      expect(screen.getByText('ニックネーム')).toBeInTheDocument();
    });
  });

  describe('Base Styles', () => {
    it('should apply base styles', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass(
        'block',
        'w-full',
        'rounded-lg',
        'border',
        'px-4',
        'py-2',
        'text-base',
        'transition-colors',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-offset-2'
      );
    });
  });

  describe('Normal State (No Error)', () => {
    it('should have gray border in normal state', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-gray-300');
    });

    it('should have blue focus styles in normal state', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus:border-blue-500', 'focus:ring-blue-500');
    });

    it('should not have error styles in normal state', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).not.toHaveClass('border-red-500');
    });
  });

  describe('Error State', () => {
    it('should have red border when error provided', () => {
      render(<Input error="Invalid input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500');
    });

    it('should have red focus styles when error provided', () => {
      render(<Input error="Invalid input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus:border-red-500', 'focus:ring-red-500');
    });

    it('should display error message', () => {
      render(<Input error="This field is required" />);

      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should style error message correctly', () => {
      const { container } = render(<Input error="Error message" />);

      const errorText = container.querySelector('.text-red-600');
      expect(errorText).toBeInTheDocument();
      expect(errorText).toHaveClass('mt-1', 'text-sm');
    });

    it('should handle Japanese error message', () => {
      render(<Input error="このフィールドは必須です" />);

      expect(screen.getByText('このフィールドは必須です')).toBeInTheDocument();
    });

    it('should not have normal state styles when error', () => {
      render(<Input error="Error" />);

      const input = screen.getByRole('textbox');
      expect(input).not.toHaveClass('border-gray-300', 'focus:border-blue-500');
    });
  });

  describe('Helper Text', () => {
    it('should display helper text when provided', () => {
      render(<Input helperText="Enter your email address" />);

      expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    });

    it('should style helper text correctly', () => {
      const { container } = render(<Input helperText="Helper text" />);

      const helper = container.querySelector('.text-gray-500');
      expect(helper).toBeInTheDocument();
      expect(helper).toHaveClass('mt-1', 'text-sm');
    });

    it('should hide helper text when error is present', () => {
      render(<Input helperText="Helper text" error="Error message" />);

      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('should show helper text when no error', () => {
      render(<Input helperText="Helper text" />);

      expect(screen.getByText('Helper text')).toBeInTheDocument();
    });

    it('should handle Japanese helper text', () => {
      render(<Input helperText="メールアドレスを入力してください" />);

      expect(screen.getByText('メールアドレスを入力してください')).toBeInTheDocument();
    });
  });

  describe('ID Handling', () => {
    it('should use custom ID when provided', () => {
      render(<Input id="custom-id" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'custom-id');
    });

    it('should generate unique ID when not provided', () => {
      render(
        <>
          <Input />
          <Input />
        </>
      );

      const inputs = screen.getAllByRole('textbox');
      const id1 = inputs[0].getAttribute('id');
      const id2 = inputs[1].getAttribute('id');

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it('should use custom ID with label', () => {
      render(<Input id="my-input" label="My Label" />);

      const label = screen.getByText('My Label') as HTMLLabelElement;
      const input = screen.getByRole('textbox');

      expect(label).toHaveAttribute('for', 'my-input');
      expect(input).toHaveAttribute('id', 'my-input');
    });
  });

  describe('Custom className', () => {
    it('should merge custom className with base styles', () => {
      render(<Input className="custom-class" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
      expect(input).toHaveClass('rounded-lg'); // Base style still applied
    });

    it('should apply multiple custom classes', () => {
      render(<Input className="class-1 class-2 class-3" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('class-1', 'class-2', 'class-3');
    });

    it('should handle empty className', () => {
      render(<Input className="" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('rounded-lg'); // Base styles still applied
    });
  });

  describe('Input Attributes', () => {
    it('should accept type attribute', () => {
      render(<Input type="email" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should accept placeholder attribute', () => {
      render(<Input placeholder="Enter text here" />);

      expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument();
    });

    it('should accept name attribute', () => {
      render(<Input name="username" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'username');
    });

    it('should accept disabled attribute', () => {
      render(<Input disabled />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should accept required attribute', () => {
      render(<Input required />);

      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('should accept maxLength attribute', () => {
      render(<Input maxLength={50} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '50');
    });

    it('should accept readOnly attribute', () => {
      render(<Input readOnly />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readOnly');
    });

    it('should accept aria-label', () => {
      render(<Input aria-label="Search input" />);

      const input = screen.getByLabelText('Search input');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    it('should call onChange when value changes', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });

      expect(handleChange).toHaveBeenCalled();
    });

    it('should update value on change', () => {
      const { rerender } = render(<Input value="" onChange={vi.fn()} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');

      rerender(<Input value="updated" onChange={vi.fn()} />);
      expect(input.value).toBe('updated');
    });

    it('should call onFocus when focused', () => {
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      expect(handleFocus).toHaveBeenCalled();
    });

    it('should call onBlur when blurred', () => {
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} />);

      const input = screen.getByRole('textbox');
      fireEvent.blur(input);

      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('Complete Input States', () => {
    it('should render complete input with all features', () => {
      render(
        <Input
          label="Email Address"
          placeholder="you@example.com"
          helperText="We'll never share your email"
          type="email"
          required
        />
      );

      expect(screen.getByText('Email Address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
      expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeRequired();
    });

    it('should render input with error state', () => {
      render(
        <Input
          label="Password"
          error="Password must be at least 8 characters"
          helperText="This helper is hidden"
          type="password"
        />
      );

      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
      expect(screen.queryByText('This helper is hidden')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should treat empty error string as falsy (no error styling)', () => {
      render(<Input error="" />);

      // Empty error string is falsy, so no error styling
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-gray-300'); // Normal state
      expect(input).not.toHaveClass('border-red-500');
    });

    it('should treat empty helperText string as falsy (not rendered)', () => {
      const { container } = render(<Input helperText="" />);

      const helper = container.querySelector('.text-gray-500');
      expect(helper).not.toBeInTheDocument();
    });

    it('should treat empty label string as falsy (not rendered)', () => {
      const { container } = render(<Input label="" />);

      const label = container.querySelector('label');
      expect(label).not.toBeInTheDocument();
    });

    it('should handle undefined props', () => {
      render(
        <Input label={undefined} error={undefined} helperText={undefined} className={undefined} />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should work with controlled input', () => {
      const { rerender } = render(<Input value="initial" onChange={vi.fn()} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('initial');

      rerender(<Input value="updated" onChange={vi.fn()} />);
      expect(input.value).toBe('updated');
    });

    it('should work with uncontrolled input', () => {
      render(<Input defaultValue="default value" />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('default value');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      input.focus();
      expect(input).toHaveFocus();
    });

    it('should have focus ring styles', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2');
    });

    it('should associate label with input for screen readers', () => {
      render(<Input label="Username" id="username" />);

      const input = screen.getByLabelText('Username');
      expect(input).toBeInTheDocument();
    });

    it('should support aria-describedby for error', () => {
      render(<Input error="Error message" aria-describedby="error-id" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'error-id');
    });
  });
});
