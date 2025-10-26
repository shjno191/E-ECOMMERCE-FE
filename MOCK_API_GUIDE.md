# Mock API System - Hướng Dẫn Sử Dụng

## Tổng Quan

Hệ thống Mock API giả lập các API calls từ backend, sử dụng dữ liệu từ file JSON và LocalStorage để lưu trữ.

## Cấu Trúc Dữ Liệu

### 1. Products (Sản phẩm)
- **File gốc**: `src/data/products.json`
- **LocalStorage key**: `products`
- **Interface**: `Product` trong `src/services/api.ts`

```typescript
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  stock: number;
  colors: string[];
  sizes: string[];
}
```

### 2. Orders (Đơn hàng)
- **LocalStorage key**: `orders`
- **Interface**: `Order` trong `src/services/api.ts`

```typescript
interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'momo' | 'zalopay' | 'cash';
  createdAt: string;
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    email: string;
  };
}
```

### 3. Settings (Cài đặt)
- **LocalStorage key**: `storeSettings`
- **Interface**: `StoreSettings` trong `src/pages/admin/Settings.tsx`

## API Functions

### Products API

```typescript
// Khởi tạo sản phẩm từ JSON (chỉ chạy 1 lần nếu chưa có data)
await api.initializeProducts();

// Lấy tất cả sản phẩm (cho admin)
const products = await api.getAdminProducts();

// Tạo sản phẩm mới
const newProduct = await api.createProduct(productData);

// Cập nhật sản phẩm
const updated = await api.updateProduct(id, updates);

// Xóa sản phẩm
await api.deleteProduct(id);

// Tìm kiếm sản phẩm (cho user)
const results = await api.searchProducts(query);

// Lấy sản phẩm theo danh mục
const products = await api.getProductsByCategory(category);
```

### Orders API

```typescript
// Tạo đơn hàng mới
const order = await api.createOrder(orderData);

// Lấy tất cả đơn hàng
const orders = await api.getAllOrders();

// Lấy đơn hàng theo ID
const order = await api.getOrderById(id);

// Cập nhật trạng thái đơn hàng
const updated = await api.updateOrderStatus(id, 'processing');

// Cập nhật đơn hàng (full update)
const updated = await api.updateOrder(id, updates);

// Xóa đơn hàng
await api.deleteOrder(id);

// Lấy thống kê đơn hàng
const stats = await api.getOrderStats();
```

### Customer API

```typescript
// Lấy thống kê khách hàng
const customers = await api.getCustomerStats();
// Returns: Array of customer stats grouped by email
```

## Mock Data Generator

### Khởi Tạo Dữ Liệu Mẫu

```typescript
import { initializeMockData, generateMockOrders } from '@/utils/mockData';

// Khởi tạo toàn bộ (products + orders)
await initializeMockData();

// Chỉ tạo orders mẫu
await generateMockOrders();
```

### Tính Năng

- **generateMockOrders()**: Tạo 20 đơn hàng mẫu với:
  - 5 khách hàng khác nhau
  - Ngày tạo ngẫu nhiên trong 90 ngày qua
  - 1-3 sản phẩm mỗi đơn
  - Trạng thái và phương thức thanh toán ngẫu nhiên

## Data Manager Component

Component `DataManager` trong trang Settings cho phép admin:

### Chức Năng

1. **Reset Sản Phẩm**: Khôi phục về dữ liệu từ file JSON gốc
2. **Tạo Đơn Hàng Mẫu**: Generate 20 đơn hàng mới
3. **Xuất Dữ Liệu**: Download backup file (.json)
4. **Nhập Dữ Liệu**: Restore từ backup file
5. **Reset Toàn Bộ**: Xóa tất cả và khôi phục mặc định

### Sử Dụng

```tsx
import DataManager from '@/components/admin/DataManager';

// Thêm vào trang Settings
<DataManager />
```

## Workflow

### Lần Đầu Load App

1. User truy cập `/` (Index page)
2. `initializeMockData()` được gọi
3. Products được load từ `products.json` → LocalStorage
4. Mock orders được generate (nếu chưa có)
5. Redirect sang `/products`

### Admin CRUD Operations

