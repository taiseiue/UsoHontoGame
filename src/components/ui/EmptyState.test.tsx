// Component Tests: EmptyState
// UI Primitive component for displaying empty data states

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  describe('Rendering', () => {
    it('should render empty state container', () => {
      const { container } = render(<EmptyState message="No data" />);

      const emptyState = container.querySelector('output');
      expect(emptyState).toBeInTheDocument();
    });

    it('should render as output element', () => {
      const { container } = render(<EmptyState message="Test" />);

      const emptyState = container.firstChild;
      expect(emptyState).toBeInstanceOf(HTMLOutputElement);
    });

    it('should have proper container styles', () => {
      const { container } = render(<EmptyState message="No data" />);

      const emptyState = container.querySelector('output');
      expect(emptyState).toHaveClass(
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'py-12',
        'px-4'
      );
    });
  });

  describe('Message Display', () => {
    it('should display main message', () => {
      render(<EmptyState message="No items found" />);

      expect(screen.getByText('No items found')).toBeInTheDocument();
    });

    it('should style main message correctly', () => {
      render(<EmptyState message="Main message" />);

      const message = screen.getByText('Main message');
      expect(message).toHaveClass('text-lg', 'font-medium', 'text-gray-900', 'text-center', 'mb-2');
      expect(message.tagName).toBe('P');
    });

    it('should handle Japanese message', () => {
      render(<EmptyState message="データがありません" />);

      expect(screen.getByText('データがありません')).toBeInTheDocument();
    });

    it('should handle English message', () => {
      render(<EmptyState message="No results found" />);

      expect(screen.getByText('No results found')).toBeInTheDocument();
    });

    it('should handle long message', () => {
      const longMessage =
        'This is a very long message that should still be displayed correctly within the empty state component';
      render(<EmptyState message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should center message text', () => {
      render(<EmptyState message="Centered" />);

      const message = screen.getByText('Centered');
      expect(message).toHaveClass('text-center');
    });
  });

  describe('Sub-message', () => {
    it('should display sub-message when provided', () => {
      render(<EmptyState message="No data" subMessage="Try adding some items" />);

      expect(screen.getByText('Try adding some items')).toBeInTheDocument();
    });

    it('should not display sub-message when not provided', () => {
      const { container } = render(<EmptyState message="No data" />);

      const subMessage = container.querySelector('.text-sm.text-gray-600');
      expect(subMessage).not.toBeInTheDocument();
    });

    it('should style sub-message correctly', () => {
      render(<EmptyState message="Main" subMessage="Sub text" />);

      const subMessage = screen.getByText('Sub text');
      expect(subMessage).toHaveClass('text-sm', 'text-gray-600', 'text-center', 'mb-4');
      expect(subMessage.tagName).toBe('P');
    });

    it('should handle Japanese sub-message', () => {
      render(<EmptyState message="Main" subMessage="アイテムを追加してください" />);

      expect(screen.getByText('アイテムを追加してください')).toBeInTheDocument();
    });

    it('should not render sub-message for empty string', () => {
      const { container } = render(<EmptyState message="Main" subMessage="" />);

      const subMessage = container.querySelector('.text-sm.text-gray-600');
      expect(subMessage).not.toBeInTheDocument();
    });

    it('should center sub-message text', () => {
      render(<EmptyState message="Main" subMessage="Centered sub" />);

      const subMessage = screen.getByText('Centered sub');
      expect(subMessage).toHaveClass('text-center');
    });
  });

  describe('Action Element', () => {
    it('should render action when provided', () => {
      render(<EmptyState message="No data" action={<button type="button">Add Item</button>} />);

      expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
    });

    it('should not render action container when not provided', () => {
      const { container } = render(<EmptyState message="No data" />);

      const actionContainer = container.querySelector('.mt-4');
      expect(actionContainer).not.toBeInTheDocument();
    });

    it('should render action with link', () => {
      render(<EmptyState message="No data" action={<a href="/create">Create New</a>} />);

      expect(screen.getByText('Create New')).toBeInTheDocument();
    });

    it('should render action with custom JSX', () => {
      render(
        <EmptyState
          message="No data"
          action={
            <div>
              <button type="button">Action 1</button>
              <button type="button">Action 2</button>
            </div>
          }
        />
      );

      expect(screen.getByRole('button', { name: 'Action 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action 2' })).toBeInTheDocument();
    });

    it('should style action container correctly', () => {
      const { container } = render(
        <EmptyState message="No data" action={<button type="button">Action</button>} />
      );

      const actionContainer = container.querySelector('.mt-4');
      expect(actionContainer).toBeInTheDocument();
    });

    it('should handle Japanese action text', () => {
      render(<EmptyState message="データなし" action={<button type="button">追加する</button>} />);

      expect(screen.getByRole('button', { name: '追加する' })).toBeInTheDocument();
    });
  });

  describe('Icon Element', () => {
    it('should render icon when provided', () => {
      render(<EmptyState message="No data" icon={<span data-testid="icon">📦</span>} />);

      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('should not render icon container when not provided', () => {
      const { container } = render(<EmptyState message="No data" />);

      const iconContainer = container.querySelector('.mb-4');
      expect(iconContainer).not.toBeInTheDocument();
    });

    it('should render icon with SVG', () => {
      render(
        <EmptyState
          message="No data"
          icon={
            <svg data-testid="svg-icon" aria-label="Icon">
              <title>Icon</title>
              <circle cx="10" cy="10" r="10" />
            </svg>
          }
        />
      );

      expect(screen.getByTestId('svg-icon')).toBeInTheDocument();
    });

    it('should render icon with image', () => {
      render(
        <EmptyState
          message="No data"
          icon={
            <span role="img" aria-label="Empty icon">
              🚫
            </span>
          }
        />
      );

      expect(screen.getByLabelText('Empty icon')).toBeInTheDocument();
    });

    it('should style icon container correctly', () => {
      const { container } = render(<EmptyState message="No data" icon={<span>Icon</span>} />);

      const iconContainer = container.querySelector('.mb-4');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should render icon before message', () => {
      const { container } = render(
        <EmptyState message="No data" icon={<span data-testid="icon">Icon</span>} />
      );

      const icon = screen.getByTestId('icon');
      const message = screen.getByText('No data');

      // Icon should come before message in DOM
      const emptyState = container.querySelector('output');
      const children = Array.from(emptyState?.children || []);
      const iconIndex = children.indexOf(icon.parentElement!);
      const messageIndex = children.indexOf(message);

      expect(iconIndex).toBeLessThan(messageIndex);
    });
  });

  describe('Complete States', () => {
    it('should render with all props', () => {
      render(
        <EmptyState
          message="No games found"
          subMessage="Create a new game to get started"
          icon={<span data-testid="icon">🎮</span>}
          action={<button type="button">Create Game</button>}
        />
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('No games found')).toBeInTheDocument();
      expect(screen.getByText('Create a new game to get started')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Game' })).toBeInTheDocument();
    });

    it('should render with minimal props (message only)', () => {
      render(<EmptyState message="Empty" />);

      expect(screen.getByText('Empty')).toBeInTheDocument();

      const { container } = render(<EmptyState message="Empty" />);
      const iconContainer = container.querySelector('.mb-4');
      const actionContainer = container.querySelector('.mt-4');

      expect(iconContainer).not.toBeInTheDocument();
      expect(actionContainer).not.toBeInTheDocument();
    });

    it('should render with message and sub-message only', () => {
      render(<EmptyState message="No data" subMessage="Add some items" />);

      expect(screen.getByText('No data')).toBeInTheDocument();
      expect(screen.getByText('Add some items')).toBeInTheDocument();
    });

    it('should render with message and action only', () => {
      render(<EmptyState message="No data" action={<button type="button">Add</button>} />);

      expect(screen.getByText('No data')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render as output element (implicit status role)', () => {
      const { container } = render(<EmptyState message="No data" />);

      const emptyState = container.querySelector('output');
      expect(emptyState).toBeInTheDocument();
      expect(emptyState?.tagName).toBe('OUTPUT');
    });

    it('should have aria-live="polite"', () => {
      const { container } = render(<EmptyState message="No data" />);

      const emptyState = container.querySelector('[aria-live="polite"]');
      expect(emptyState).toBeInTheDocument();
    });

    it('should announce to screen readers', () => {
      render(<EmptyState message="Loading complete, no results" />);

      const message = screen.getByText('Loading complete, no results');
      expect(message).toBeInTheDocument();
    });

    it('should be keyboard accessible when action is focusable', () => {
      render(<EmptyState message="No data" action={<button type="button">Add Item</button>} />);

      const button = screen.getByRole('button', { name: 'Add Item' });
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Layout', () => {
    it('should use flexbox column layout', () => {
      const { container } = render(<EmptyState message="No data" />);

      const emptyState = container.querySelector('output');
      expect(emptyState).toHaveClass('flex', 'flex-col');
    });

    it('should center content horizontally and vertically', () => {
      const { container } = render(<EmptyState message="No data" />);

      const emptyState = container.querySelector('output');
      expect(emptyState).toHaveClass('items-center', 'justify-center');
    });

    it('should have vertical padding', () => {
      const { container } = render(<EmptyState message="No data" />);

      const emptyState = container.querySelector('output');
      expect(emptyState).toHaveClass('py-12');
    });

    it('should have horizontal padding', () => {
      const { container } = render(<EmptyState message="No data" />);

      const emptyState = container.querySelector('output');
      expect(emptyState).toHaveClass('px-4');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long message text', () => {
      const longMessage = 'A'.repeat(200);
      render(<EmptyState message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle special characters in message', () => {
      render(<EmptyState message="No data <>&" />);

      expect(screen.getByText('No data <>&')).toBeInTheDocument();
    });

    it('should handle emoji in message', () => {
      render(<EmptyState message="No games found 🎮" />);

      expect(screen.getByText('No games found 🎮')).toBeInTheDocument();
    });

    it('should handle undefined optional props', () => {
      render(
        <EmptyState message="Main" subMessage={undefined} action={undefined} icon={undefined} />
      );

      expect(screen.getByText('Main')).toBeInTheDocument();
    });

    it('should handle null action', () => {
      render(<EmptyState message="Main" action={null} />);

      expect(screen.getByText('Main')).toBeInTheDocument();
    });

    it('should handle complex action with multiple elements', () => {
      render(
        <EmptyState
          message="No data"
          action={
            <div className="flex gap-2">
              <button type="button">Primary</button>
              <button type="button">Secondary</button>
            </div>
          }
        />
      );

      expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Secondary' })).toBeInTheDocument();
    });
  });
});
