import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useOrderStore } from '@/store/useOrderStore';

/**
 * Hook to initialize cart and orders data when user is authenticated
 * This ensures navbar badges are updated on app startup
 */
export const useInitializeData = () => {
  const { isAuthenticated, token } = useAuthStore();
  const loadCartFromBackend = useCartStore((state) => state.loadCartFromBackend);
  const loadOrdersFromBackend = useOrderStore((state) => state.loadOrdersFromBackend);
  const isSynced = useCartStore((state) => state.isSynced);
  
  // Use ref to track if data has been loaded to prevent multiple calls
  const hasLoadedRef = useRef(false);
  const currentTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      // Only load if:
      // 1. User is authenticated
      // 2. We have a token
      // 3. Data hasn't been loaded yet OR token has changed (user switched accounts)
      const tokenChanged = currentTokenRef.current !== token;
      
      console.log('🔍 useInitializeData check:', {
        isAuthenticated,
        hasToken: !!token,
        hasLoadedRef: hasLoadedRef.current,
        tokenChanged,
        isSynced,
      });
      
      if (isAuthenticated && token && (!hasLoadedRef.current || tokenChanged)) {
        console.log('🔄 Initializing cart and orders data...');
        
        try {
          // Load cart and orders in parallel for better performance
          await Promise.all([
            !isSynced || tokenChanged ? loadCartFromBackend(token) : Promise.resolve(),
            loadOrdersFromBackend(token),
          ]);
          
          hasLoadedRef.current = true;
          currentTokenRef.current = token;
          console.log('✅ Cart and orders data initialized');
        } catch (error) {
          console.error('❌ Error initializing data:', error);
        }
      }
    };

    initializeData();
    // Only depend on auth state changes, not function references
    // isSynced is intentionally NOT in dependencies to prevent re-triggering when cart syncs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  // Reset the ref when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      hasLoadedRef.current = false;
      currentTokenRef.current = null;
    }
  }, [isAuthenticated]);
};
