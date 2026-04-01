import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: any) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
  isInitialized: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false, isInitialized: true }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true }),
      isInitialized: false,
    }),
    {
      name: 'flowlance-auth-storage',
    }
  )
);
