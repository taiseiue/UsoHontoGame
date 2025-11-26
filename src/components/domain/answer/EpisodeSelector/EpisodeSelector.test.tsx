// Component Tests: EpisodeSelector
// Test-Driven Development: Write FAILING tests first
// Task: T035

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibilityProvider } from '@/components/ui/AccessibilityProvider';
import { EpisodeSelector } from './index';

// Test wrapper with AccessibilityProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AccessibilityProvider>{children}</AccessibilityProvider>
);

describe('EpisodeSelector', () => {
  const mockEpisodes = [
    { id: 'episode-1', text: 'エピソード1: 初めての挑戦' },
    { id: 'episode-2', text: 'エピソード2: 成功への道' },
    { id: 'episode-3', text: 'エピソード3: 困難を乗り越えて' },
  ];

  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering Episodes', () => {
    it('should render all episodes', () => {
      render(
        <TestWrapper>
          <EpisodeSelector
            episodes={mockEpisodes}
            selectedEpisodeId={null}
            onSelect={mockOnSelect}
          />
        </TestWrapper>
      );

      expect(screen.getByText('エピソード1: 初めての挑戦')).toBeInTheDocument();
      expect(screen.getByText('エピソード2: 成功への道')).toBeInTheDocument();
      expect(screen.getByText('エピソード3: 困難を乗り越えて')).toBeInTheDocument();
    });

    it('should render episodes as buttons', () => {
      render(
        <TestWrapper>
          <EpisodeSelector
            episodes={mockEpisodes}
            selectedEpisodeId={null}
            onSelect={mockOnSelect}
          />
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });

    it('should render empty state when no episodes provided', () => {
      render(
        <TestWrapper>
          <EpisodeSelector episodes={[]} selectedEpisodeId={null} onSelect={mockOnSelect} />
        </TestWrapper>
      );

      expect(screen.getByText(/エピソードがありません/i)).toBeInTheDocument();
    });

    it('should display episode text correctly', () => {
      render(
        <TestWrapper>
          <EpisodeSelector
            episodes={[mockEpisodes[0]!]}
            selectedEpisodeId={null}
            onSelect={mockOnSelect}
          />
        </TestWrapper>
      );

      const episodeButton = screen.getByRole('button', {
        name: /エピソード1: 初めての挑戦/i,
      });
      expect(episodeButton).toBeInTheDocument();
    });
  });

  describe('Selection Highlighting', () => {
    it('should highlight selected episode', () => {
      render(
        <TestWrapper>
          <EpisodeSelector
            episodes={mockEpisodes}
            selectedEpisodeId="episode-2"
            onSelect={mockOnSelect}
          />
        </TestWrapper>
      );

      const selectedButton = screen.getByRole('button', {
        name: /エピソード2: 成功への道/i,
      });
      expect(selectedButton).toHaveAttribute('data-selected', 'true');
    });

    it('should not highlight unselected episodes', () => {
      render(
        <TestWrapper>
          <EpisodeSelector
            episodes={mockEpisodes}
            selectedEpisodeId="episode-2"
            onSelect={mockOnSelect}
          />
        </TestWrapper>
      );

      const unselectedButton1 = screen.getByRole('button', {
        name: /エピソード1: 初めての挑戦/i,
      });
      const unselectedButton3 = screen.getByRole('button', {
        name: /エピソード3: 困難を乗り越えて/i,
      });

      expect(unselectedButton1).toHaveAttribute('data-selected', 'false');
      expect(unselectedButton3).toHaveAttribute('data-selected', 'false');
    });

    it('should apply visual styling to selected episode', () => {
      render(
        <TestWrapper>
          <EpisodeSelector
            episodes={mockEpisodes}
            selectedEpisodeId="episode-1"
            onSelect={mockOnSelect}
          />
        </TestWrapper>
      );

      const selectedButton = screen.getByRole('button', {
        name: /エピソード1: 初めての挑戦/i,
      });

      // Check for selected styling classes
      expect(selectedButton).toHaveClass('bg-blue-100', 'border-blue-500');
    });

    it('should handle no selection gracefully', () => {
      render(
        <TestWrapper>
          <EpisodeSelector
            episodes={mockEpisodes}
            selectedEpisodeId={null}
            onSelect={mockOnSelect}
          />
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      for (const button of buttons) {
        expect(button).toHaveAttribute('data-selected', 'false');
      }
    });
  });

  describe('Selection Callback', () => {
    it('should call onSelect when episode is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EpisodeSelector
            episodes={mockEpisodes}
            selectedEpisodeId={null}
            onSelect={mockOnSelect}
          />
        </TestWrapper>
      );

      const episodeButton = screen.getByRole('button', {
        name: /エピソード1: 初めての挑戦/i,
      });

      await user.click(episodeButton);

      expect(mockOnSelect).toHaveBeenCalledWith('episode-1');
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it('should call onSelect with correct episode ID for each episode', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EpisodeSelector
            episodes={mockEpisodes}
            selectedEpisodeId={null}
            onSelect={mockOnSelect}
          />
        </TestWrapper>
      );

      const episode2Button = screen.getByRole('button', {
        name: /エピソード2: 成功への道/i,
      });

      await user.click(episode2Button);

      expect(mockOnSelect).toHaveBeenCalledWith('episode-2');
    });

    it('should allow re-selecting the same episode', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EpisodeSelector
            episodes={mockEpisodes}
            selectedEpisodeId="episode-1"
            onSelect={mockOnSelect}
          />
        </TestWrapper>
      );

      const selectedButton = screen.getByRole('button', {
        name: /エピソード1: 初めての挑戦/i,
      });

      await user.click(selectedButton);

      expect(mockOnSelect).toHaveBeenCalledWith('episode-1');
    });

    it('should not call onSelect for disabled episodes', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EpisodeSelector
            episodes={mockEpisodes}
            selectedEpisodeId={null}
            onSelect={mockOnSelect}
            disabled
          />
        </TestWrapper>
      );

      const episodeButton = screen.getByRole('button', {
        name: /エピソード1: 初めての挑戦/i,
      });

      await user.click(episodeButton);

      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <EpisodeSelector
            episodes={mockEpisodes}
            selectedEpisodeId={null}
            onSelect={mockOnSelect}
          />
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      for (const button of buttons) {
        expect(button).toHaveAccessibleName();
      }
    });

    it('should indicate selected state via aria-pressed', () => {
      render(
        <TestWrapper>
          <EpisodeSelector
            episodes={mockEpisodes}
            selectedEpisodeId="episode-2"
            onSelect={mockOnSelect}
          />
        </TestWrapper>
      );

      const selectedButton = screen.getByRole('button', {
        name: /エピソード2: 成功への道/i,
      });
      const unselectedButton = screen.getByRole('button', {
        name: /エピソード1: 初めての挑戦/i,
      });

      expect(selectedButton).toHaveAttribute('aria-pressed', 'true');
      expect(unselectedButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EpisodeSelector
            episodes={mockEpisodes}
            selectedEpisodeId={null}
            onSelect={mockOnSelect}
          />
        </TestWrapper>
      );

      const firstButton = screen.getByRole('button', {
        name: /エピソード1: 初めての挑戦/i,
      });

      await user.tab();
      expect(firstButton).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(mockOnSelect).toHaveBeenCalledWith('episode-1');
    });

    it('should disable all buttons when disabled prop is true', () => {
      render(
        <TestWrapper>
          <EpisodeSelector
            episodes={mockEpisodes}
            selectedEpisodeId={null}
            onSelect={mockOnSelect}
            disabled
          />
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      for (const button of buttons) {
        expect(button).toBeDisabled();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long episode text', () => {
      const longEpisodes = [
        {
          id: 'episode-long',
          text: 'エピソード: これは非常に長いエピソードテキストで、通常の表示範囲を超える可能性があります。このようなケースでも適切に表示されることを確認します。',
        },
      ];

      render(
        <TestWrapper>
          <EpisodeSelector
            episodes={longEpisodes}
            selectedEpisodeId={null}
            onSelect={mockOnSelect}
          />
        </TestWrapper>
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle special characters in episode text', () => {
      const specialEpisodes = [
        {
          id: 'episode-special',
          text: 'エピソード: "特殊文字" & <記号> を含む',
        },
      ];

      render(
        <TestWrapper>
          <EpisodeSelector
            episodes={specialEpisodes}
            selectedEpisodeId={null}
            onSelect={mockOnSelect}
          />
        </TestWrapper>
      );

      expect(screen.getByText('エピソード: "特殊文字" & <記号> を含む')).toBeInTheDocument();
    });

    it('should handle rapid selection changes', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EpisodeSelector
            episodes={mockEpisodes}
            selectedEpisodeId={null}
            onSelect={mockOnSelect}
          />
        </TestWrapper>
      );

      const button1 = screen.getByRole('button', {
        name: /エピソード1: 初めての挑戦/i,
      });
      const button2 = screen.getByRole('button', {
        name: /エピソード2: 成功への道/i,
      });

      await user.click(button1);
      await user.click(button2);
      await user.click(button1);

      expect(mockOnSelect).toHaveBeenCalledTimes(3);
    });
  });
});
