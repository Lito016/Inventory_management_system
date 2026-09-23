import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from './use-auth';
import { SESSION_TIMEOUT_MS } from '@/lib/constants';

export function useSessionTimeout() {
  const { signOut, session } = useAuth();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      signOut();
    }, SESSION_TIMEOUT_MS);
  }, [signOut]);

  useEffect(() => {
    if (!session) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimer();

    events.forEach((event) => window.addEventListener(event, handleActivity));
    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [session, resetTimer]);
}
