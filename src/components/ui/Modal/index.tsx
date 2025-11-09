'use client';

import type React from 'react';
import { useEffect, useRef } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Modal component - Reusable modal dialog
 * Uses 'use client' because it uses browser APIs (useEffect, focus management)
 */
export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Store previously focused element
      const previouslyFocused = document.activeElement as HTMLElement;

      // Focus trap: focus first focusable element
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0] as HTMLElement | undefined;
      const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement | undefined;

      if (firstElement) {
        firstElement.focus();
      }

      // Handle Tab key for focus trap
      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab' && focusableElements && focusableElements.length > 0) {
          // Trap focus within modal
          if (e.shiftKey) {
            // Shift + Tab: move to previous element
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement?.focus();
            }
          } else {
            // Tab: move to next element
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement?.focus();
            }
          }
        }
      };

      // Close on Escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';

      document.addEventListener('keydown', handleTab);
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('keydown', handleTab);
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';

        // Restore focus to previously focused element
        if (previouslyFocused) {
          previouslyFocused.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title" className="text-xl font-semibold mb-4">
          {title}
        </h2>
        <div className="mb-6">{children}</div>
        {footer && <div className="flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
