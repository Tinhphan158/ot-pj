import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/shared/api/types';
import { removeAccessTokenCookie, setAccessTokenCookie } from '@/shared/utils/auth-cookie';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: false,
      setAuth: (user, accessToken, refreshToken) => {
        setAccessTokenCookie(accessToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },
      setTokens: (accessToken, refreshToken) => {
        setAccessTokenCookie(accessToken);
        set({ accessToken, refreshToken });
      },
      setUser: (user) => set({ user }),
      clearAuth: () => {
        removeAccessTokenCookie();
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        // Keep the middleware cookie in sync with a rehydrated session.
        if (state?.accessToken) setAccessTokenCookie(state.accessToken);
      },
    },
  ),
);

export const useCurrentUser = () => useAuthStore((s) => s.user);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
export const useHasAuthHydrated = () => useAuthStore((s) => s.hasHydrated);
