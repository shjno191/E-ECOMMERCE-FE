/**
 * Authentication Helper Utilities
 * Functions for token validation, cleanup, and logout
 */

/**
 * Clear all application storage (localStorage, sessionStorage, cookies)
 */
export const clearAllStorage = () => {
  console.log('🧹 Clearing all storage...');

  // Clear localStorage
  try {
    const authKeys = ['auth-storage', 'cart-storage', 'order-storage'];
    authKeys.forEach(key => localStorage.removeItem(key));

    // Clear any keys with specific prefixes
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('cart-storage-') || 
        key.startsWith('auth-') || 
        key.startsWith('token') ||
        key.startsWith('refresh')
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('✅ localStorage cleared');
  } catch (error) {
    console.error('❌ Error clearing localStorage:', error);
  }

  // Clear sessionStorage
  try {
    sessionStorage.clear();
    console.log('✅ sessionStorage cleared');
  } catch (error) {
    console.error('❌ Error clearing sessionStorage:', error);
  }

  // Clear cookies
  try {
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      // Delete cookie with all possible path/domain combinations
      const domain = window.location.hostname;
      const paths = ['/', ''];
      const domains = [domain, `.${domain}`, ''];
      
      paths.forEach(path => {
        domains.forEach(d => {
          if (d) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};domain=${d}`;
          } else {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}`;
          }
        });
      });
    }
    
    console.log('✅ Cookies cleared');
  } catch (error) {
    console.error('❌ Error clearing cookies:', error);
  }

  console.log('✅ All storage cleared successfully');
};

/**
 * Decode JWT token and check if it's expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true;
    }

    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp;

    if (!exp) {
      return true;
    }

    // Check if token is expired (with 30 second buffer)
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= (exp - 30);
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

/**
 * Get token expiry date
 */
export const getTokenExpiry = (token: string): Date | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp;

    if (!exp) {
      return null;
    }

    return new Date(exp * 1000);
  } catch (error) {
    console.error('Error getting token expiry:', error);
    return null;
  }
};

/**
 * Force logout: Clear everything and redirect
 */
export const forceLogout = async () => {
  console.log('🔴 Force logout initiated');
  
  // Try to call store logout (which will clear everything)
  try {
    // Dynamically import to avoid circular dependency
    const { useAuthStore } = await import('@/store/useAuthStore');
    await useAuthStore.getState().logout();
  } catch (error) {
    console.error('❌ Error calling store logout, falling back to manual clear:', error);
    // Fallback: manually clear if store fails
    clearAllStorage();
  }
  
  // Redirect to auth page
  setTimeout(() => {
    if (typeof window !== 'undefined') {
      console.log('🔄 Redirecting to /auth');
      window.location.href = '/auth';
    }
  }, 300);
};

/**
 * Check token validity on app startup
 */
export const validateStoredToken = (): boolean => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (!authStorage) {
      return false;
    }

    const { state } = JSON.parse(authStorage);
    const token = state?.token;

    if (!token) {
      return false;
    }

    if (isTokenExpired(token)) {
      console.log('⚠️ Stored token is expired, clearing...');
      clearAllStorage();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating stored token:', error);
    clearAllStorage();
    return false;
  }
};
