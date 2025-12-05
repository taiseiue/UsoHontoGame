/**
 * Focus Trap Utility
 * Feature: 009-apple-hig-ui-redesign - Phase 7: Accessibility
 * Trap focus within a container (e.g., modals, dialogs)
 */

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  const elements = Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));
  return elements.filter(
    (el) =>
      !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden') && el.offsetParent !== null
  );
}

/**
 * Focus trap handler
 */
export function createFocusTrap(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  // Focus first element on mount
  firstFocusable?.focus();

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    // Shift + Tab (backwards)
    if (event.shiftKey) {
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable?.focus();
      }
    }
    // Tab (forwards)
    else {
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}
