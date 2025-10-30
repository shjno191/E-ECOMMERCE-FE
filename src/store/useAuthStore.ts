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
  refreshAccessToken: () => Promise<boolean>;
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

      refreshAccessToken: async () => {
        const { refreshToken: currentRefreshToken } = get();
        if (!currentRefreshToken) {
          console.error('No refresh token available');
          return false;
        }
        
        try {
          const refreshResponse = await authService.refreshAccessToken(currentRefreshToken);
          if (refreshResponse.success && refreshResponse.data) {
            set({
              user: refreshResponse.data.user,
              token: refreshResponse.data.token,
              refreshToken: refreshResponse.data.refreshToken || currentRefreshToken,
              isAuthenticated: true,
            });
            return true;
          } else {
            console.error('Refresh token failed:', refreshResponse.error);
            return false;
          }
        } catch (error) {
          console.error('Refresh token error:', error);
          return false;
        }
      },

      logout: async () => {
        const { token, refreshToken: currentRefreshToken } = get();
        
        // Call backend logout API
        if (token) {
          try {
            await authService.logout(token, currentRefreshToken || undefined);
          } catch (error) {
            console.error('Logout error:', error);
          }
        }
        
        // Clear zustand state
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        
        // Clear cart store
        try {
          const { useCartStore } = await import('./useCartStore');
          useCartStore.getState().clearCart();
        } catch (error) {
          console.error('Error clearing cart store:', error);
        }
        
        // Clear order store
        try {
          const { useOrderStore } = await import('./useOrderStore');
          useOrderStore.getState().clearOrders();
        } catch (error) {
          console.error('Error clearing order store:', error);
        }
        
        // Clear all localStorage keys related to auth and app
        try {
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('cart-storage');
          localStorage.removeItem('order-storage');
          
          // Clear any cart storage with username suffix
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('cart-storage-') || key.startsWith('auth-') || key.startsWith('token'))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
        } catch (error) {
          console.error('Error clearing localStorage:', error);
        }
        
        // Clear all cookies
        try {
          const cookies = document.cookie.split(';');
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            
            // Delete cookie for all paths and domains
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
          }
        } catch (error) {
          console.error('Error clearing cookies:', error);
        }
        
        // Clear sessionStorage
        try {
          sessionStorage.clear();
        } catch (error) {
          console.error('Error clearing sessionStorage:', error);
        }
        
        // Clear any IndexedDB (if used)
        try {
          if (window.indexedDB) {
            const databases = await window.indexedDB.databases?.();
            databases?.forEach((db) => {
              if (db.name) {
                window.indexedDB.deleteDatabase(db.name);
              }
            });
          }
        } catch (error) {
          console.error('Error clearing IndexedDB:', error);
        }
        
        console.log('✅ Logout complete: All storage cleared');
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
