/**
 * Order Service - API calls for orders
 */

import { apiClient } from '@/lib/apiClient';

export interface Order {
  id: string | number;
  userId: string | number;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cash' | 'transfer'; // Tiền mặt | Chuyển khoản
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    email?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string | number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

export interface CreateOrderRequest {
  items: {
    productId: string | number;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    selectedColor: string;
    selectedSize: string;
  }[];
  total: number;
  paymentMethod: 'cash' | 'transfer'; // Tiền mặt | Chuyển khoản
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    email?: string;
  };
}

// Backend response structure (similar to cart)
interface BackendResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Backend order item with nested product
interface BackendOrderItem {
  Id?: number;
  OrderId?: string;
  ProductId: number;
  Quantity: number;
  SelectedColor?: string;
  SelectedSize?: string;
  Price?: number | string;
  Products?: {
    Id: number;
    Name: string;
    Image: string;
    Price: string | number;
    Description?: string;
    Category?: string;
  };
  // Fallback for old format
  ProductName?: string;
  ProductImage?: string;
}

// Backend order structure (PascalCase from SQL Server)
interface BackendOrder {
  Id: number | string;
  UserId: number | string;
  Status: string;
  PaymentMethod: string;
  Total: string | number;
  CreatedAt: string;
  UpdatedAt?: string;
  // New format: nested OrderItems array
  OrderItems?: BackendOrderItem[];
  // Old format: JSON strings
  Items?: string;
  CustomerInfo?: string;
  // Direct customer info fields (new format)
  CustomerName?: string;
  CustomerPhone?: string;
  CustomerAddress?: string;
  CustomerEmail?: string;
}

/**
 * Transform backend order item to frontend format
 */
const transformOrderItem = (item: BackendOrderItem): OrderItem => {
  const productName = item.Products?.Name || item.ProductName || 'Unknown Product';
  const productImage = item.Products?.Image || item.ProductImage || '';
  const price = item.Products
    ? (typeof item.Products.Price === 'string' ? parseFloat(item.Products.Price) : item.Products.Price)
    : (typeof item.Price === 'string' ? parseFloat(item.Price) : (item.Price || 0));

  return {
    productId: item.ProductId,
    productName,
    productImage,
    price,
    quantity: item.Quantity,
    selectedColor: item.SelectedColor || 'Mặc định',
    selectedSize: item.SelectedSize || 'Mặc định',
  };
};

/**
 * Transform backend order to frontend format
 */
const transformOrder = (backendOrder: BackendOrder): Order => {
  let items: OrderItem[] = [];
  let customerInfo = {
    name: '',
    phone: '',
    address: '',
    email: '',
  };

  // Handle new format with nested OrderItems
  if (backendOrder.OrderItems && Array.isArray(backendOrder.OrderItems)) {
    items = backendOrder.OrderItems.map(transformOrderItem);
  } 
  // Fallback: Parse JSON string (old format)
  else if (backendOrder.Items) {
    try {
      const parsedItems = JSON.parse(backendOrder.Items);
      items = Array.isArray(parsedItems) ? parsedItems : [];
    } catch (e) {
      console.warn('Failed to parse order items:', backendOrder.Items);
    }
  }

  // Handle customer info from direct fields (new format)
  if (backendOrder.CustomerName || backendOrder.CustomerPhone) {
    customerInfo = {
      name: backendOrder.CustomerName || '',
      phone: backendOrder.CustomerPhone || '',
      address: backendOrder.CustomerAddress || '',
      email: backendOrder.CustomerEmail || '',
    };
  }
  // Fallback: Parse JSON string (old format)
  else if (backendOrder.CustomerInfo) {
    try {
      customerInfo = JSON.parse(backendOrder.CustomerInfo);
    } catch (e) {
      console.warn('Failed to parse customer info:', backendOrder.CustomerInfo);
    }
  }

  return {
    id: backendOrder.Id,
    userId: backendOrder.UserId,
    items,
    total: typeof backendOrder.Total === 'string' ? parseFloat(backendOrder.Total) : backendOrder.Total,
    status: backendOrder.Status as Order['status'],
    paymentMethod: backendOrder.PaymentMethod as Order['paymentMethod'],
    customerInfo,
    createdAt: backendOrder.CreatedAt,
    updatedAt: backendOrder.UpdatedAt,
  };
};

/**
 * Transform frontend order to backend format
 */
const toBackendOrder = (order: CreateOrderRequest) => {
  // Try sending as nested objects first (modern backend format)
  // If backend expects JSON strings, we can fallback
  return {
    Items: order.items.map(item => ({
      ProductId: item.productId,
      ProductName: item.productName,
      ProductImage: item.productImage,
      Price: item.price,
      Quantity: item.quantity,
      SelectedColor: item.selectedColor,
      SelectedSize: item.selectedSize,
    })),
    Total: order.total,
    PaymentMethod: order.paymentMethod,
    CustomerName: order.customerInfo.name,
    CustomerPhone: order.customerInfo.phone,
    CustomerAddress: order.customerInfo.address,
    CustomerEmail: order.customerInfo.email || '',
  };
};

