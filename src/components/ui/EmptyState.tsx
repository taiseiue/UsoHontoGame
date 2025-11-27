/**
 * EmptyState Component
 * Feature: 005-top-active-games
 *
 * Displays a friendly message when no data is available
 * Reusable across different contexts (no games, no results, etc.)
 */

import type { ReactNode } from 'react';

export interface EmptyStateProps {
  /** Main message to display */
  message: string;
  /** Optional sub-message for additional guidance */
  subMessage?: string;
  /** Optional action element (button, link, etc.) */
  action?: ReactNode;
  /** Optional icon or illustration */
  icon?: ReactNode;
}

export function EmptyState({ message, subMessage, action, icon }: EmptyStateProps) {
  return (
    <output className="flex flex-col items-center justify-center py-12 px-4" aria-live="polite">
      {icon && <div className="mb-4">{icon}</div>}

      <p className="text-lg font-medium text-gray-900 text-center mb-2">{message}</p>

      {subMessage && <p className="text-sm text-gray-600 text-center mb-4">{subMessage}</p>}

      {action && <div className="mt-4">{action}</div>}
    </output>
  );
}
