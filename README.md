# 🛍️ E-Commerce Frontend

Ứng dụng thương mại điện tử hiện đại được xây dựng với React + TypeScript, cung cấp trải nghiệm mua sắm trực tuyến hoàn chỉnh với trang quản trị (Admin Panel) đầy đủ tính năng.

![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?style=flat&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

## ✨ Tính Năng Chính

### 🛒 Tính Năng Khách Hàng
- **Trang chủ**: Hero slider, danh sách sản phẩm với pagination
- **Sản phẩm**: Tìm kiếm, lọc theo danh mục, chi tiết sản phẩm
- **Giỏ hàng**: Thêm/xóa sản phẩm, chọn màu/size, cập nhật số lượng
- **Thanh toán**: Form thông tin giao hàng, chọn phương thức thanh toán (MoMo, ZaloPay, COD)
- **Đơn hàng**: Theo dõi đơn hàng, lịch sử mua hàng
- **Hỗ trợ**: Chat support trực tuyến
- **Responsive**: Tối ưu cho mobile, tablet và desktop

### 👨‍💼 Admin Panel
- **Dashboard**: Tổng quan thống kê (sản phẩm, đơn hàng, khách hàng, doanh thu)
- **Quản lý sản phẩm**: CRUD hoàn chỉnh với upload ảnh, quản lý tồn kho
- **Quản lý đơn hàng**: Cập nhật trạng thái, xem chi tiết, xuất/xóa đơn hàng
- **Quản lý khách hàng**: Thống kê chi tiêu, xếp hạng VIP, theo dõi hoạt động
- **Thống kê & Phân tích**: Biểu đồ doanh thu, sản phẩm bán chạy, phân tích theo danh mục
- **Cài đặt**: Cấu hình cửa hàng, thanh toán, vận chuyển, email, thông báo
- **Quản lý dữ liệu**: Reset, backup, restore dữ liệu

## 🎯 Demo Accounts

### Admin
- **Email**: `admin@example.com`
- **Password**: `admin`
- **Access**: Toàn quyền quản trị

### User
- **Email**: `user@example.com`
- **Password**: `user`
- **Access**: Mua hàng và theo dõi đơn

## 🚀 Cài Đặt & Chạy Dự Án

### Yêu Cầu
- Node.js 18+ và npm/bun
- Git

### Bước 1: Clone Repository
```bash
git clone https://github.com/shjno191/E-ECOMMERCE-FE.git
cd E-ECOMMERCE-FE
```

### Bước 2: Cài Đặt Dependencies
```bash
npm install
# hoặc
bun install
```

### Bước 3: Chạy Development Server
```bash
npm run dev
# hoặc
bun run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:8080`

### Build Production
```bash
npm run build
# Output: dist/
```

### Preview Production Build
```bash
npm run preview
```

## 📁 Cấu Trúc Dự Án

```
E-ECOMMERCE-FE/
├── public/                      # Static assets
│   └── robots.txt
├── src/
│   ├── components/              # React components
│   │   ├── ui/                  # Shadcn UI components
│   │   ├── admin/               # Admin components
│   │   │   ├── AdminSidebar.tsx
│   │   │   └── DataManager.tsx
│   │   ├── ChatSupport.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroSlider.tsx
│   │   ├── Navbar.tsx
│   │   ├── Pagination.tsx
│   │   ├── ProductCard.tsx
│   │   └── ScrollToTop.tsx
│   ├── data/                    # Mock data (JSON)
│   │   ├── products.json        # ~30 sản phẩm mẫu
│   │   └── heroes.json          # Hero slider data
│   ├── hooks/                   # Custom hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── layouts/                 # Layout components
│   │   └── AdminLayout.tsx
│   ├── lib/                     # Utilities
│   │   └── utils.ts
│   ├── pages/                   # Page components
│   │   ├── admin/               # Admin pages
│   │   │   ├── Dashboard.tsx    # Tổng quan
│   │   │   ├── Products.tsx     # Quản lý sản phẩm
│   │   │   ├── Orders.tsx       # Quản lý đơn hàng
│   │   │   ├── Customers.tsx    # Quản lý khách hàng
│   │   │   ├── Analytics.tsx    # Thống kê
│   │   │   └── Settings.tsx     # Cài đặt
│   │   ├── Auth.tsx             # Login/Register
│   │   ├── Cart.tsx             # Giỏ hàng
│   │   ├── Checkout.tsx         # Thanh toán
│   │   ├── Index.tsx            # Trang chủ
│   │   ├── Orders.tsx           # Đơn hàng user
│   │   ├── OrderTracking.tsx    # Theo dõi đơn
│   │   ├── ProductDetail.tsx    # Chi tiết sản phẩm
│   │   ├── Products.tsx         # Danh sách sản phẩm
│   │   └── NotFound.tsx
│   ├── services/                # API services
│   │   └── api.ts               # Mock API functions
│   ├── store/                   # Zustand stores
│   │   ├── useAuthStore.ts      # Auth state
│   │   ├── useCartStore.ts      # Cart state
│   │   └── useOrderStore.ts     # Order state
│   ├── utils/                   # Utility functions
│   │   └── mockData.ts          # Mock data generator
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── ADMIN_STRUCTURE.md           # Admin structure docs
├── MOCK_API_GUIDE.md            # Mock API documentation
└── package.json
```

## 🛠️ Tech Stack

### Core
- **React 18+** - UI Library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router v6** - Routing

### State Management
- **Zustand** - Lightweight state management
- **Zustand Persist** - LocalStorage persistence

### UI & Styling
- **Tailwind CSS** - Utility-first CSS
- **Shadcn/ui** - Beautiful component library
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

### Data & Storage
- **LocalStorage** - Client-side persistence
- **Mock API** - Simulated backend with JSON data

## 📊 Mock API System

Dự án sử dụng hệ thống Mock API để giả lập backend:

### Khởi Tạo Dữ Liệu
- Tự động load 30+ sản phẩm từ `products.json`
- Generate 20 đơn hàng mẫu với dữ liệu random
- 5 khách hàng mẫu với lịch sử mua hàng

### API Functions
```typescript
// Products
await api.getAdminProducts()
await api.createProduct(data)
await api.updateProduct(id, data)
await api.deleteProduct(id)

// Orders
await api.getAllOrders()
await api.updateOrder(id, data)
await api.deleteOrder(id)

// Analytics
await api.getOrderStats()
await api.getCustomerStats()
```

### Data Manager
Admin có thể:
- Reset sản phẩm về dữ liệu gốc
- Tạo đơn hàng mẫu mới
- Export/Import backup (JSON)
- Reset toàn bộ hệ thống

Xem chi tiết: [MOCK_API_GUIDE.md](./MOCK_API_GUIDE.md)

## 🎨 Features Chi Tiết

### Authentication
- Mock authentication với email/password
- Role-based access (admin/user)
- Protected routes cho admin
- Persistent login với Zustand

### Shopping Cart
- Add/remove items
- Update quantity
- Select color & size variants
- Real-time total calculation
- Persist across sessions

### Order Management
- Create orders with customer info
- Track order status workflow:
  - `pending` → `processing` → `shipped` → `delivered`
  - `cancelled` (admin only)
- Payment methods: MoMo, ZaloPay, COD
- Order history with filters

### Admin Analytics
- Revenue by month with growth trends
- Top 5 best-selling products
- Order status distribution (visual charts)
- Revenue by category breakdown
- Customer lifetime value analysis

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-optimized UI
- Collapsible sidebar for mobile

## 🔐 Security Notes

⚠️ **Development Only**: Dự án này sử dụng mock authentication và LocalStorage. Không dùng cho production!

**Khi deploy production:**
- Implement real authentication (JWT, OAuth)
- Use secure backend API
- Add input validation & sanitization
- Implement rate limiting
- Use HTTPS
- Add CSRF protection

## 🚢 Deployment

### Lovable Platform
```bash
# Via Lovable Dashboard
Project → Share → Publish
```

### Vercel
```bash
npm run build
vercel deploy
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Custom Server
```bash
npm run build
# Upload dist/ folder to your server
# Configure nginx/apache to serve SPA
```

## 📝 Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📮 Contact

- **Repository**: [E-ECOMMERCE-FE](https://github.com/shjno191/E-ECOMMERCE-FE)
- **Issues**: [GitHub Issues](https://github.com/shjno191/E-ECOMMERCE-FE/issues)
- **Lovable Project**: [View on Lovable](https://lovable.dev/projects/4328b9aa-198a-40d3-8d7d-74f44cd15e4e)

## 🙏 Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) - Component library
- [Lucide](https://lucide.dev/) - Icon system
- [Unsplash](https://unsplash.com/) - Product images
- [Lovable](https://lovable.dev/) - Development platform

---

Made with ❤️ by [shjno191](https://github.com/shjno191)
