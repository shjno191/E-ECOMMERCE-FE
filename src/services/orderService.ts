/**
 * Order Service - API calls for orders
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Order {
  id: string | number;
  userId: string | number;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'momo' | 'zalopay' | 'cash';
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
  paymentMethod: 'momo' | 'zalopay' | 'cash';
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    email?: string;
  };
}

// Backend response structure
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

// Backend order structure (PascalCase from SQL Server)
interface BackendOrder {
  Id: number;
  UserId: number;
  Items: string; // JSON string
  Total: string | number;
  Status: string;
  PaymentMethod: string;
  CustomerInfo: string; // JSON string
  CreatedAt: string;
  UpdatedAt?: string;
}

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

  // Parse JSON strings
  try {
    if (backendOrder.Items) {
      items = JSON.parse(backendOrder.Items);
    }
  } catch (e) {
    console.warn('Failed to parse order items:', backendOrder.Items);
  }

  try {
    if (backendOrder.CustomerInfo) {
      customerInfo = JSON.parse(backendOrder.CustomerInfo);
    }
  } catch (e) {
    console.warn('Failed to parse customer info:', backendOrder.CustomerInfo);
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
  return {
    Items: JSON.stringify(order.items),
    Total: order.total,
    PaymentMethod: order.paymentMethod,
    CustomerInfo: JSON.stringify(order.customerInfo),
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

    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(backendOrder),
    });

    const data: BackendResponse<BackendOrder> = await response.json();

    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to create order');
    }

    return data.data ? transformOrder(data.data) : {} as Order;
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

    const url = `${API_URL}/orders/user${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data: BackendResponse<BackendOrder[]> = await response.json();

    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to fetch orders');
    }

    const orders = (data.data || []).map(transformOrder);

    return {
      orders,
      pagination: data.pagination ? {
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      } : undefined,
    };
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
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
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data: BackendResponse<BackendOrder> = await response.json();

    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to fetch order');
    }

    return data.data ? transformOrder(data.data) : null;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
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

    const url = `${API_URL}/orders${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data: BackendResponse<BackendOrder[]> = await response.json();

    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to fetch orders');
    }

    const orders = (data.data || []).map(transformOrder);

    return {
      orders,
      pagination: data.pagination ? {
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      } : undefined,
    };
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
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
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ Status: status }),
    });

    const data: BackendResponse<BackendOrder> = await response.json();

    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to update order status');
    }

    return data.data ? transformOrder(data.data) : {} as Order;
  } catch (error) {
    console.error('Error updating order status:', error);
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
    const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data: BackendResponse<BackendOrder> = await response.json();

    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to cancel order');
    }

    return data.data ? transformOrder(data.data) : {} as Order;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};
