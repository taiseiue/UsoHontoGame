// App Router Page: TOP/Home
// Feature: 001-session-top-page, 005-top-active-games, 006-results-dashboard
// Server Component that handles session management and delegates to TopPage components

import { createSessionAction, validateSessionAction } from '@/app/actions/session';
import { TopPageNicknameSetup } from '@/components/pages/TopPage';
import { TopPageWithData } from '@/components/pages/TopPage/TopPageWithData';

/**
 * Next.js App Router page for /
 * Handles session validation, session creation, and state routing
 *
 * Feature 005: Now uses TopPageWithData with auto-refresh capability
 * Feature 006: Passes sessionId for dashboard authorization
 */
export default async function Page() {
  // 1. Validate existing session
  let session = await validateSessionAction();

  // 2. Create new session if none exists
  if (!session.valid) {
    const createResult = await createSessionAction();
    if (createResult.success) {
      session = await validateSessionAction();
    }
  }

  // 3. Show nickname setup if user doesn't have nickname
  if (!session.hasNickname) {
    return <TopPageNicknameSetup />;
  }

  // 4. Render page component with auto-refresh (Feature 005)
  // Data fetching now happens in Client Component with React Query
  // Pass sessionId for dashboard authorization (Feature 006)
  return (
    <TopPageWithData nickname={session.nickname || ''} currentSessionId={session.sessionId || ''} />
  );
}
