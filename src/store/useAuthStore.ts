import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authService from '@/services/authService';

interface User {
  id: number | string;
  username: string;
  phone: string;
  email?: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (phone: string, password: string) => Promise<boolean>;
  register: (phone: string, password: string, username: string, email?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  verifyAuth: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setLoading: (loading: boolean) => set({ isLoading: loading, error: null }),
      clearError: () => set({ error: null }),

      login: async (phone: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({ phone, password });
          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              refreshToken: response.data.refreshToken || null,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error?.message || 'Đăng nhập thất bại',
            });
            return false;
          }
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false, error: 'Đã xảy ra lỗi khi đăng nhập' });
          return false;
        }
      },

      register: async (phone: string, password: string, username: string, email?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register({ phone, password, username, email });
          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              refreshToken: response.data.refreshToken || null,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({ isLoading: false, error: response.error?.message || 'Đăng ký thất bại' });
            return false;
          }
        } catch (error) {
          console.error('Register error:', error);
          set({ isLoading: false, error: 'Đã xảy ra lỗi khi đăng ký' });
          return false;
        }
      },

      verifyAuth: async () => {
        const { token, refreshToken: currentRefreshToken } = get();
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return false;
        }
        try {
          const response = await authService.verifyToken(token);
          if (response.success && response.data) {
            set({ user: response.data.user, isAuthenticated: true });
            return true;
          } else {
            if (currentRefreshToken) {
              const refreshResponse = await authService.refreshAccessToken(currentRefreshToken);
              if (refreshResponse.success && refreshResponse.data) {
                set({
                  user: refreshResponse.data.user,
                  token: refreshResponse.data.token,
                  refreshToken: refreshResponse.data.refreshToken || currentRefreshToken,
                  isAuthenticated: true,
                });
                return true;
              }
            }
            await get().logout();
            return false;
          }
        } catch (error) {
          console.error('Verify auth error:', error);
          await get().logout();
          return false;
        }
      },

      logout: async () => {
        const { token, refreshToken: currentRefreshToken } = get();
        if (token) {
          try {
            await authService.logout(token, currentRefreshToken || undefined);
          } catch (error) {
            console.error('Logout error:', error);
          }
        }
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        try {
          const { useCartStore } = await import('./useCartStore');
          useCartStore.getState().clearCart();
        } catch (error) {
          console.error('Error clearing cart store:', error);
        }
        try {
          const { useOrderStore } = await import('./useOrderStore');
          useOrderStore.getState().clearOrders();
        } catch (error) {
          console.error('Error clearing order store:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
