// Component Tests: Button
// UI Primitive component for consistent button styling

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  describe('Rendering', () => {
    it('should render button element', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render children text', () => {
      render(<Button>Click me</Button>);

      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('should render children with JSX', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );

      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('should have default type="button"', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Variants', () => {
    it('should apply primary variant by default', () => {
      render(<Button>Primary</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600', 'text-white', 'hover:bg-blue-700');
    });

    it('should apply primary variant styles', () => {
      render(<Button variant="primary">Primary</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'bg-blue-600',
        'text-white',
        'hover:bg-blue-700',
        'focus:ring-blue-500'
      );
    });

    it('should apply secondary variant styles', () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'bg-gray-200',
        'text-gray-900',
        'hover:bg-gray-300',
        'focus:ring-gray-500'
      );
    });

    it('should not have primary styles when secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('bg-blue-600');
    });
  });

  describe('Sizes', () => {
    it('should apply medium size by default', () => {
      render(<Button>Medium</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-base');
    });

    it('should apply small size styles', () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });

    it('should apply medium size styles', () => {
      render(<Button size="md">Medium</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-base');
    });

    it('should apply large size styles', () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
    });

    it('should not have other size styles when specific size applied', () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('px-4', 'py-2');
      expect(button).not.toHaveClass('px-6', 'py-3');
    });
  });

  describe('Base Styles', () => {
    it('should apply base styles to all buttons', () => {
      render(<Button>Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'rounded-lg',
        'font-medium',
        'transition-colors',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-offset-2'
      );
    });

    it('should apply disabled styles', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should not be disabled by default', () => {
      render(<Button>Enabled</Button>);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should apply disabled hover styles for primary variant', () => {
      render(
        <Button variant="primary" disabled>
          Disabled Primary
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:hover:bg-blue-600');
    });

    it('should apply disabled hover styles for secondary variant', () => {
      render(
        <Button variant="secondary" disabled>
          Disabled Secondary
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:hover:bg-gray-200');
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Custom className', () => {
    it('should merge custom className with base styles', () => {
      render(<Button className="custom-class">Custom</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('rounded-lg'); // Base style still applied
    });

    it('should apply multiple custom classes', () => {
      render(<Button className="class-1 class-2 class-3">Multiple Classes</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('class-1', 'class-2', 'class-3');
    });

    it('should handle empty className', () => {
      render(<Button className="">No Custom Class</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-lg'); // Base styles still applied
    });
  });

  describe('Button Attributes', () => {
    it('should accept and apply type attribute', () => {
      render(<Button type="submit">Submit</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should accept and apply aria-label', () => {
      render(<Button aria-label="Close dialog">X</Button>);

      const button = screen.getByRole('button', { name: 'Close dialog' });
      expect(button).toBeInTheDocument();
    });

    it('should accept and apply data attributes', () => {
      render(<Button data-testid="custom-button">Test</Button>);

      const button = screen.getByTestId('custom-button');
      expect(button).toBeInTheDocument();
    });

    it('should accept and apply id attribute', () => {
      render(<Button id="my-button">ID Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('id', 'my-button');
    });

    it('should accept and apply name attribute', () => {
      render(<Button name="submit-button">Named Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('name', 'submit-button');
    });

    it('should accept and apply value attribute', () => {
      render(<Button value="button-value">Value Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('value', 'button-value');
    });
  });

  describe('Click Handling', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should pass event to onClick handler', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should handle multiple clicks', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('should work without onClick handler', () => {
      render(<Button>No Handler</Button>);

      const button = screen.getByRole('button');
      expect(() => fireEvent.click(button)).not.toThrow();
    });
  });

  describe('Variant and Size Combinations', () => {
    it('should combine primary variant with small size', () => {
      render(
        <Button variant="primary" size="sm">
          Primary Small
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600'); // Primary variant
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm'); // Small size
    });

    it('should combine secondary variant with large size', () => {
      render(
        <Button variant="secondary" size="lg">
          Secondary Large
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-200'); // Secondary variant
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg'); // Large size
    });

    it('should combine variant, size, and custom className', () => {
      render(
        <Button variant="secondary" size="sm" className="custom-class">
          All Props
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-200'); // Secondary variant
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm'); // Small size
      expect(button).toHaveClass('custom-class'); // Custom class
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Keyboard Button</Button>);

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should have focus ring styles', () => {
      render(<Button>Focus Test</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2');
    });

    it('should have proper focus ring color for primary variant', () => {
      render(<Button variant="primary">Primary Focus</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:ring-blue-500');
    });

    it('should have proper focus ring color for secondary variant', () => {
      render(<Button variant="secondary">Secondary Focus</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:ring-gray-500');
    });

    it('should support aria-disabled', () => {
      render(<Button aria-disabled="true">Aria Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children gracefully', () => {
      render(<Button>{''}</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle number as children', () => {
      render(<Button>{123}</Button>);

      expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('should handle boolean disabled prop explicitly', () => {
      render(<Button disabled={true}>Explicitly Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should not be disabled when disabled={false}', () => {
      render(<Button disabled={false}>Not Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should handle undefined variant (uses default)', () => {
      render(<Button variant={undefined}>Undefined Variant</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600'); // Default primary
    });

    it('should handle undefined size (uses default)', () => {
      render(<Button size={undefined}>Undefined Size</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-base'); // Default medium
    });
  });
});
