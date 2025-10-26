import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  username: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

// Mock users
const MOCK_USERS = [
  { username: 'admin', password: 'admin', role: 'admin' as const },
  { username: 'user', password: 'user', role: 'user' as const },
];

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (username: string, password: string) => {
        const foundUser = MOCK_USERS.find(
          (u) => u.username === username && u.password === password
        );

        if (foundUser) {
          set({
            user: { username: foundUser.username, role: foundUser.role },
            isAuthenticated: true,
          });
          return true;
        }

        return false;
      },

      logout: () => {
        // Import stores dynamically to avoid circular dependencies
        import('./useCartStore').then(({ useCartStore }) => {
          useCartStore.getState().clearCart();
        });
        import('./useOrderStore').then(({ useOrderStore }) => {
          useOrderStore.getState().clearOrders();
        });

        // Clear all localStorage
        localStorage.clear();
        
        set({
          user: null,
          isAuthenticated: false,
        });

        // Force clear stores by triggering a storage event
        // This will cause cart and order stores to reset
        window.dispatchEvent(new Event('storage'));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
