/**
 * Category Service - API calls for categories and subcategories
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubCategory {
  id: number;
  name: string;
  description?: string;
  image?: string;
  categoryId: number;
  categoryName?: string;
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface BackendResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

interface BackendCategory {
  Id: number;
  Name: string;
  Description?: string;
  Image?: string;
  DisplayOrder?: number;
  IsActive?: boolean;
  CreatedAt?: string;
  UpdatedAt?: string;
}

interface BackendSubCategory {
  Id: number;
  Name: string;
  Description?: string;
  Image?: string;
  CategoryId: number;
  CategoryName?: string;
  DisplayOrder?: number;
  IsActive?: boolean;
  CreatedAt?: string;
  UpdatedAt?: string;
}

const transformCategory = (backend: BackendCategory): Category => ({
  id: backend.Id,
  name: backend.Name,
  description: backend.Description,
  image: backend.Image,
  displayOrder: backend.DisplayOrder,
  isActive: backend.IsActive,
  createdAt: backend.CreatedAt,
  updatedAt: backend.UpdatedAt,
});

const transformSubCategory = (backend: BackendSubCategory): SubCategory => ({
  id: backend.Id,
  name: backend.Name,
  description: backend.Description,
  image: backend.Image,
  categoryId: backend.CategoryId,
  categoryName: backend.CategoryName,
  displayOrder: backend.DisplayOrder,
  isActive: backend.IsActive,
  createdAt: backend.CreatedAt,
  updatedAt: backend.UpdatedAt,
});

/**
 * Get all categories
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_URL}/categories`);
    const rawData = await response.json();

    console.log('Categories API response:', rawData);

    if (!response.ok || rawData.status !== 'success') {
      throw new Error('Failed to fetch categories');
    }

    // Backend returns categories in 'message' field instead of 'data'
    const categories = Array.isArray(rawData.message) ? rawData.message : rawData.data;
    
    if (!Array.isArray(categories)) {
      console.error('Categories data is not an array:', categories);
      return [];
    }

    return categories.map(transformCategory);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Get subcategories by category ID
 */
export const getSubCategories = async (categoryId?: number): Promise<SubCategory[]> => {
  try {
    const url = new URL(`${API_URL}/subcategories`);
    if (categoryId) {
      url.searchParams.append('categoryId', categoryId.toString());
    }
    
    const response = await fetch(url.toString());
    const rawData = await response.json();

    console.log('SubCategories API response:', rawData);

    if (!response.ok || rawData.status !== 'success') {
      throw new Error('Failed to fetch subcategories');
    }

    // Backend returns subcategories in 'message' field instead of 'data'
    const subcategories = Array.isArray(rawData.message) ? rawData.message : rawData.data;
    
    if (!Array.isArray(subcategories)) {
      console.error('SubCategories data is not an array:', subcategories);
      return [];
    }

    return subcategories.map(transformSubCategory);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    throw error;
  }
};
