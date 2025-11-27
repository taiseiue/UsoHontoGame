/**
 * GameStatusBadge Component
 * Feature: 004-status-transition, Enhanced feedback
 * Displays current game status with appropriate styling and smooth animations
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useAccessibility } from '@/components/ui/AccessibilityProvider';
import { animationSequences } from '@/lib/animations';
import type { GameStatusValue } from '@/server/domain/value-objects/GameStatus';

export interface GameStatusBadgeProps {
  status: GameStatusValue;
  className?: string;
  animated?: boolean;
}

/**
 * Badge component that displays game status with color-coded styling and animations
 */
export function GameStatusBadge({
  status,
  className = '',
  animated = false,
}: GameStatusBadgeProps) {
  const [previousStatus, setPreviousStatus] = useState<GameStatusValue>(status);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const { announceStatusChange } = useAccessibility();

  useEffect(() => {
    if (animated && previousStatus !== status && badgeRef.current) {
      // Announce status change to screen readers
      announceStatusChange(previousStatus, status);

      // Status changed, play animation
      animationSequences.statusBadgeUpdate(badgeRef.current, () => {
        setPreviousStatus(status);
      });

      // Highlight for a moment
      setIsHighlighted(true);
      const timeout = setTimeout(() => setIsHighlighted(false), 2000);

      return () => clearTimeout(timeout);
    } else {
      setPreviousStatus(status);
    }
  }, [status, previousStatus, animated, announceStatusChange]);
  const getStatusConfig = (status: GameStatusValue) => {
    switch (status) {
      case '準備中':
        return {
          label: '準備中',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          ariaLabel: 'ゲームは準備中です',
        };
      case '出題中':
        return {
          label: '出題中',
          className: 'bg-green-100 text-green-800 border-green-200',
          ariaLabel: 'ゲームは出題中です',
        };
      case '締切':
        return {
          label: '締切',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          ariaLabel: 'ゲームは締切です',
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          ariaLabel: `ゲームステータス: ${status}`,
        };
    }
  };

  const config = getStatusConfig(status);

  const highlightClasses = isHighlighted ? 'ring-4 ring-blue-300 ring-opacity-50 scale-110' : '';

  return (
    <output
      ref={badgeRef}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-300 ${config.className} ${highlightClasses} ${className}`}
      aria-label={config.ariaLabel}
      aria-live={animated ? 'polite' : undefined}
    >
      {config.label}
    </output>
  );
}

/**
 * Large variant of the GameStatusBadge for prominent display
 */
export function GameStatusBadgeLarge({
  status,
  className = '',
  animated = false,
}: GameStatusBadgeProps) {
  const [previousStatus, setPreviousStatus] = useState<GameStatusValue>(status);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const { announceStatusChange } = useAccessibility();

  useEffect(() => {
    if (animated && previousStatus !== status && badgeRef.current) {
      // Announce status change to screen readers
      announceStatusChange(previousStatus, status);

      // Status changed, play animation
      animationSequences.statusBadgeUpdate(badgeRef.current, () => {
        setPreviousStatus(status);
      });

      // Highlight for a moment
      setIsHighlighted(true);
      const timeout = setTimeout(() => setIsHighlighted(false), 2000);

      return () => clearTimeout(timeout);
    } else {
      setPreviousStatus(status);
    }
  }, [status, previousStatus, animated, announceStatusChange]);
  const getStatusConfig = (status: GameStatusValue) => {
    switch (status) {
      case '準備中':
        return {
          label: '準備中',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          ariaLabel: 'ゲームは準備中です',
        };
      case '出題中':
        return {
          label: '出題中',
          className: 'bg-green-100 text-green-800 border-green-300',
          ariaLabel: 'ゲームは出題中です',
        };
      case '締切':
        return {
          label: '締切',
          className: 'bg-gray-100 text-gray-800 border-gray-300',
          ariaLabel: 'ゲームは締切です',
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-300',
          ariaLabel: `ゲームステータス: ${status}`,
        };
    }
  };

  const config = getStatusConfig(status);

  const highlightClasses = isHighlighted ? 'ring-4 ring-blue-300 ring-opacity-50 scale-110' : '';

  return (
    <output
      ref={badgeRef}
      className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all duration-300 ${config.className} ${highlightClasses} ${className}`}
      aria-label={config.ariaLabel}
      aria-live={animated ? 'polite' : undefined}
    >
      {config.label}
    </output>
  );
}
