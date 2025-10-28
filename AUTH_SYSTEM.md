# Authentication System

## Tổng Quan

Hệ thống xác thực sử dụng **phone-based authentication** với JWT tokens.

### Đặc điểm chính:
- ✅ Login bằng **số điện thoại** + mật khẩu
- ✅ Email là thông tin phụ (optional)
- ✅ JWT access token + refresh token
- ✅ Hỗ trợ **Mock Mode** cho development
- ✅ Auto token refresh khi expired
- ✅ Error handling với messages tiếng Việt

---

## Cấu Trúc

```
src/
├── services/
│   └── authService.ts       # API calls cho authentication
├── store/
│   └── useAuthStore.ts      # Zustand state management
└── pages/
    └── Auth.tsx             # Login/Register UI
```

---

## Configuration

### Environment Variables

**`.env.local`** (Development):
```env
# API endpoint
VITE_API_URL=http://localhost:3000/api

# Mock mode - set to 'true' to use mock API
VITE_USE_MOCK_API=true
```

**`.env.production`** (Production):
```env
VITE_API_URL=https://api.your-domain.com/api
VITE_USE_MOCK_API=false
```

---

## Usage

### 1. Login

```typescript
import { useAuthStore } from '@/store/useAuthStore';

const { login, isLoading, error } = useAuthStore();

const handleLogin = async () => {
  const success = await login('0901234567', 'password');
  
  if (success) {
    // Redirect to dashboard
  } else {
    // Show error message
    console.error(error);
  }
};
```

### 2. Register

```typescript
const { register, isLoading, error } = useAuthStore();

const handleRegister = async () => {
  const success = await register(
    '0912345678',     // phone
    'password123',    // password
    'Nguyễn Văn A',  // username
    'user@email.com'  // email (optional)
  );
};
```

### 3. Check Authentication

```typescript
const { isAuthenticated, user } = useAuthStore();

if (isAuthenticated) {
  console.log('User:', user);
  // user.id, user.username, user.phone, user.email, user.role
}
```

### 4. Logout

```typescript
const { logout } = useAuthStore();

await logout(); // Clears token, user data, and other stores
```

### 5. Verify Token (Auto-refresh)

```typescript
const { verifyAuth } = useAuthStore();

// Check if token is valid, auto-refresh if expired
const isValid = await verifyAuth();
```

---

## Mock Mode

Khi `VITE_USE_MOCK_API=true`, hệ thống sử dụng mock data:

### Demo Accounts:
```
Admin:  0901234567 / admin
User:   0912345678 / user
```

### Mock Behavior:
- ✅ Delay 500ms để simulate network
- ✅ Validate phone format
- ✅ Check duplicate phone
- ✅ Generate mock JWT token
- ✅ Return proper error messages

---

## API Integration

Khi `VITE_USE_MOCK_API=false`, hệ thống gọi real backend API:

### Endpoints Required:

#### 1. POST `/api/auth/login`
```json
// Request
{
  "phone": "0901234567",
  "password": "admin"
}

// Response (Success)
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": 1,
      "username": "Admin",
      "phone": "0901234567",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}

// Response (Error)
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Số điện thoại hoặc mật khẩu không đúng"
  }
}
```

#### 2. POST `/api/auth/register`
```json
// Request
{
  "phone": "0923456789",
  "password": "password123",
  "username": "Nguyễn Văn A",
  "email": "user@example.com"  // optional
}

// Response - Same as login
```

#### 3. GET `/api/auth/verify`
```http
Authorization: Bearer <token>

// Response (Success)
{
  "success": true,
  "data": {
    "user": { /* user object */ }
  }
}
```

#### 4. POST `/api/auth/refresh`
```json
// Request
{
  "refreshToken": "refresh_token_here"
}

// Response
{
  "success": true,
  "data": {
    "token": "new_access_token",
    "refreshToken": "new_refresh_token",
    "user": { /* user object */ }
  }
}
```

