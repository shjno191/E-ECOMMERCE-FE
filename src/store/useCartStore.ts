import { create } from 'zustand';
import type { Product } from '@/services/productService';
import * as cartService from '@/services/cartService';

// CartItem interface
export interface CartItem {
  id: string | number;
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
  isLoading: boolean;
  isSynced: boolean;
  addToCart: (product: Product, quantity: number, selectedColor: string, selectedSize: string, token?: string) => Promise<void>;
  removeFromCart: (productId: string | number, selectedColor: string, selectedSize: string, token?: string) => Promise<void>;
  updateQuantity: (productId: string | number, selectedColor: string, selectedSize: string, quantity: number, token?: string) => Promise<void>;
  clearCart: (token?: string) => Promise<void>;
  loadCartFromBackend: (token: string) => Promise<void>;
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

export const useCartStore = create<CartStore>()((set, get) => ({
  items: [],
  isLoading: false,
  isSynced: false,
      
  
  addToCart: async (product, quantity, selectedColor, selectedSize, token) => {
    if (!token) {
      throw new Error('User must be authenticated to add items to cart');
    }

    const user = getCurrentUser();
    
    try {
      set({ isLoading: true });
      const backendItem = await cartService.addToCart(
        {
          productId: Number(product.id),
          productName: product.name,
          productImage: product.image,
          price: product.price,
          quantity,
          selectedColor,
          selectedSize,
        },
        token
      );

      // Update local state with backend data (no localStorage persist)
      set((state) => {
        const existingIndex = state.items.findIndex(
          (item) => item.id === backendItem.id
        );

        if (existingIndex >= 0) {
          const newItems = [...state.items];
          newItems[existingIndex] = {
            id: backendItem.id,
            productId: backendItem.productId,
            name: backendItem.productName,
            price: backendItem.price,
            image: backendItem.productImage,
            quantity: backendItem.quantity,
            selectedColor: backendItem.selectedColor,
            selectedSize: backendItem.selectedSize,
            userId: user || undefined,
          };
          return { items: newItems, isLoading: false };
        }

        return {
          items: [
            ...state.items,
            {
              id: backendItem.id,
              productId: backendItem.productId,
              name: backendItem.productName,
              price: backendItem.price,
              image: backendItem.productImage,
              quantity: backendItem.quantity,
              selectedColor: backendItem.selectedColor,
              selectedSize: backendItem.selectedSize,
              userId: user || undefined,
            },
          ],
          isLoading: false,
        };
      });
    } catch (error) {
      console.error('Error adding to cart (backend):', error);
      set({ isLoading: false });
      throw error;
    }
  },      removeFromCart: async (productId, selectedColor, selectedSize, token) => {
        const item = get().items.find(
          (item) =>
            item.productId === productId &&
            item.selectedColor === selectedColor &&
            item.selectedSize === selectedSize
        );

        if (token && item && typeof item.id === 'number') {
          try {
            await cartService.removeFromCart(item.id, token);
          } catch (error) {
            console.error('Error removing from cart (backend):', error);
          }
        }

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

      updateQuantity: async (productId, selectedColor, selectedSize, quantity, token) => {
        if (quantity <= 0) {
          await get().removeFromCart(productId, selectedColor, selectedSize, token);
          return;
        }

        const item = get().items.find(
          (item) =>
            item.productId === productId &&
            item.selectedColor === selectedColor &&
            item.selectedSize === selectedSize
        );

        if (token && item && typeof item.id === 'number') {
          try {
            await cartService.updateCartItem(item.id, quantity, token);
          } catch (error) {
            console.error('Error updating cart (backend):', error);
          }
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

      clearCart: async (token) => {
        if (token) {
          try {
            await cartService.clearCart(token);
          } catch (error) {
            console.error('Error clearing cart (backend):', error);
          }
        }
        set({ items: [] });
  },

  loadCartFromBackend: async (token) => {
    try {
      set({ isLoading: true });
      const backendItems = await cartService.getCartItems(token);
      
      const cartItems: CartItem[] = backendItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.productName,
        price: item.price,
        image: item.productImage,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      }));

      set({ items: cartItems, isLoading: false, isSynced: true });
    } catch (error) {
      console.error('Error loading cart from backend:', error);
      set({ isLoading: false });
    }
  },

  getTotalItems: () => {
    return get().items.length;
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));