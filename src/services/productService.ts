/**
 * Product Service - API calls for products
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Product {
  id: number | string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  rating?: number;
  reviews?: number;
  stock: number;
  colors?: string[];
  sizes?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get all products
 */
export const getProducts = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}): Promise<Product[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);

    const url = `${API_URL}/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url);
    const data: ApiResponse<Product[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || 'Failed to fetch products');
    }

    return data.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (id: string | number): Promise<Product | null> => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`);
    const data: ApiResponse<Product> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || 'Failed to fetch product');
    }

    return data.data || null;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

/**
 * Search products
 */
export const searchProducts = async (query: string): Promise<Product[]> => {
  return getProducts({ search: query });
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  return getProducts({ category });
};

/**
 * Create new product (Admin only)
 */
export const createProduct = async (
  product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  token: string
): Promise<Product> => {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });

    const data: ApiResponse<Product> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || 'Failed to create product');
    }

    return data.data!;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Update product (Admin only)
 */
export const updateProduct = async (
  id: string | number,
  updates: Partial<Product>,
  token: string
): Promise<Product> => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const data: ApiResponse<Product> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || 'Failed to update product');
    }

    return data.data!;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Delete product (Admin only)
 */
export const deleteProduct = async (
  id: string | number,
  token: string
): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data: ApiResponse<null> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || 'Failed to delete product');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * Get product categories
 */
export const getCategories = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_URL}/products/categories`);
    const data: ApiResponse<string[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || 'Failed to fetch categories');
    }

    return data.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return default categories on error
    return ['Áo', 'Quần', 'Giày', 'Phụ kiện'];
  }
};
