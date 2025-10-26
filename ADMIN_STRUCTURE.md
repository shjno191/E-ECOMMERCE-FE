# Admin Panel Structure

## 📁 Folder Organization

```
src/
├── layouts/
│   └── AdminLayout.tsx          # Layout chung cho admin (sidebar + header)
│
├── pages/admin/                 # Các trang admin
│   ├── Dashboard.tsx            # Trang chủ admin - thống kê tổng quan
│   ├── Products.tsx             # Quản lý sản phẩm (CRUD)
│   ├── Orders.tsx               # Quản lý đơn hàng
│   ├── Customers.tsx            # Quản lý khách hàng
│   ├── Analytics.tsx            # Thống kê & báo cáo
│   └── Settings.tsx             # Cài đặt hệ thống
│
└── components/admin/            # Components dùng riêng cho admin
    └── AdminSidebar.tsx         # Sidebar navigation
```

## 🔐 Security Features

### Role-Based Access Control
- AdminLayout kiểm tra `user.role === 'admin'`
- Redirect về `/auth` nếu không phải admin
- Tự động protect tất cả routes `/admin/*`

## 🎨 UI Structure

### AdminLayout
- **Sidebar**: Fixed navigation (256px width)
- **Header**: Sticky top với user info
- **Main Content**: Flexible với padding và spacing
- **Background**: Muted color scheme

### AdminSidebar
- Logo và brand
- Navigation menu với icons
- Active state highlighting
- Back to homepage link

## 📍 Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/admin` | Dashboard | Trang chủ admin |
| `/admin/products` | Products | Quản lý sản phẩm |
| `/admin/orders` | Orders | Quản lý đơn hàng |
| `/admin/customers` | Customers | Quản lý khách hàng |
| `/admin/analytics` | Analytics | Thống kê |
| `/admin/settings` | Settings | Cài đặt |

## 🚀 Getting Started

### 1. Login as Admin
```
Username: admin
Password: admin
```

### 2. Access Admin Panel
Navigate to: `http://localhost:5173/admin`

### 3. Development
Tất cả pages đã được tạo với placeholder content. Bạn có thể phát triển từng trang:

**Ví dụ phát triển trang Products:**
```tsx
// src/pages/admin/Products.tsx
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
// ... implement CRUD logic
```

## 🛠️ Customization

### Thêm menu item mới
Edit `src/components/admin/AdminSidebar.tsx`:
```tsx
const menuItems = [
  // ... existing items
  {
    title: 'New Feature',
    icon: IconName,
    href: '/admin/new-feature',
  },
];
```

### Tạo trang admin mới
1. Tạo file trong `src/pages/admin/NewFeature.tsx`
2. Thêm route trong `App.tsx`:
```tsx
<Route path="new-feature" element={<NewFeature />} />
```

## 📊 Dashboard Stats
Dashboard hiển thị 4 cards thống kê chính:
- Tổng sản phẩm
- Đơn hàng
- Khách hàng  
- Doanh thu

## 🎯 Next Steps

1. **Products Management**: Implement CRUD operations
2. **Orders Management**: Real-time order updates
3. **Analytics**: Charts và graphs với recharts
4. **Settings**: System configuration
5. **Image Upload**: Cloudinary/AWS S3 integration
6. **Export Reports**: PDF/Excel export
7. **Real-time Notifications**: WebSocket integration

## 💡 Best Practices

- Mỗi admin page nên có riêng hook (useAdminProducts, useAdminOrders)
- Sử dụng React Query cho data fetching
- Implement optimistic updates
- Add loading states và error handling
- Validate form inputs với zod
- Use shadcn/ui components consistently
