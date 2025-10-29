import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/services/productService';

// CartItem interface
export interface CartItem {
  id: string;
  productId: string | number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  userId?: string;
}

interface CartStore {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, selectedColor: string, selectedSize: string) => void;
  removeFromCart: (productId: string | number, selectedColor: string, selectedSize: string) => void;
  updateQuantity: (productId: string | number, selectedColor: string, selectedSize: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
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

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (product, quantity, selectedColor, selectedSize) => {
        const user = getCurrentUser();
        set((state) => {
          const existingItem = state.items.find(
            (item) =>
              item.productId === product.id &&
              item.selectedColor === selectedColor &&
              item.selectedSize === selectedSize
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id &&
                item.selectedColor === selectedColor &&
                item.selectedSize === selectedSize
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          const newItem: CartItem = {
            id: `${product.id}-${selectedColor}-${selectedSize}`,
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity,
            selectedColor,
            selectedSize,
            userId: user || undefined,
          };

          return {
            items: [...state.items, newItem],
          };
        });
      },

      removeFromCart: (productId, selectedColor, selectedSize) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.productId === productId &&
                item.selectedColor === selectedColor &&
                item.selectedSize === selectedSize
              )
          ),
        }));
      },

      updateQuantity: (productId, selectedColor, selectedSize, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, selectedColor, selectedSize);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId &&
            item.selectedColor === selectedColor &&
            item.selectedSize === selectedSize
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.length;
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: `cart-storage-${getCurrentUser() || 'guest'}`,
    }
  )
);
