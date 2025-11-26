// Custom Hook: useParticipantSession
// Fetches and provides participant session data (sessionId, nickname)

'use client';

import { useEffect, useState } from 'react';
import { validateSessionAction } from '@/app/actions/session';

export interface ParticipantSession {
  isLoading: boolean;
  isValid: boolean;
  sessionId: string | null;
  nickname: string | null;
  hasNickname: boolean;
}

export function useParticipantSession(): ParticipantSession {
  const [session, setSession] = useState<ParticipantSession>({
    isLoading: true,
    isValid: false,
    sessionId: null,
    nickname: null,
    hasNickname: false,
  });

  useEffect(() => {
    async function fetchSession() {
      try {
        const result = await validateSessionAction();

        setSession({
          isLoading: false,
          isValid: result.valid,
          sessionId: result.sessionId,
          nickname: result.nickname,
          hasNickname: result.hasNickname,
        });
      } catch (error) {
        console.error('Failed to fetch session:', error);
        setSession({
          isLoading: false,
          isValid: false,
          sessionId: null,
          nickname: null,
          hasNickname: false,
        });
      }
    }

    fetchSession();
  }, []);

  return session;
}
