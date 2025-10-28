/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

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

// Mock data for development
const MOCK_USERS = [
  { 
    id: 1, 
    username: 'Admin', 
    phone: '0901234567', 
    email: 'admin@example.com', 
    password: 'admin', 
    role: 'admin' as const 
  },
  { 
    id: 2, 
    username: 'User', 
    phone: '0912345678', 
    email: 'user@example.com', 
    password: 'user', 
    role: 'user' as const 
  },
];

// Mock JWT generation
const generateMockJWT = (user: typeof MOCK_USERS[0]) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    id: user.id,
    phone: user.phone,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
  }));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
};

/**
 * Login with phone and password
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  if (USE_MOCK) {
    // Mock implementation for development
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = MOCK_USERS.find(
      u => u.phone === credentials.phone && u.password === credentials.password
    );

    if (!user) {
      return {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Số điện thoại hoặc mật khẩu không đúng',
        },
      };
    }

    return {
      success: true,
      data: {
        token: generateMockJWT(user),
        user: {
          id: user.id,
          username: user.username,
          phone: user.phone,
          email: user.email,
          role: user.role,
        },
      },
    };
  }

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
  if (USE_MOCK) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));

    const userExists = MOCK_USERS.some(u => u.phone === userData.phone);
    if (userExists) {
      return {
        success: false,
        error: {
          code: 'PHONE_EXISTS',
          message: 'Số điện thoại đã được sử dụng',
        },
      };
    }

    const newUser = {
      id: MOCK_USERS.length + 1,
      username: userData.username,
      phone: userData.phone,
      email: userData.email,
      password: userData.password,
      role: 'user' as const,
    };

    MOCK_USERS.push(newUser);

    return {
      success: true,
      data: {
        token: generateMockJWT(newUser),
        user: {
          id: newUser.id,
          username: newUser.username,
          phone: newUser.phone,
          email: newUser.email,
          role: newUser.role,
        },
      },
    };
  }

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
  if (USE_MOCK) {
    // Mock implementation
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid token');
      
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp < now) {
        return {
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Token đã hết hạn',
          },
        };
      }

      const user = MOCK_USERS.find(u => u.phone === payload.phone);
      if (!user) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Người dùng không tồn tại',
          },
        };
      }

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            phone: user.phone,
            email: user.email,
            role: user.role,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'TOKEN_INVALID',
          message: 'Token không hợp lệ',
        },
      };
    }
  }

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
  if (USE_MOCK) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In mock mode, just return a new token
    const user = MOCK_USERS[0]; // Default to first user
    return {
      success: true,
      data: {
        token: generateMockJWT(user),
        user: {
          id: user.id,
          username: user.username,
          phone: user.phone,
          email: user.email,
          role: user.role,
        },
      },
    };
  }

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
  if (USE_MOCK) {
    // Mock implementation - no action needed
    return;
  }

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
