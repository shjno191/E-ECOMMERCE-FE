import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order } from '@/services/api';

interface OrderState {
    orders: Order[];
    currentOrder: Order | null;
    isLoading: boolean;
    error: string | null;
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

            addOrder: (order) => {
                set((state) => ({
                    orders: [...state.orders, order],
                    currentOrder: order,
                }));
            },

            setOrders: (orders) => {
                set({ orders });
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
                set({ orders: [], currentOrder: null });
            },
        }),
        {
            name: `order-storage-${getCurrentUser() || 'guest'}`,
        }
    )
);