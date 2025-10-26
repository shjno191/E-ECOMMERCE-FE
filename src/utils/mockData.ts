import { api, type Order } from '@/services/api';

// Generate mock orders for testing
export const generateMockOrders = async () => {
  const existingOrders = localStorage.getItem('orders');
  if (existingOrders && JSON.parse(existingOrders).length > 0) {
    return; // Already have orders
  }

  // Initialize products first
  await api.initializeProducts();
  const products = await api.getAdminProducts();
  
  if (products.length === 0) return;

  const mockOrders: Order[] = [];
  const statuses: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const paymentMethods: Order['paymentMethod'][] = ['momo', 'zalopay', 'cash'];
  
  const customers = [
    { name: 'Nguyễn Văn A', phone: '0901234567', email: 'nguyenvana@gmail.com', address: '123 Nguyễn Huệ, Q.1, TP.HCM' },
    { name: 'Trần Thị B', phone: '0912345678', email: 'tranthib@gmail.com', address: '456 Lê Lợi, Q.3, TP.HCM' },
    { name: 'Lê Văn C', phone: '0923456789', email: 'levanc@gmail.com', address: '789 Hai Bà Trưng, Q.1, TP.HCM' },
    { name: 'Phạm Thị D', phone: '0934567890', email: 'phamthid@gmail.com', address: '321 Trần Hưng Đạo, Q.5, TP.HCM' },
    { name: 'Hoàng Văn E', phone: '0945678901', email: 'hoangvane@gmail.com', address: '654 Võ Văn Tần, Q.3, TP.HCM' },
  ];

  // Generate 20 mock orders
  for (let i = 0; i < 20; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
    const items = [];
    
    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      items.push({
        product,
        quantity: Math.floor(Math.random() * 2) + 1,
        selectedColor: product.colors[0],
        selectedSize: product.sizes[0],
      });
    }

    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    
    // Generate date in the last 3 months
    const daysAgo = Math.floor(Math.random() * 90);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    mockOrders.push({
      id: `ORD-${Date.now()}-${i}`,
      items,
      total,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      createdAt: createdAt.toISOString(),
      customerInfo: customer,
    });
  }

  localStorage.setItem('orders', JSON.stringify(mockOrders));
};

// Initialize all mock data
export const initializeMockData = async () => {
  await api.initializeProducts();
  await generateMockOrders();
};
