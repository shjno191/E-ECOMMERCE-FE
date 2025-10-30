/**
 * Cart Service - API calls for shopping cart
 */

import { apiClient } from '@/lib/apiClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Backend response structure for cart item with nested product
interface BackendCartItemResponse {
  Id: number;
  CartId: string;
  ProductId: number;
  Quantity: number;
  CreatedAt: string;
  UpdatedAt: string;
  Products?: {
    Id: number;
    Name: string;
    Description?: string;
    Image: string;
    Category: string;
    Price: string | number;
    OriginalPrice?: string | number;
    Stock: number;
    Rating: number;
    Reviews: number;
    Colors?: string;
    Sizes?: string;
  };
  // Fallback fields for old format
  ProductName?: string;
  ProductImage?: string;
  Price?: number;
  SelectedColor?: string;
  SelectedSize?: string;
}

// Backend cart response structure
interface BackendCartResponse {
  status: string;
  message: string;
  data: {
    Id: string;
    UserId: string;
    CreatedAt: string;
    UpdatedAt: string;
    CartItems: BackendCartItemResponse[];
    total: number;
    itemCount: number;
  };
}

// Frontend CartItem type
export interface CartItem {
  id: number;
  userId?: string;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  createdAt: string;
  updatedAt: string;
}

interface AddToCartRequest {
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

/**
 * Transform backend cart item response to frontend format
 */
function transformCartItem(item: BackendCartItemResponse, cartUserId?: string): CartItem {
  // Extract product info from nested Products object or fallback to direct fields
  const productName = item.Products?.Name || item.ProductName || 'Unknown Product';
  const productImage = item.Products?.Image || item.ProductImage || '';
  const price = item.Products 
    ? (typeof item.Products.Price === 'string' ? parseFloat(item.Products.Price) : item.Products.Price)
    : (item.Price || 0);
  
  // For selectedColor and selectedSize, we need to get from item fields or use defaults
  // Since backend doesn't store these in the current response, use first available option
  let selectedColor = item.SelectedColor || 'Mặc định';
  let selectedSize = item.SelectedSize || 'Mặc định';
  
  if (item.Products) {
    if (item.Products.Colors && !item.SelectedColor) {
      const colors = item.Products.Colors.split(',').map(c => c.trim());
      selectedColor = colors[0] || 'Mặc định';
    }
    if (item.Products.Sizes && !item.SelectedSize) {
      const sizes = item.Products.Sizes.split(',').map(s => s.trim());
      selectedSize = sizes[0] || 'Mặc định';
    }
  }

  return {
    id: item.Id,
    userId: cartUserId,
    productId: item.ProductId,
    productName,
    productImage,
    price,
    quantity: item.Quantity,
    selectedColor,
    selectedSize,
    createdAt: item.CreatedAt,
    updatedAt: item.UpdatedAt,
  };
}

/**
 * Get user's cart items
 */
export async function getCartItems(token: string): Promise<CartItem[]> {
  try {
    const response = await apiClient.get<any>(
      '/cart',
      { requiresAuth: true }
    );

    console.log('Cart API response:', response);

    // Handle new response format with nested structure
    if (response.status === 'success' && response.data) {
      const cartData = response.data;
      
      if (cartData.CartItems && Array.isArray(cartData.CartItems)) {
        return cartData.CartItems.map((item: BackendCartItemResponse) => 
          transformCartItem(item, cartData.UserId)
        );
      }
    }

    // Handle different legacy response formats
    let items: BackendCartItemResponse[];
    
    if (Array.isArray(response)) {
      items = response;
    } else if (response.data && Array.isArray(response.data)) {
      items = response.data;
    } else if (response.items && Array.isArray(response.items)) {
      items = response.items;
    } else if (response.CartItems && Array.isArray(response.CartItems)) {
      items = response.CartItems;
    } else {
      console.warn('Unexpected cart response format:', response);
      return [];
    }

    return items.map(item => transformCartItem(item));
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }
}

/**
 * Add item to cart
 */
export async function addToCart(
  cartData: AddToCartRequest,
  token: string
): Promise<CartItem> {
  try {
    // Transform camelCase to PascalCase for backend
    const backendPayload = {
      ProductId: cartData.productId,
      ProductName: cartData.productName,
      ProductImage: cartData.productImage,
      Price: cartData.price,
      Quantity: cartData.quantity,
      SelectedColor: cartData.selectedColor,
      SelectedSize: cartData.selectedSize,
    };

    const response = await apiClient.post<any>(
      '/cart',
      backendPayload,
      { requiresAuth: true }
    );

    // Handle different response formats
    const itemData = response.data || response;
    return transformCartItem(itemData);
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  cartItemId: number,
  quantity: number,
  token: string
): Promise<CartItem> {
  try {
    // Transform to PascalCase for backend
    const backendPayload = {
      Quantity: quantity,
    };

    const response = await apiClient.put<any>(
      `/cart/${cartItemId}`,
      backendPayload,
      { requiresAuth: true }
    );

    // Handle different response formats
    const itemData = response.data || response;
    return transformCartItem(itemData);
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(
  cartItemId: number,
  token: string
): Promise<void> {
  try {
    await apiClient.delete(`/cart/${cartItemId}`, { requiresAuth: true });
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
}

/**
 * Clear entire cart
 */
export async function clearCart(token: string): Promise<void> {
  try {
    await apiClient.delete('/cart/clear', { requiresAuth: true });
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}

/**
 * Sync local cart to backend after login
 */
export async function syncCartToBackend(
  localItems: AddToCartRequest[],
  token: string
): Promise<CartItem[]> {
  try {
    // Transform each item to PascalCase for backend
    const backendItems = localItems.map(item => ({
      ProductId: item.productId,
      ProductName: item.productName,
      ProductImage: item.productImage,
      Price: item.price,
      Quantity: item.quantity,
      SelectedColor: item.selectedColor,
      SelectedSize: item.selectedSize,
    }));

    const response = await apiClient.post<any>(
      '/cart/sync',
      { Items: backendItems }, // Backend might expect "Items" in PascalCase
      { requiresAuth: true }
    );

    // Handle different response formats
    let items: BackendCartItemResponse[];
    
    if (Array.isArray(response)) {
      items = response;
    } else if (response.data && Array.isArray(response.data)) {
      items = response.data;
    } else if (response.items && Array.isArray(response.items)) {
      items = response.items;
    } else {
      console.warn('Unexpected sync response format:', response);
      return [];
    }

    return items.map(item => transformCartItem(item));
  } catch (error) {
    console.error('Error syncing cart:', error);
    throw error;
  }
}
