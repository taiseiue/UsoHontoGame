/**
 * Screen Reader Announcer
 * Feature: 009-apple-hig-ui-redesign - Phase 7: Accessibility
 * Announce messages to screen readers using ARIA live regions
 */

type AriaLive = 'polite' | 'assertive' | 'off';

let liveRegion: HTMLDivElement | null = null;

/**
 * Initialize live region for announcements
 */
function initializeLiveRegion(): HTMLDivElement {
  if (liveRegion) return liveRegion;

  liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.style.position = 'absolute';
  liveRegion.style.left = '-10000px';
  liveRegion.style.width = '1px';
  liveRegion.style.height = '1px';
  liveRegion.style.overflow = 'hidden';

  document.body.appendChild(liveRegion);
  return liveRegion;
}

/**
 * Announce a message to screen readers
 *
 * @param message - The message to announce
 * @param priority - The priority level ('polite' or 'assertive')
 *
 * @example
 * ```tsx
 * announce('Form submitted successfully');
 * announce('Error occurred', 'assertive');
 * ```
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const region = initializeLiveRegion();
  region.setAttribute('aria-live', priority);

  // Clear first to ensure announcement even for repeated messages
  region.textContent = '';

  // Announce after a brief delay
  setTimeout(() => {
    region.textContent = message;
  }, 100);

  // Clear after announcement
  setTimeout(() => {
    region.textContent = '';
  }, 5000);
}

/**
 * Remove the live region (cleanup)
 */
export function cleanupAnnouncer(): void {
  if (liveRegion && liveRegion.parentNode) {
    liveRegion.parentNode.removeChild(liveRegion);
    liveRegion = null;
  }
}