/**
 * Create new order
 */
export const createOrder = async (
  orderData: CreateOrderRequest,
  token: string
): Promise<Order> => {
  try {
    const backendOrder = toBackendOrder(orderData);
    
    console.log('📤 Sending order to backend:', backendOrder);

    const response = await apiClient.post<any>(
      '/orders',
      backendOrder,
      { requiresAuth: true }
    );

    console.log('📥 Create order API response:', response);

    // Handle error response
    if (response.status === 'error') {
      throw new Error(response.message || 'Failed to create order');
    }

    // Handle different response formats
    let backendOrderData: BackendOrder | null = null;
    
    if (response.data) {
      backendOrderData = response.data;
    } else if (response.order) {
      backendOrderData = response.order;
    } else if (response.Id) {
      backendOrderData = response;
    }

    return backendOrderData ? transformOrder(backendOrderData) : {} as Order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Get user orders
 */
export const getUserOrders = async (
  token: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
  }
): Promise<{ orders: Order[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `/orders/user${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await apiClient.get<any>(
      endpoint,
      { requiresAuth: true }
    );

    console.log('User orders API response:', response);

    // Handle error response
    if (response.status === 'error') {
      console.error('Orders API error:', response.message);
      return { orders: [], pagination: undefined };
    }

    // Handle different response formats
    let backendOrders: BackendOrder[] = [];
    
    if (Array.isArray(response)) {
      backendOrders = response;
    } else if (response.data && Array.isArray(response.data)) {
      backendOrders = response.data;
    } else if (response.orders && Array.isArray(response.orders)) {
      backendOrders = response.orders;
    } else {
      console.warn('Unexpected orders response format:', response);
      return { orders: [], pagination: undefined };
    }

    const orders = backendOrders.map(transformOrder);

    return {
      orders,
      pagination: response.pagination ? {
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      } : undefined,
    };
  } catch (error) {
    console.error('Error fetching user orders:', error);
    // Return empty instead of throwing to prevent page crash
    return { orders: [], pagination: undefined };
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (
  orderId: string | number,
  token: string
): Promise<Order | null> => {
  try {
    const response = await apiClient.get(`/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }) as any;

    console.log('Order by ID API response:', response);

    // Handle different response formats
    let backendOrder: BackendOrder | null = null;
    
    if (response.data) {
      backendOrder = response.data;
    } else if (response.order) {
      backendOrder = response.order;
    } else if (response.Id) {
      // Direct order object
      backendOrder = response;
    }

    return backendOrder ? transformOrder(backendOrder) : null;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
};

/**
 * Get all orders (Admin only)
 */
export const getAllOrders = async (
  token: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
  }
): Promise<{ orders: Order[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const url = `/orders${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await apiClient.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }) as any;

    console.log('All orders API response:', response);

    // Handle different response formats
    let backendOrders: BackendOrder[] = [];
    
    if (Array.isArray(response)) {
      backendOrders = response;
    } else if (response.data && Array.isArray(response.data)) {
      backendOrders = response.data;
    } else if (response.orders && Array.isArray(response.orders)) {
      backendOrders = response.orders;
    } else {
      console.warn('Unexpected orders response format:', response);
      return { orders: [], pagination: undefined };
    }

    const orders = backendOrders.map(transformOrder);

    return {
      orders,
      pagination: response.pagination ? {
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      } : undefined,
    };
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return { orders: [], pagination: undefined };
  }
};

/**
 * Update order status (Admin only)
 */
export const updateOrderStatus = async (
  orderId: string | number,
  status: Order['status'],
  token: string
): Promise<Order> => {
  try {
    console.log('🔧 updateOrderStatus called:', { orderId, status, token: token.substring(0, 20) + '...' });
    
    const response = await apiClient.put(`/orders/${orderId}/status`, 
      { Status: status },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    ) as any;

    console.log('📨 API response:', response);

    // Handle response format
    const backendOrder = response.data || response;
    return backendOrder ? transformOrder(backendOrder) : {} as Order;
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    throw error;
  }
};

/**
 * Cancel order
 */
export const cancelOrder = async (
  orderId: string | number,
  token: string
): Promise<Order> => {
  try {
    const response = await apiClient.put(`/orders/${orderId}/cancel`, 
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    ) as any;

    // Handle response format
    const backendOrder = response.data || response;
    return backendOrder ? transformOrder(backendOrder) : {} as Order;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};
