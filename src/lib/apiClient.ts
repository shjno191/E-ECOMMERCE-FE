import { useAuthStore } from '@/store/useAuthStore';
import { forceLogout } from '@/utils/authHelpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

/**
 * API Helper with JWT token management
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Get authorization headers with JWT token
   */
  private getAuthHeaders(): HeadersInit {
    const token = useAuthStore.getState().token;
    if (!token) {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Make authenticated API request
   */
  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (requiresAuth) {
      Object.assign(headers, this.getAuthHeaders());
    }

    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      // Parse response body first to check for error details
      const data = await response.json().catch(() => null);

      // Check if response has error with TOKEN_EXPIRED code
      if (data?.status === 'error' && data?.error?.code === 'TOKEN_EXPIRED') {
        console.log('Token expired, attempting to refresh...');
        
        // Try to refresh token
        const refreshSuccess = await useAuthStore.getState().refreshAccessToken();
        
        if (refreshSuccess) {
          console.log('Token refreshed successfully, retrying request...');
          
          // Retry request with new token
          const newHeaders = {
            ...headers,
            ...this.getAuthHeaders(),
          };

          const retryResponse = await fetch(url, {
            ...fetchOptions,
            headers: newHeaders,
          });

          const retryData = await retryResponse.json().catch(() => null);

          if (!retryResponse.ok) {
            const errorMessage = retryData?.error?.message || retryData?.message || `HTTP error! status: ${retryResponse.status}`;
            throw new Error(errorMessage);
          }

          return retryData;
        } else {
          // Refresh failed, force logout
          console.log('Token refresh failed, forcing logout...');
          await forceLogout();
          throw new Error('Token đã hết hạn. Vui lòng đăng nhập lại.');
        }
      }

      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        console.log('401 Unauthorized, attempting to refresh token...');
        
        // Try to refresh token
        const refreshSuccess = await useAuthStore.getState().refreshAccessToken();
        
        if (refreshSuccess) {
          console.log('Token refreshed successfully, retrying request...');
          
          // Retry request with new token
          const newHeaders = {
            ...headers,
            ...this.getAuthHeaders(),
          };

          const retryResponse = await fetch(url, {
            ...fetchOptions,
            headers: newHeaders,
          });

          const retryData = await retryResponse.json().catch(() => null);

          if (!retryResponse.ok) {
            const errorMessage = retryData?.error?.message || retryData?.message || `HTTP error! status: ${retryResponse.status}`;
            throw new Error(errorMessage);
          }

          return retryData;
        } else {
          // Refresh failed, force logout
          console.log('Token refresh failed, forcing logout...');
          await forceLogout();
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
      }

      if (!response.ok) {
        const errorMessage = data?.error?.message || data?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_URL);

// Export types
export type { RequestOptions };
