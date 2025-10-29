import { apiClient } from '@/lib/apiClient';

// Backend response structure
interface BannerResponse {
  Id: number;
  Title: string;
  Description: string;
  Image: string;
  Link: string;
  ButtonText?: string;
  ButtonLink?: string;
  Subtitle?: string;
  BackgroundColor?: string;
  DisplayOrder: number;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

// Frontend Banner type
export interface Banner {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
  buttonText?: string;
  buttonLink?: string;
  subtitle?: string;
  backgroundColor?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transform backend banner response to frontend format
 * Backend uses PascalCase, frontend uses camelCase
 */
function transformBanner(banner: BannerResponse): Banner {
  return {
    id: banner.Id,
    title: banner.Title,
    description: banner.Description,
    image: banner.Image,
    link: banner.Link,
    buttonText: banner.ButtonText || 'Mua ngay',
    buttonLink: banner.ButtonLink || banner.Link,
    subtitle: banner.Subtitle || '',
    backgroundColor: banner.BackgroundColor || 'from-blue-500 to-purple-600',
    displayOrder: banner.DisplayOrder,
    isActive: banner.IsActive,
    createdAt: banner.CreatedAt,
    updatedAt: banner.UpdatedAt,
  };
}

/**
 * Get all active banners
 */
export async function getBanners(): Promise<Banner[]> {
  try {
    const response = await apiClient.get<{ data: BannerResponse[] }>('/banners', {
      requiresAuth: false, // Public endpoint
    });

    // Transform backend data to frontend format
    return response.data.map(transformBanner);
  } catch (error) {
    console.error('Error fetching banners:', error);
    throw error;
  }
}

/**
 * Get banner by ID
 */
export async function getBannerById(id: number): Promise<Banner> {
  try {
    const response = await apiClient.get<{ data: BannerResponse }>(
      `/banners/${id}`,
      { requiresAuth: false }
    );

    return transformBanner(response.data);
  } catch (error) {
    console.error('Error fetching banner:', error);
    throw error;
  }
}

/**
 * Admin: Create new banner
 */
export async function createBanner(
  bannerData: Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>,
  token: string
): Promise<Banner> {
  try {
    const response = await apiClient.post<{ data: BannerResponse }>(
      '/admin/banners',
      bannerData,
      { requiresAuth: true }
    );

    return transformBanner(response.data);
  } catch (error) {
    console.error('Error creating banner:', error);
    throw error;
  }
}

/**
 * Admin: Update banner
 */
export async function updateBanner(
  id: number,
  bannerData: Partial<Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>>,
  token: string
): Promise<Banner> {
  try {
    const response = await apiClient.put<{ data: BannerResponse }>(
      `/admin/banners/${id}`,
      bannerData,
      { requiresAuth: true }
    );

    return transformBanner(response.data);
  } catch (error) {
    console.error('Error updating banner:', error);
    throw error;
  }
}

/**
 * Admin: Delete banner
 */
export async function deleteBanner(id: number, token: string): Promise<void> {
  try {
    await apiClient.delete(`/admin/banners/${id}`, { requiresAuth: true });
  } catch (error) {
    console.error('Error deleting banner:', error);
    throw error;
  }
}