#### Products
```typescript
// Trang Admin Products
const products = await api.getAdminProducts(); // Load
await api.createProduct(data);                 // Create
await api.updateProduct(id, data);             // Update
await api.deleteProduct(id);                   // Delete
```

#### Orders
```typescript
// Trang Admin Orders
const orders = await api.getAllOrders();       // Load
await api.updateOrder(id, updates);            // Update
await api.deleteOrder(id);                     // Delete
```

### User Shopping Flow

```typescript
// Browse products
const products = await api.getProducts();

// Search
const results = await api.searchProducts('áo');

// Filter by category
const filtered = await api.getProductsByCategory('Áo');

// Create order
const order = await api.createOrder({
  items: cartItems,
  total: totalAmount,
  paymentMethod: 'momo',
  customerInfo: {...}
});
```

## Delay Simulation

Tất cả API calls có delay 200-500ms để giả lập network latency:

```typescript
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
```

## LocalStorage Keys

- `products`: Array<Product>
- `orders`: Array<Order>
- `storeSettings`: StoreSettings object
- `auth-storage`: Zustand persist (user auth)
- `cart-storage`: Zustand persist (shopping cart)

## Tips & Best Practices

### 1. Khởi Tạo Dữ Liệu

Luôn gọi `initializeMockData()` ở Index page để đảm bảo có dữ liệu:

```typescript
useEffect(() => {
  initializeMockData().then(() => {
    navigate('/products');
  });
}, []);
```

### 2. Loading States

Sử dụng loading states cho UX tốt hơn:

```typescript
const [loading, setLoading] = useState(true);

const loadData = async () => {
  setLoading(true);
  try {
    const data = await api.getAdminProducts();
    setData(data);
  } finally {
    setLoading(false);
  }
};
```

### 3. Error Handling

Wrap API calls trong try-catch:

```typescript
try {
  await api.createProduct(data);
  toast.success('Thành công!');
} catch (error) {
  console.error(error);
  toast.error('Có lỗi xảy ra');
}
```

### 4. Backup Data

Export dữ liệu thường xuyên từ DataManager để backup:
- Admin → Settings → Data Manager → "Xuất dữ liệu"

### 5. Reset Data

Nếu dữ liệu bị lỗi, reset từ Settings:
- Reset toàn bộ → Reload page tự động

## File Structure

```
src/
├── data/
│   ├── products.json          # Dữ liệu sản phẩm gốc
│   └── heroes.json            # Dữ liệu hero slider
├── services/
│   └── api.ts                 # Mock API functions
├── utils/
│   └── mockData.ts            # Mock data generator
└── components/
    └── admin/
        └── DataManager.tsx    # Admin data management UI
```

## Migration to Real API

Khi chuyển sang real backend:

1. Giữ nguyên interfaces (Product, Order, etc.)
2. Thay thế functions trong `api.ts`:
   - Đổi từ localStorage → fetch/axios calls
   - Giữ nguyên function signatures
   - Update delay thành real network calls

```typescript
// Before (Mock)
getAdminProducts: async (): Promise<Product[]> => {
  await delay(300);
  const products = localStorage.getItem('products');
  return JSON.parse(products || '[]');
}

// After (Real API)
getAdminProducts: async (): Promise<Product[]> => {
  const response = await fetch('/api/products');
  return response.json();
}
```

## Troubleshooting

### Không có dữ liệu hiển thị
- Vào Settings → Reset toàn bộ
- Hoặc clear LocalStorage và reload page

### Dữ liệu bị trùng lặp
- Xóa key trong LocalStorage
- Gọi `api.initializeProducts()` lại

### Orders không có products
- Check products đã được load trước orders
- Gọi `initializeMockData()` đúng thứ tự

## Demo Data

Mock system tạo:
- **Products**: ~30 sản phẩm từ JSON
- **Orders**: 20 đơn hàng với dữ liệu random
- **Customers**: 5 khách hàng mẫu
- **Date Range**: 90 ngày qua

## Performance

- LocalStorage limit: ~5-10MB
- Current data size: ~100KB
- Delay: 200-500ms per call
- No pagination on mock (client-side filtering)