#### 5. POST `/api/auth/logout`
```http
Authorization: Bearer <token>

// Request
{
  "refreshToken": "refresh_token_here"
}

// Response
{
  "success": true
}
```

---

## Error Handling

### Frontend Error Messages:

| Error Code | Message |
|------------|---------|
| `INVALID_CREDENTIALS` | Số điện thoại hoặc mật khẩu không đúng |
| `PHONE_EXISTS` | Số điện thoại đã được sử dụng |
| `TOKEN_EXPIRED` | Token đã hết hạn |
| `TOKEN_INVALID` | Token không hợp lệ |
| `NETWORK_ERROR` | Không thể kết nối đến server |
| `UNKNOWN_ERROR` | Đã xảy ra lỗi không xác định |

### Usage:

```typescript
const { error, clearError } = useAuthStore();

if (error) {
  toast.error(error);
  clearError(); // Clear error after showing
}
```

---

## Phone Validation

Format Việt Nam:
```typescript
// Valid formats:
// - 0901234567
// - 0912345678
// - +84901234567

const phoneRegex = /^(0|\+84)[0-9]{9}$/;
```

---

## Security Features

### 1. Token Storage
- ✅ Stored in localStorage với Zustand persist
- ✅ Automatically attached to API requests
- ✅ Auto-cleared on logout

### 2. Token Refresh
- ✅ Verify token before using
- ✅ Auto-refresh if expired
- ✅ Force logout if refresh fails

### 3. Protected Routes
```typescript
// Example: Protect admin routes
const { isAuthenticated, user } = useAuthStore();

if (!isAuthenticated || user?.role !== 'admin') {
  navigate('/auth');
}
```

---

## Migration từ Mock sang Real API

### Bước 1: Update `.env.local`
```env
VITE_USE_MOCK_API=false
```

### Bước 2: Verify Backend Endpoints
Test các endpoints với Postman/cURL

### Bước 3: Update API_URL
```env
VITE_API_URL=https://your-production-api.com/api
```

### Bước 4: Test Authentication Flow
1. Test login
2. Test register
3. Test token refresh
4. Test logout
5. Test protected routes

---

## Troubleshooting

### Issue: "Không thể kết nối đến server"
**Solution:**
1. Check `VITE_API_URL` in `.env.local`
2. Verify backend is running
3. Check CORS configuration
4. Try with `VITE_USE_MOCK_API=true`

### Issue: "Token đã hết hạn"
**Solution:**
- Auto-refresh sẽ xử lý tự động
- Nếu refresh fail → force logout → redirect to `/auth`

### Issue: "Số điện thoại đã được sử dụng"
**Solution:**
- Phone must be unique in database
- Use different phone number

---

## Testing

### Manual Testing với Mock Mode:

```bash
# 1. Enable mock mode
echo "VITE_USE_MOCK_API=true" >> .env.local

# 2. Run dev server
bun run dev

# 3. Test login
# Navigate to /auth
# Enter: 0901234567 / admin
```

### Testing với Real Backend:

```bash
# 1. Disable mock mode
echo "VITE_USE_MOCK_API=false" >> .env.local

# 2. Start backend server
# (Backend must be running at VITE_API_URL)

# 3. Run dev server
bun run dev

# 4. Test authentication flow
```

---

## Demo Accounts (Mock Mode)

| Phone | Password | Role | Email |
|-------|----------|------|-------|
| 0901234567 | admin | admin | admin@example.com |
| 0912345678 | user | user | user@example.com |

---

## Support

- 📧 **Documentation:** See `BACKEND_AUTH_GUIDE.md` for backend requirements
- 🔧 **API Spec:** Check `src/services/authService.ts` for interfaces
- 🐛 **Issues:** Report to frontend team

---

**Last Updated:** 2025-10-28  
**Version:** 2.0.0 - Phone-based Authentication
