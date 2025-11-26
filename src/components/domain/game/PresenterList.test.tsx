// Component Tests: PresenterList
// Feature: 002-game-preparation
// Tests for presenter list with CRUD operations

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import type { PresenterWithLieDto } from '@/server/application/dto/PresenterWithLieDto';
import { PresenterList } from './PresenterList';

// Mock server action
vi.mock('@/app/actions/presenter', () => ({
  removePresenterAction: vi.fn(),
}));

import { removePresenterAction } from '@/app/actions/presenter';

const mockRemovePresenterAction = removePresenterAction as Mock;

// Mock window.confirm and alert
const originalConfirm = window.confirm;
const originalAlert = window.alert;

describe('PresenterList', () => {
  const mockOnPresenterRemoved = vi.fn();
  const mockOnPresenterSelected = vi.fn();

  const completePresenters: PresenterWithLieDto[] = [
    {
      id: 'presenter-1',
      gameId: 'game-123',
      nickname: '太郎',
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
          isLie: true,
          createdAt: new Date(),
        },
        {
          id: 'ep3',
          presenterId: 'presenter-1',
          text: 'エピソード3',
          isLie: false,
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
    },
  ];

  const incompletePresenters: PresenterWithLieDto[] = [
    {
      id: 'presenter-2',
      gameId: 'game-123',
      nickname: '花子',
      episodes: [
        {
          id: 'ep4',
          presenterId: 'presenter-2',
          text: 'エピソード1',
          isLie: false,
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
    },
  ];

  const defaultProps = {
    presenters: completePresenters,
    gameId: 'game-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true); // Auto-confirm by default
    window.alert = vi.fn();
  });

  afterEach(() => {
    window.confirm = originalConfirm;
    window.alert = originalAlert;
  });

  describe('Empty State', () => {
    it('should show empty message when no presenters', () => {
      render(<PresenterList {...defaultProps} presenters={[]} />);

      expect(screen.getByText('プレゼンターが登録されていません')).toBeInTheDocument();
    });

    it('should not show presenter list when empty', () => {
      render(<PresenterList {...defaultProps} presenters={[]} />);

      expect(screen.queryByText('太郎')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '削除' })).not.toBeInTheDocument();
    });
  });

  describe('Rendering Presenters', () => {
    it('should render presenter nickname', () => {
      render(<PresenterList {...defaultProps} />);

      expect(screen.getByText('太郎')).toBeInTheDocument();
    });

    it('should render episode count', () => {
      render(<PresenterList {...defaultProps} />);

      expect(screen.getByText(/エピソード: 3\/3/)).toBeInTheDocument();
    });

    it('should render multiple presenters', () => {
      const multiplePresenters = [...completePresenters, ...incompletePresenters];

      render(<PresenterList {...defaultProps} presenters={multiplePresenters} />);

      expect(screen.getByText('太郎')).toBeInTheDocument();
      expect(screen.getByText('花子')).toBeInTheDocument();
    });
  });

  describe('Completion Status', () => {
    it('should show completed status when 3 episodes with lie', () => {
      render(<PresenterList {...defaultProps} />);

      expect(screen.getByText('✓ 完了')).toBeInTheDocument();
    });

    it('should show incomplete status when less than 3 episodes', () => {
      render(<PresenterList {...defaultProps} presenters={incompletePresenters} />);

      expect(screen.getByText('未完了')).toBeInTheDocument();
    });

    it('should show incomplete status when 3 episodes but no lie', () => {
      const presentersWithoutLie: PresenterWithLieDto[] = [
        {
          id: 'presenter-3',
          gameId: 'game-123',
          nickname: '次郎',
          episodes: [
            {
              id: 'ep5',
              presenterId: 'presenter-3',
              text: 'エピソード1',
              isLie: false,
              createdAt: new Date(),
            },
            {
              id: 'ep6',
              presenterId: 'presenter-3',
              text: 'エピソード2',
              isLie: false,
              createdAt: new Date(),
            },
            {
              id: 'ep7',
              presenterId: 'presenter-3',
              text: 'エピソード3',
              isLie: false,
              createdAt: new Date(),
            },
          ],
          createdAt: new Date(),
        },
      ];

      render(<PresenterList {...defaultProps} presenters={presentersWithoutLie} />);

      expect(screen.getByText('未完了')).toBeInTheDocument();
    });
  });

  describe('Episode Display', () => {
    it('should render all episodes', () => {
      render(<PresenterList {...defaultProps} />);

      expect(screen.getByText('エピソード1')).toBeInTheDocument();
      expect(screen.getByText('エピソード2')).toBeInTheDocument();
      expect(screen.getByText('エピソード3')).toBeInTheDocument();
    });

    it('should render episode numbers', () => {
      render(<PresenterList {...defaultProps} />);

      expect(screen.getByText('エピソード 1')).toBeInTheDocument();
      expect(screen.getByText('エピソード 2')).toBeInTheDocument();
      expect(screen.getByText('エピソード 3')).toBeInTheDocument();
    });

    it('should show lie marker badge for lie episode', () => {
      render(<PresenterList {...defaultProps} />);

      expect(screen.getByText('ウソ')).toBeInTheDocument();
    });

    it('should apply special styling to lie episode', () => {
      render(<PresenterList {...defaultProps} />);

      const lieEpisode = screen.getByText('エピソード2').closest('div');
      expect(lieEpisode).toHaveClass('border-red-300');
      expect(lieEpisode).toHaveClass('bg-red-50');
    });

    it('should apply normal styling to non-lie episodes', () => {
      render(<PresenterList {...defaultProps} />);

      const normalEpisode = screen.getByText('エピソード1').closest('div');
      expect(normalEpisode).toHaveClass('border-gray-200');
      expect(normalEpisode).toHaveClass('bg-gray-50');
    });

    it('should not show episodes section when no episodes', () => {
      const presenterWithoutEpisodes: PresenterWithLieDto[] = [
        {
          id: 'presenter-4',
          gameId: 'game-123',
          nickname: '三郎',
          episodes: [],
          createdAt: new Date(),
        },
      ];

      render(<PresenterList {...defaultProps} presenters={presenterWithoutEpisodes} />);

      expect(screen.queryByText(/エピソード \d/)).not.toBeInTheDocument();
    });
  });

  describe('Episode Add Button', () => {
    it('should show エピソード追加 button for incomplete presenter', () => {
      render(<PresenterList {...defaultProps} presenters={incompletePresenters} />);

      expect(screen.getByRole('button', { name: 'エピソード追加' })).toBeInTheDocument();
    });

    it('should not show エピソード追加 button for complete presenter', () => {
      render(<PresenterList {...defaultProps} />);

      expect(screen.queryByRole('button', { name: 'エピソード追加' })).not.toBeInTheDocument();
    });

    it('should call onPresenterSelected when エピソード追加 is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PresenterList
          {...defaultProps}
          presenters={incompletePresenters}
          onPresenterSelected={mockOnPresenterSelected}
        />
      );

      await user.click(screen.getByRole('button', { name: 'エピソード追加' }));

      expect(mockOnPresenterSelected).toHaveBeenCalledWith('presenter-2');
    });

    it('should work without onPresenterSelected callback', async () => {
      const user = userEvent.setup();
      render(<PresenterList {...defaultProps} presenters={incompletePresenters} />);

      await user.click(screen.getByRole('button', { name: 'エピソード追加' }));

      // Should not throw error
    });
  });

  describe('Delete Button', () => {
    it('should show delete button for all presenters', () => {
      const multiplePresenters = [...completePresenters, ...incompletePresenters];
      render(<PresenterList {...defaultProps} presenters={multiplePresenters} />);

      const deleteButtons = screen.getAllByRole('button', { name: '削除' });
      expect(deleteButtons).toHaveLength(2);
    });

    it('should show confirmation dialog when delete is clicked', async () => {
      const mockConfirm = vi.fn(() => false);
      window.confirm = mockConfirm;

      const user = userEvent.setup();
      render(<PresenterList {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: '削除' }));

      expect(mockConfirm).toHaveBeenCalledWith('このプレゼンターを削除しますか？');
    });

    it('should not proceed if confirmation is cancelled', async () => {
      window.confirm = vi.fn(() => false);
      mockRemovePresenterAction.mockResolvedValue({ success: true });

      const user = userEvent.setup();
      render(<PresenterList {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: '削除' }));

      expect(mockRemovePresenterAction).not.toHaveBeenCalled();
    });
  });

  describe('Delete - Success', () => {
    it('should call removePresenterAction with correct params', async () => {
      mockRemovePresenterAction.mockResolvedValue({ success: true });

      const user = userEvent.setup();
      render(<PresenterList {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: '削除' }));

      await waitFor(() => {
        expect(mockRemovePresenterAction).toHaveBeenCalled();
        const formData = mockRemovePresenterAction.mock.calls[0][0];
        expect(formData.get('gameId')).toBe('game-123');
        expect(formData.get('presenterId')).toBe('presenter-1');
      });
    });

    it('should call onPresenterRemoved callback on success', async () => {
      mockRemovePresenterAction.mockResolvedValue({ success: true });

      const user = userEvent.setup();
      render(<PresenterList {...defaultProps} onPresenterRemoved={mockOnPresenterRemoved} />);

      await user.click(screen.getByRole('button', { name: '削除' }));

      await waitFor(() => {
        expect(mockOnPresenterRemoved).toHaveBeenCalled();
      });
    });

    it('should show loading state during deletion', async () => {
      mockRemovePresenterAction.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      const user = userEvent.setup();
      render(<PresenterList {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: '削除' }));

      expect(screen.getByRole('button', { name: '削除中...' })).toBeInTheDocument();
    });

    it('should disable button during deletion', async () => {
      mockRemovePresenterAction.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      const user = userEvent.setup();
      render(<PresenterList {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: '削除' }));

      const button = screen.getByRole('button', { name: '削除中...' });
      expect(button).toBeDisabled();
    });

    it('should work without onPresenterRemoved callback', async () => {
      mockRemovePresenterAction.mockResolvedValue({ success: true });

      const user = userEvent.setup();
      render(<PresenterList {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: '削除' }));

      await waitFor(() => {
        expect(mockRemovePresenterAction).toHaveBeenCalled();
      });

      // Should not throw error
    });
  });

  describe('Delete - Error', () => {
    it('should show alert on deletion failure', async () => {
      const mockAlert = vi.fn();
      window.alert = mockAlert;

      const errorMessage = 'プレゼンターの削除に失敗しました';
      mockRemovePresenterAction.mockResolvedValue({
        success: false,
        errors: { _form: [errorMessage] },
      });

      const user = userEvent.setup();
      render(<PresenterList {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: '削除' }));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(errorMessage);
      });
    });

    it('should show default error message when no specific error', async () => {
      const mockAlert = vi.fn();
      window.alert = mockAlert;

      mockRemovePresenterAction.mockResolvedValue({
        success: false,
        errors: {},
      });

      const user = userEvent.setup();
      render(<PresenterList {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: '削除' }));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('プレゼンターの削除に失敗しました');
      });
    });

    it('should handle exception during deletion', async () => {
      const mockAlert = vi.fn();
      window.alert = mockAlert;

      mockRemovePresenterAction.mockRejectedValue(new Error('Network error'));

      const user = userEvent.setup();
      render(<PresenterList {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: '削除' }));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('プレゼンターの削除に失敗しました');
      });
    });

    it('should not call onPresenterRemoved on failure', async () => {
      mockRemovePresenterAction.mockResolvedValue({
        success: false,
        errors: { _form: ['エラー'] },
      });

      const user = userEvent.setup();
      render(<PresenterList {...defaultProps} onPresenterRemoved={mockOnPresenterRemoved} />);

      await user.click(screen.getByRole('button', { name: '削除' }));

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalled();
      });

      expect(mockOnPresenterRemoved).not.toHaveBeenCalled();
    });
  });

  describe('Multiple Presenters', () => {
    it('should handle deleting specific presenter from list', async () => {
      mockRemovePresenterAction.mockResolvedValue({ success: true });

      const multiplePresenters = [...completePresenters, ...incompletePresenters];
      const user = userEvent.setup();
      render(<PresenterList {...defaultProps} presenters={multiplePresenters} />);

      const deleteButtons = screen.getAllByRole('button', { name: '削除' });
      await user.click(deleteButtons[1]); // Delete second presenter

      await waitFor(() => {
        const formData = mockRemovePresenterAction.mock.calls[0][0];
        expect(formData.get('presenterId')).toBe('presenter-2');
      });
    });

    it('should only disable the deleting presenter button', async () => {
      mockRemovePresenterAction.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      const multiplePresenters = [...completePresenters, ...incompletePresenters];
      const user = userEvent.setup();
      render(<PresenterList {...defaultProps} presenters={multiplePresenters} />);

      const deleteButtons = screen.getAllByRole('button', { name: '削除' });
      await user.click(deleteButtons[1]);

      // Second presenter's button should show loading
      expect(screen.getByRole('button', { name: '削除中...' })).toBeInTheDocument();

      // First presenter's button should still show normal text
      expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      render(<PresenterList {...defaultProps} presenters={incompletePresenters} />);

      expect(screen.getByRole('button', { name: 'エピソード追加' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument();
    });

    it('should indicate disabled state visually', async () => {
      mockRemovePresenterAction.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      const user = userEvent.setup();
      render(<PresenterList {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: '削除' }));

      const button = screen.getByRole('button', { name: '削除中...' });
      expect(button).toHaveClass('disabled:opacity-50');
    });

    it('should have descriptive text for completion status', () => {
      render(<PresenterList {...defaultProps} />);

      expect(screen.getByText('✓ 完了')).toBeInTheDocument();
    });

    it('should have clear lie marker indicator', () => {
      render(<PresenterList {...defaultProps} />);

      const lieMarker = screen.getByText('ウソ');
      expect(lieMarker).toBeInTheDocument();
      expect(lieMarker).toHaveClass('font-bold');
    });
  });
});
