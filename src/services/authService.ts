/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Types
export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  phone: string;
  password: string;
  username: string;
  email?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    refreshToken?: string;
    user: {
      id: number | string;
      username: string;
      phone: string;
      email?: string;
      role: 'admin' | 'user';
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface VerifyTokenResponse {
  success: boolean;
  data?: {
    user: {
      id: number | string;
      username: string;
      phone: string;
      email?: string;
      role: 'admin' | 'user';
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Login with phone and password
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  // Real API call
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || {
          code: 'UNKNOWN_ERROR',
          message: 'Đã xảy ra lỗi không xác định',
        },
      };
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Không thể kết nối đến server',
      },
    };
  }
};

/**
 * Register new user
 */
export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  // Real API call
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || {
          code: 'UNKNOWN_ERROR',
          message: 'Đã xảy ra lỗi không xác định',
        },
      };
    }

    return data;
  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Không thể kết nối đến server',
      },
    };
  }
};

/**
 * Verify token validity
 */
export const verifyToken = async (token: string): Promise<VerifyTokenResponse> => {
  // Real API call
  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data: VerifyTokenResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || {
          code: 'UNKNOWN_ERROR',
          message: 'Đã xảy ra lỗi không xác định',
        },
      };
    }

    return data;
  } catch (error) {
    console.error('Verify token error:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Không thể kết nối đến server',
      },
    };
  }
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<AuthResponse> => {
  // Real API call
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || {
          code: 'UNKNOWN_ERROR',
          message: 'Không thể làm mới token',
        },
      };
    }

    return data;
  } catch (error) {
    console.error('Refresh token error:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Không thể kết nối đến server',
      },
    };
  }
};

/**
 * Logout user
 */
export const logout = async (token: string, refreshToken?: string): Promise<void> => {
  // Real API call
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Don't throw error on logout failure
  }
};
