// Component Tests: PresenterEpisodeList
// Test-Driven Development: Write FAILING tests first
// Task: T036

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibilityProvider } from '@/components/ui/AccessibilityProvider';
import { PresenterEpisodeList } from './index';

// Test wrapper with AccessibilityProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AccessibilityProvider>{children}</AccessibilityProvider>
);

describe('PresenterEpisodeList', () => {
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

  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering Presenters', () => {
    it('should render all presenters', () => {
      render(
        <TestWrapper>
          <PresenterEpisodeList
            presenters={mockPresenters}
            selections={{}}
            onSelectEpisode={mockOnSelect}
          />
        </TestWrapper>
      );

      expect(screen.getByText('山田太郎')).toBeInTheDocument();
      expect(screen.getByText('佐藤花子')).toBeInTheDocument();
    });

    it('should render presenter names as headings', () => {
      render(
        <TestWrapper>
          <PresenterEpisodeList
            presenters={mockPresenters}
            selections={{}}
            onSelectEpisode={mockOnSelect}
          />
        </TestWrapper>
      );

      const heading1 = screen.getByRole('heading', { name: '山田太郎' });
      const heading2 = screen.getByRole('heading', { name: '佐藤花子' });

      expect(heading1).toBeInTheDocument();
      expect(heading2).toBeInTheDocument();
    });

    it('should render empty state when no presenters provided', () => {
      render(
        <TestWrapper>
          <PresenterEpisodeList presenters={[]} selections={{}} onSelectEpisode={mockOnSelect} />
        </TestWrapper>
      );

      expect(screen.getByText(/出題者がいません/i)).toBeInTheDocument();
    });

    it('should display all presenter sections', () => {
      render(
        <TestWrapper>
          <PresenterEpisodeList
            presenters={mockPresenters}
            selections={{}}
            onSelectEpisode={mockOnSelect}
          />
        </TestWrapper>
      );

      const sections = screen.getAllByRole('region');
      expect(sections).toHaveLength(2);
    });
  });

  describe('EpisodeSelector Integration', () => {
    it('should render EpisodeSelector for each presenter', () => {
      render(
        <TestWrapper>
          <PresenterEpisodeList
            presenters={mockPresenters}
            selections={{}}
            onSelectEpisode={mockOnSelect}
          />
        </TestWrapper>
      );

      // Check that episodes from both presenters are rendered
      expect(screen.getByText('エピソード1: 初めての成功')).toBeInTheDocument();
      expect(screen.getByText('エピソード1: 転職の決断')).toBeInTheDocument();
    });

    it('should pass correct episodes to each EpisodeSelector', () => {
      render(
        <TestWrapper>
          <PresenterEpisodeList
            presenters={mockPresenters}
            selections={{}}
            onSelectEpisode={mockOnSelect}
          />
        </TestWrapper>
      );

      // Verify presenter 1's episodes
      expect(screen.getByText('エピソード1: 初めての成功')).toBeInTheDocument();
      expect(screen.getByText('エピソード2: 大きな失敗')).toBeInTheDocument();

      // Verify presenter 2's episodes
      expect(screen.getByText('エピソード1: 転職の決断')).toBeInTheDocument();
      expect(screen.getByText('エピソード2: 新しい挑戦')).toBeInTheDocument();
    });

    it('should pass selected episode ID to correct EpisodeSelector', () => {
      const selections = {
        'presenter-1': 'episode-1-2',
        'presenter-2': 'episode-2-1',
      };

      render(
        <TestWrapper>
          <PresenterEpisodeList
            presenters={mockPresenters}
            selections={selections}
            onSelectEpisode={mockOnSelect}
          />
        </TestWrapper>
      );

      const episode1Button = screen.getByRole('button', {
        name: /エピソード2: 大きな失敗/i,
      });
      const episode2Button = screen.getByRole('button', {
        name: /エピソード1: 転職の決断/i,
      });

      expect(episode1Button).toHaveAttribute('data-selected', 'true');
      expect(episode2Button).toHaveAttribute('data-selected', 'true');
    });

    it('should call onSelectEpisode with presenter ID and episode ID', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PresenterEpisodeList
            presenters={mockPresenters}
            selections={{}}
            onSelectEpisode={mockOnSelect}
          />
        </TestWrapper>
      );

      const episodeButton = screen.getByRole('button', {
        name: /エピソード1: 初めての成功/i,
      });

      await user.click(episodeButton);

      expect(mockOnSelect).toHaveBeenCalledWith('presenter-1', 'episode-1-1');
    });

    it('should handle selections from different presenters', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PresenterEpisodeList
            presenters={mockPresenters}
            selections={{}}
            onSelectEpisode={mockOnSelect}
          />
        </TestWrapper>
      );

      const episode1Button = screen.getByRole('button', {
        name: /エピソード1: 初めての成功/i,
      });
      const episode2Button = screen.getByRole('button', {
        name: /エピソード1: 転職の決断/i,
      });

      await user.click(episode1Button);
      await user.click(episode2Button);

      expect(mockOnSelect).toHaveBeenCalledWith('presenter-1', 'episode-1-1');
      expect(mockOnSelect).toHaveBeenCalledWith('presenter-2', 'episode-2-1');
      expect(mockOnSelect).toHaveBeenCalledTimes(2);
    });
  });

  describe('Layout and Styling', () => {
    it('should display presenters in a structured layout', () => {
      render(
        <TestWrapper>
          <PresenterEpisodeList
            presenters={mockPresenters}
            selections={{}}
            onSelectEpisode={mockOnSelect}
          />
        </TestWrapper>
      );

      const container = screen.getByRole('list');
      expect(container).toBeInTheDocument();
    });

    it('should separate presenter sections visually', () => {
      render(
        <TestWrapper>
          <PresenterEpisodeList
            presenters={mockPresenters}
            selections={{}}
            onSelectEpisode={mockOnSelect}
          />
        </TestWrapper>
      );

      const sections = screen.getAllByRole('region');
      sections.forEach((section) => {
        expect(section).toHaveClass('border');
      });
    });

    it('should apply consistent spacing between presenters', () => {
      render(
        <TestWrapper>
          <PresenterEpisodeList
            presenters={mockPresenters}
            selections={{}}
            onSelectEpisode={mockOnSelect}
          />
        </TestWrapper>
      );

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
    });
  });

  describe('Disabled State', () => {
    it('should disable all EpisodeSelectors when disabled', () => {
      render(
        <TestWrapper>
          <PresenterEpisodeList
            presenters={mockPresenters}
            selections={{}}
            onSelectEpisode={mockOnSelect}
            disabled
          />
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('should not call onSelectEpisode when disabled', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PresenterEpisodeList
            presenters={mockPresenters}
            selections={{}}
            onSelectEpisode={mockOnSelect}
            disabled
          />
        </TestWrapper>
      );

      const episodeButton = screen.getByRole('button', {
        name: /エピソード1: 初めての成功/i,
      });

      await user.click(episodeButton);

      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA structure for list', () => {
      render(
        <TestWrapper>
          <PresenterEpisodeList
            presenters={mockPresenters}
            selections={{}}
            onSelectEpisode={mockOnSelect}
          />
        </TestWrapper>
      );

      const list = screen.getByRole('list');
      expect(list).toHaveAccessibleName();
    });

    it('should associate presenter names with their episode groups', () => {
      render(
        <TestWrapper>
          <PresenterEpisodeList
            presenters={mockPresenters}
            selections={{}}
            onSelectEpisode={mockOnSelect}
          />
        </TestWrapper>
      );

      const regions = screen.getAllByRole('region');
      regions.forEach((region) => {
        expect(region).toHaveAccessibleName();
      });
    });

    it('should maintain keyboard navigation across all presenters', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <PresenterEpisodeList
            presenters={mockPresenters}
            selections={{}}
            onSelectEpisode={mockOnSelect}
          />
        </TestWrapper>
      );

      // Tab through all episode buttons
      await user.tab();
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('should handle presenter with no episodes', () => {
      const presentersWithEmpty = [
        {
          id: 'presenter-empty',
          name: '鈴木一郎',
          episodes: [],
        },
      ];

      render(
        <TestWrapper>
          <PresenterEpisodeList
            presenters={presentersWithEmpty}
            selections={{}}
            onSelectEpisode={mockOnSelect}
          />
        </TestWrapper>
      );

      expect(screen.getByText('鈴木一郎')).toBeInTheDocument();
      expect(screen.getByText(/エピソードがありません/i)).toBeInTheDocument();
    });

    it('should handle presenter with many episodes', () => {
      const manyEpisodes = Array.from({ length: 10 }, (_, i) => ({
        id: `episode-${i}`,
        text: `エピソード${i + 1}: テスト`,
      }));

      const presenterWithMany = [
        {
          id: 'presenter-many',
          name: '田中次郎',
          episodes: manyEpisodes,
        },
      ];

      render(
        <TestWrapper>
          <PresenterEpisodeList
            presenters={presenterWithMany}
            selections={{}}
            onSelectEpisode={mockOnSelect}
          />
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(10);
    });

    it('should handle partial selections', () => {
      const selections = {
        'presenter-1': 'episode-1-1',
        // presenter-2 has no selection
      };

      render(
        <TestWrapper>
          <PresenterEpisodeList
            presenters={mockPresenters}
            selections={selections}
            onSelectEpisode={mockOnSelect}
          />
        </TestWrapper>
      );

      const selectedButton = screen.getByRole('button', {
        name: /エピソード1: 初めての成功/i,
      });
      expect(selectedButton).toHaveAttribute('data-selected', 'true');

      const unselectedButton = screen.getByRole('button', {
        name: /エピソード1: 転職の決断/i,
      });
      expect(unselectedButton).toHaveAttribute('data-selected', 'false');
    });

    it('should handle very long presenter names', () => {
      const longNamePresenters = [
        {
          id: 'presenter-long',
          name: 'これは非常に長い出題者名で、通常の表示範囲を超える可能性があります',
          episodes: [{ id: 'ep-1', text: 'エピソード1' }],
        },
      ];

      render(
        <TestWrapper>
          <PresenterEpisodeList
            presenters={longNamePresenters}
            selections={{}}
            onSelectEpisode={mockOnSelect}
          />
        </TestWrapper>
      );

      expect(
        screen.getByText('これは非常に長い出題者名で、通常の表示範囲を超える可能性があります')
      ).toBeInTheDocument();
    });
  });
});
