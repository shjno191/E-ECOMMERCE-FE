import productsData from '@/data/products.json';

export interface Product {
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

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'momo' | 'zalopay';
  createdAt: string;
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    email: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Get all products
  getProducts: async (): Promise<Product[]> => {
    await delay(300);
    return productsData as Product[];
  },

  // Get product by ID
  getProductById: async (id: string): Promise<Product | undefined> => {
    await delay(200);
    return productsData.find((p) => p.id === id) as Product | undefined;
  },

  // Search products
  searchProducts: async (query: string): Promise<Product[]> => {
    await delay(300);
    return productsData.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
    ) as Product[];
  },

  // Get products by category
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    await delay(300);
    return productsData.filter((p) => p.category === category) as Product[];
  },

  // Create order
  createOrder: async (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order> => {
    await delay(500);
    const order: Order = {
      ...orderData,
      id: `ORD-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    // Store in localStorage to simulate persistence
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    return order;
  },

  // Get order by ID
  getOrderById: async (id: string): Promise<Order | undefined> => {
    await delay(300);
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    return orders.find((o: Order) => o.id === id);
  },

  // Update order status
  updateOrderStatus: async (id: string, status: Order['status']): Promise<Order> => {
    await delay(400);
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = orders.findIndex((o: Order) => o.id === id);
    
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }
    
    orders[orderIndex].status = status;
    localStorage.setItem('orders', JSON.stringify(orders));
    
    return orders[orderIndex];
  },

  // Get all orders (for tracking)
  getAllOrders: async (): Promise<Order[]> => {
    await delay(300);
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    return orders;
  },
};
