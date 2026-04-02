'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { useRouter } from 'next/navigation';

export function useAuthAction() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { addToast } = useToastStore();
  const router = useRouter();

  const performAction = (callback: () => void, message: string = 'Sign in required to perform this action.') => {
    // Wait for auth to initialize before blocking
    if (!isInitialized) return;

    if (isAuthenticated) {
      callback();
    } else {
      addToast(message, 'info', {
        label: 'Sign In',
        onClick: () => router.push('/login'),
      });
    }
  };

  return { performAction, isAuthenticated, isInitialized };
}
