import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order } from '@/services/orderService';
import { getUserOrders } from '@/services/orderService';

interface OrderState {
    orders: Order[];
    currentOrder: Order | null;
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean; // Track if initial load is complete
}

interface OrderActions {
    addOrder: (order: Order) => void;
    setOrders: (orders: Order[]) => void;
    updateOrderStatus: (orderId: string, status: Order['status']) => void;
    getOrderById: (orderId: string) => Order | undefined;
    getNotCompletedOrdersCount: () => number;
    getTotalOrdersCount: () => number;
    clearCurrentOrder: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearOrders: () => void;
    loadOrdersFromBackend: (token: string) => Promise<void>;
    setInitialized: (initialized: boolean) => void;
}

// Get current user from auth storage
const getCurrentUser = () => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const { state } = JSON.parse(authStorage);
      return state?.user?.username || null;
    }
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  return null;
};

export const useOrderStore = create<OrderState & OrderActions>()(
    persist(
        (set, get) => ({
            orders: [],
            currentOrder: null,
            isLoading: false,
            error: null,
            isInitialized: false,

            addOrder: (order) => {
                set((state) => {
                    // Check if order already exists in store
                    const existingIndex = state.orders.findIndex(o => o.id === order.id);
                    
                    if (existingIndex >= 0) {
                        // Update existing order instead of adding duplicate
                        const updatedOrders = [...state.orders];
                        updatedOrders[existingIndex] = order;
                        return {
                            orders: updatedOrders,
                            currentOrder: order,
                        };
                    }
                    
                    // Add new order if it doesn't exist
                    return {
                        orders: [...state.orders, order],
                        currentOrder: order,
                    };
                });
            },

            setOrders: (orders) => {
                set({ orders, isInitialized: true });
            },

            updateOrderStatus: (orderId, status) => {
                set((state) => ({
                    orders: state.orders.map((order) =>
                        order.id === orderId ? { ...order, status } : order
                    ),
                    currentOrder: state.currentOrder?.id === orderId 
                        ? { ...state.currentOrder, status } 
                        : state.currentOrder,
                }));
            },

            getNotCompletedOrdersCount: () => {
                return get().orders.filter((order) => 
                    order.status !== 'delivered' && order.status !== 'cancelled'
                ).length;
            },

            getTotalOrdersCount: () => {
                return get().orders.length;
            },

            getOrderById: (orderId) => {
                return get().orders.find((order) => order.id === orderId);
            },

            clearCurrentOrder: () => {
                set({ currentOrder: null });
            },

            setLoading: (loading) => {
                set({ isLoading: loading });
            },

            setError: (error) => {
                set({ error });
            },

            clearOrders: () => {
                set({ orders: [], currentOrder: null, isInitialized: false });
            },

            setInitialized: (initialized) => {
                set({ isInitialized: initialized });
            },

            loadOrdersFromBackend: async (token) => {
                try {
                    set({ isLoading: true, error: null });
                    const result = await getUserOrders(token, { page: 1, limit: 100 });
                    set({ orders: result.orders, isLoading: false, isInitialized: true });
                } catch (error) {
                    console.error('Error loading orders from backend:', error);
                    set({ isLoading: false, error: 'Failed to load orders', isInitialized: true });
                }
            },
        }),
        {
            name: `order-storage-${getCurrentUser() || 'guest'}`,
        }
    )
);