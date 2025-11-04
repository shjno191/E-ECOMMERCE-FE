/**
 * Product Service - API calls for products
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Product {
  id: number | string;
  name: string;
  category: string;
  subCategoryId?: number;
  subCategoryName?: string;
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

// Backend product structure (PascalCase from SQL Server)
interface BackendProduct {
  Id: number;
  Name: string;
  Category?: string;
  SubCategoryId?: number;
  SubCategoryName?: string;
  SubCategory?: {
    Id: number;
    Name: string;
    CategoryId: number;
    Category?: {
      Id: number;
      Name: string;
    };
  };
  Price: string | number;
  OriginalPrice?: string | number;
  Description: string;
  Image: string;
  Rating?: number;
  Reviews?: number;
  Stock: number;
  Colors?: string; // JSON string
  Sizes?: string;  // JSON string
  CreatedAt?: string;
  UpdatedAt?: string;
}

/**
 * Transform backend product to frontend format
 */
const transformProduct = (backendProduct: BackendProduct): Product => {
  let colors: string[] = [];
  let sizes: string[] = [];

  // Parse colors - handle both JSON array and comma-separated string
  if (backendProduct.Colors) {
    try {
      // Try parsing as JSON array first
      colors = JSON.parse(backendProduct.Colors);
    } catch {
      // If JSON parse fails, treat as comma-separated string
      try {
        colors = backendProduct.Colors
          .split(',')
          .map((color: string) => color.trim())
          .filter((color: string) => color.length > 0);
      } catch (e) {
        console.warn('Failed to parse colors (both JSON and CSV):', backendProduct.Colors, e);
        colors = [];
      }
    }
  }

  // Parse sizes - handle both JSON array and comma-separated string
  if (backendProduct.Sizes) {
    try {
      // Try parsing as JSON array first
      sizes = JSON.parse(backendProduct.Sizes);
    } catch {
      // If JSON parse fails, treat as comma-separated string
      try {
        sizes = backendProduct.Sizes
          .split(',')
          .map((size: string) => size.trim())
          .filter((size: string) => size.length > 0);
      } catch (e) {
        console.warn('Failed to parse sizes (both JSON and CSV):', backendProduct.Sizes, e);
        sizes = [];
      }
    }
  }

  return {
    id: backendProduct.Id,
    name: backendProduct.Name,
    category: backendProduct.SubCategory?.Category?.Name || backendProduct.Category || backendProduct.SubCategoryName || '',
    subCategoryId: backendProduct.SubCategoryId,
    subCategoryName: backendProduct.SubCategory?.Name || backendProduct.SubCategoryName,
    price: typeof backendProduct.Price === 'string' ? parseFloat(backendProduct.Price) : backendProduct.Price,
    originalPrice: backendProduct.OriginalPrice 
      ? (typeof backendProduct.OriginalPrice === 'string' ? parseFloat(backendProduct.OriginalPrice) : backendProduct.OriginalPrice)
      : undefined,
    description: backendProduct.Description,
    image: backendProduct.Image,
    rating: backendProduct.Rating,
    reviews: backendProduct.Reviews,
    stock: backendProduct.Stock,
    colors,
    sizes,
    createdAt: backendProduct.CreatedAt,
    updatedAt: backendProduct.UpdatedAt,
  };
};

/**
 * Get all products
 */
export const getProducts = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}): Promise<{ products: Product[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);

    const url = `${API_URL}/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url);
    const data: BackendResponse<BackendProduct[]> = await response.json();

    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to fetch products');
    }

    // Transform backend products to frontend format and return pagination
    const products = (data.data || []).map(transformProduct);
    return {
      products,
      pagination: data.pagination ? {
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      } : undefined,
    };
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
    const data: BackendResponse<BackendProduct> = await response.json();

    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to fetch product');
    }

    return data.data ? transformProduct(data.data) : null;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

/**
 * Search products
 */
export const searchProducts = async (query: string, page?: number, limit?: number): Promise<{ products: Product[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> => {
  return getProducts({ search: query, page, limit });
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (category: string, page?: number, limit?: number): Promise<{ products: Product[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> => {
  return getProducts({ category, page, limit });
};

/**
 * Create new product (Admin only)
 */
export const createProduct = async (
  product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  token: string
): Promise<Product> => {
  try {
    // Transform to backend format - only required fields from schema
    const backendProduct = {
      Name: product.name,
      SubCategoryId: product.subCategoryId,
      Price: product.price,
      OriginalPrice: product.originalPrice,
      Description: product.description || '',
      Image: product.image,
      Stock: product.stock,
      Rating: product.rating,
      Reviews: product.reviews,
      Colors: product.colors ? JSON.stringify(product.colors) : null,
      Sizes: product.sizes ? JSON.stringify(product.sizes) : null,
    };

    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(backendProduct),
    });

    const data: BackendResponse<BackendProduct> = await response.json();

    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to create product');
    }

    return data.data ? transformProduct(data.data) : {} as Product;
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
    // Transform to backend format - only fields that exist in schema
    const backendUpdates: Partial<BackendProduct> = {};
    if (updates.name !== undefined) backendUpdates.Name = updates.name;
    if (updates.subCategoryId !== undefined) backendUpdates.SubCategoryId = updates.subCategoryId;
    if (updates.price !== undefined) backendUpdates.Price = updates.price;
    if (updates.originalPrice !== undefined) backendUpdates.OriginalPrice = updates.originalPrice;
    if (updates.description !== undefined) backendUpdates.Description = updates.description;
    if (updates.image !== undefined) backendUpdates.Image = updates.image;
    if (updates.stock !== undefined) backendUpdates.Stock = updates.stock;
    if (updates.rating !== undefined) backendUpdates.Rating = updates.rating;
    if (updates.reviews !== undefined) backendUpdates.Reviews = updates.reviews;
    if (updates.colors !== undefined) backendUpdates.Colors = JSON.stringify(updates.colors);
    if (updates.sizes !== undefined) backendUpdates.Sizes = JSON.stringify(updates.sizes);

    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(backendUpdates),
    });

    const data: BackendResponse<BackendProduct> = await response.json();

    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to update product');
    }

    return data.data ? transformProduct(data.data) : {} as Product;
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

    const data: BackendResponse<null> = await response.json();

    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to delete product');
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
    const data: BackendResponse<string[]> = await response.json();

    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Failed to fetch categories');
    }

    return data.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return default categories on error
    return ['Áo', 'Quần', 'Giày', 'Phụ kiện'];
  }
};
