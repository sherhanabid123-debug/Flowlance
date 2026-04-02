'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useCallback } from 'react';

/**
 * A custom hook to intercept actions that require authentication.
 * If user is not authenticated, it opens the login modal and 
 * queues the action to be run after a successful login.
 */
export function useAuthBarrier() {
  const { isAuthenticated, openLoginModal } = useAuthStore();

  const runProtected = useCallback(
    (action: () => void) => {
      if (isAuthenticated) {
        action();
      } else {
        // Open modal and queue the action
        openLoginModal(action);
      }
    },
    [isAuthenticated, openLoginModal]
  );

  return { runProtected, isAuthenticated };
}
