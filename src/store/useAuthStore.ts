import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  isAuthModalOpen: boolean;
  pendingAction: (() => void) | null;
  setUser: (user: any) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
  openLoginModal: (callback?: () => void) => void;
  closeLoginModal: () => void;
  setPendingAction: (action: (() => void) | null) => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,
      isAuthModalOpen: false,
      pendingAction: null,
      
      setUser: (user) => {
        set({ user, isAuthenticated: !!user, isLoading: false, isInitialized: true });
        // After login, execute any pending action then clear it
        const pending = get().pendingAction;
        if (user && pending) {
          pending();
          set({ pendingAction: null });
        }
      },
      
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true }),
      
      openLoginModal: (callback) => set({ 
        isAuthModalOpen: true, 
        pendingAction: callback || null 
      }),
      
      closeLoginModal: () => set({ isAuthModalOpen: false, pendingAction: null }),
      setPendingAction: (pendingAction) => set({ pendingAction }),
      refreshUser: async () => {
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const data = await res.json();
            set({ user: data.user, isAuthenticated: true });
          }
        } catch (error) {
          console.error('Failed to refresh user:', error);
        }
      },
    }),
    {
      name: 'flowlance-auth-storage',
      // Only persist the non-functional/non-volatile parts
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated, 
        isInitialized: state.isInitialized 
      }),
    }
  )
);
