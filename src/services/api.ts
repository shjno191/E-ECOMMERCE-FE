import productsData from '@/data/products.json';
import heroesData from '@/data/heroes.json';

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

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor: string;
}

export interface Order {
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

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Remove Vietnamese accents for search
const removeVietnameseAccents = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
};

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
    const normalizedQuery = removeVietnameseAccents(query);
    return productsData.filter((p) => {
      const normalizedName = removeVietnameseAccents(p.name);
      const normalizedCategory = removeVietnameseAccents(p.category);
      return normalizedName.includes(normalizedQuery) || 
             normalizedCategory.includes(normalizedQuery);
    }) as Product[];
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

  // Get hero slides
  getHeroSlides: async (): Promise<HeroSlide[]> => {
    await delay(300);
    return heroesData as HeroSlide[];
  },

  // ========== ADMIN API ==========
  
  // Initialize products from JSON data (only if localStorage is empty)
  initializeProducts: async (): Promise<void> => {
    const existingProducts = localStorage.getItem('products');
    if (!existingProducts) {
      localStorage.setItem('products', JSON.stringify(productsData));
    }
  },

  // Get all products from localStorage (for admin)
  getAdminProducts: async (): Promise<Product[]> => {
    await delay(300);
    const products = localStorage.getItem('products');
    if (!products) {
      // Initialize with default data
      await api.initializeProducts();
      return productsData as Product[];
    }
    return JSON.parse(products);
  },

  // Create new product
  createProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    await delay(500);
    const products = await api.getAdminProducts();
    
    const newProduct: Product = {
      ...productData,
      id: `product-${Date.now()}`,
    };
    
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    
    return newProduct;
  },

  // Update product
  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product> => {
    await delay(400);
    const products = await api.getAdminProducts();
    const productIndex = products.findIndex((p) => p.id === id);
    
    if (productIndex === -1) {
      throw new Error('Product not found');
    }
    
    products[productIndex] = { ...products[productIndex], ...productData };
    localStorage.setItem('products', JSON.stringify(products));
    
    return products[productIndex];
  },

  // Delete product
  deleteProduct: async (id: string): Promise<void> => {
    await delay(400);
    const products = await api.getAdminProducts();
    const filteredProducts = products.filter((p) => p.id !== id);
    localStorage.setItem('products', JSON.stringify(filteredProducts));
  },

  // Get order statistics for admin
  getOrderStats: async () => {
    await delay(300);
    const orders = await api.getAllOrders();
    
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthOrders = orders.filter((o) => new Date(o.createdAt) >= thisMonth);
    const lastMonthOrders = orders.filter(
      (o) => new Date(o.createdAt) >= lastMonth && new Date(o.createdAt) < thisMonth
    );

    return {
      total: orders.length,
      thisMonth: thisMonthOrders.length,
      lastMonth: lastMonthOrders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      processing: orders.filter((o) => o.status === 'processing').length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    };
  },

  // Update order (full update for admin)
  updateOrder: async (id: string, orderData: Partial<Order>): Promise<Order> => {
    await delay(400);
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = orders.findIndex((o: Order) => o.id === id);
    
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }
    
    orders[orderIndex] = { ...orders[orderIndex], ...orderData };
    localStorage.setItem('orders', JSON.stringify(orders));
    
    return orders[orderIndex];
  },

  // Delete order
  deleteOrder: async (id: string): Promise<void> => {
    await delay(400);
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const filteredOrders = orders.filter((o: Order) => o.id !== id);
    localStorage.setItem('orders', JSON.stringify(filteredOrders));
  },

  // Get customer statistics
  getCustomerStats: async () => {
    await delay(300);
    const orders = await api.getAllOrders();
    
    // Group orders by customer
    const customerMap = new Map<string, {
      username: string;
      email: string;
      totalOrders: number;
      totalSpent: number;
      lastOrderDate: string;
      orders: Order[];
    }>();

    orders.forEach((order) => {
      const email = order.customerInfo.email;
      const username = email.split('@')[0];
      
      if (customerMap.has(email)) {
        const customer = customerMap.get(email)!;
        customer.totalOrders++;
        customer.totalSpent += order.total;
        customer.orders.push(order);
        if (new Date(order.createdAt) > new Date(customer.lastOrderDate)) {
          customer.lastOrderDate = order.createdAt;
        }
      } else {
        customerMap.set(email, {
          username,
          email,
          totalOrders: 1,
          totalSpent: order.total,
          lastOrderDate: order.createdAt,
          orders: [order],
        });
      }
    });

    return Array.from(customerMap.values());
  },
};
