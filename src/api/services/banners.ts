import apiClient from '../axios';
import { type Banner, type CreateBannerRequest, type UpdateBannerRequest, type PaginatedResponse, type QueryParams } from '../../types';
import { normalizePaginatedResponse, normalizeItemResponse } from '../../utils/pagination';
import { logger } from '../../utils/logger';
import { handleApiError } from '../../utils/errorHandler';
import { config } from '../../config/env';

// Re-export types for convenience
export type { Banner, CreateBannerRequest, UpdateBannerRequest };

// Normalize API <-> UI fields
const mapApiBannerToUi = (b: any): Banner => {
  // The API may return image_path (like "banners/example.jpg") or image_url (full URL)
  // We need to convert image_path to a full URL for display
  let imageUrl = b.image_url || b.image;
  
  // If we have image_path but no image_url, construct the URL
  if (b.image_path && !imageUrl) {
    // Get base URL from config (remove /api/v1/admin if present)
    const baseUrl = config.apiUrl.replace('/api/v1/admin', '').replace(/\/$/, '') || 'http://localhost:8000';
    // Construct full URL: baseUrl/storage/image_path
    imageUrl = `${baseUrl}/storage/${b.image_path}`;
  }
  
  return {
    id: b.id,
    created_at: b.created_at,
    updated_at: b.updated_at,
    deleted_at: b.deleted_at,
    title_ar: b.title_ar ?? '',
    title_en: b.title_en ?? '',
    description_ar: b.description_ar,
    description_en: b.description_en,
    image: b.image || b.image_path, // Store path for editing
    image_url: imageUrl, // Full URL for display
    link: b.link,
    status: b.status,
    order: b.order,
    start_date: b.start_date,
    end_date: b.end_date,
  };
};

const mapUiToApiPayload = (data: Partial<CreateBannerRequest | UpdateBannerRequest>) => {
  const payload: Record<string, any> = {};
  
  // Required fields
  if (data.title_ar !== undefined) payload.title_ar = data.title_ar;
  if (data.title_en !== undefined) payload.title_en = data.title_en;
  if (data.status !== undefined) payload.status = data.status;
  
  // Optional fields - convert empty strings to null or omit
  if (data.description_ar !== undefined) {
    payload.description_ar = data.description_ar?.trim() || null;
  }
  if (data.description_en !== undefined) {
    payload.description_en = data.description_en?.trim() || null;
  }
  // For banners, when we have a path from upload, use image_path field
  // The API expects image_path (string path like "banners/example.jpg") from /banners/upload/image
  // Do NOT send image field when using image_path to avoid validation error
  if (data.image !== undefined) {
    const imageValue = data.image?.trim() || null;
    if (imageValue) {
      // Use image_path for the path returned from upload endpoint
      // Don't send image field at all when using image_path
      payload.image_path = imageValue;
    }
    // If imageValue is null/empty, don't send image_path (will keep existing image)
  }
  if (data.link !== undefined) {
    payload.link = data.link?.trim() || null;
  }
  if (data.order !== undefined) {
    payload.order = data.order !== null && data.order !== undefined ? Number(data.order) : null;
  }
  if (data.start_date !== undefined) {
    payload.start_date = data.start_date?.trim() || null;
  }
  if (data.end_date !== undefined) {
    payload.end_date = data.end_date?.trim() || null;
  }
  
  return payload;
};

export const bannersService = {
  getBanners: async (params?: QueryParams): Promise<PaginatedResponse<Banner>> => {
    try {
      // Remove empty strings/nulls from params to prevent over-filtering on backend
      const cleanedParams = params
        ? Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
          )
        : undefined;
      
      logger.log('Fetching banners', { params: cleanedParams });
      const response = await apiClient.get('/banners', { params: cleanedParams });
      
      logger.log('Banners response received', { 
        dataLength: response.data?.data?.length,
        metaTotal: response.data?.meta?.total,
        hasData: !!response.data?.data,
        isArray: Array.isArray(response.data?.data),
      });
      
      const normalized = normalizePaginatedResponse<Banner>(response.data, cleanedParams, mapApiBannerToUi);
      
      logger.log('Banners normalized', { 
        dataLength: normalized.data?.length,
        total: normalized.total,
        firstItem: normalized.data?.[0]
      });
      
      return normalized;
    } catch (error: any) {
      logger.error('Failed to fetch banners', error, { params });
      throw handleApiError(error, { endpoint: '/banners', params });
    }
  },

  getBanner: async (id: number): Promise<Banner> => {
    try {
      logger.log('Fetching banner', { id });
      const response = await apiClient.get(`/banners/${id}`);
      return normalizeItemResponse<Banner>(response.data, mapApiBannerToUi);
    } catch (error: any) {
      logger.error('Failed to fetch banner', error, { id });
      throw handleApiError(error, { endpoint: `/banners/${id}` });
    }
  },

  createBanner: async (data: CreateBannerRequest): Promise<Banner> => {
    try {
      logger.log('Creating banner', { title_ar: data.title_ar, title_en: data.title_en });
      const payload = mapUiToApiPayload(data);
      const response = await apiClient.post('/banners', payload);
      const banner = normalizeItemResponse<Banner>(response.data, mapApiBannerToUi);
      logger.log('Banner created successfully', { id: banner.id });
      return banner;
    } catch (error: any) {
      logger.error('Failed to create banner', error, { data });
      throw handleApiError(error, { endpoint: '/banners', method: 'POST' });
    }
  },

  updateBanner: async (id: number, data: UpdateBannerRequest): Promise<Banner> => {
    try {
      logger.log('Updating banner', { id });
      const payload = mapUiToApiPayload(data);
      const response = await apiClient.put(`/banners/${id}`, payload);
      const banner = normalizeItemResponse<Banner>(response.data, mapApiBannerToUi);
      logger.log('Banner updated successfully', { id: banner.id });
      return banner;
    } catch (error: any) {
      logger.error('Failed to update banner', error, { id, data });
      throw handleApiError(error, { endpoint: `/banners/${id}`, method: 'PUT' });
    }
  },

  deleteBanner: async (id: number): Promise<void> => {
    try {
      logger.log('Deleting banner', { id });
      await apiClient.delete(`/banners/${id}`);
      logger.log('Banner deleted successfully', { id });
    } catch (error: any) {
      logger.error('Failed to delete banner', error, { id });
      // If retry also fails with 404, consider it successful (idempotent delete)
      if (error?.response?.status === 404) {
        logger.log('Banner already deleted (404)', { id });
        return;
      }
      throw handleApiError(error, { endpoint: `/banners/${id}`, method: 'DELETE' });
    }
  },

  uploadImage: async (file: File): Promise<string> => {
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error('حجم الصورة كبير جداً. الحد الأقصى 10MB / Image size is too large. Maximum 10MB');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('نوع الملف غير مدعوم. يرجى رفع صورة (JPEG, PNG, GIF, WebP) / File type not supported. Please upload an image (JPEG, PNG, GIF, WebP)');
    }

    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await apiClient.post('/banners/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const payload = response.data ?? {};
      // The API returns data.path (like "banners/example.jpg"), not a full URL
      const path =
        payload?.data?.path ??
        payload?.path ??
        payload?.data?.image_path ??
        payload?.image_path;

      if (typeof path === 'string' && path.trim() !== '') {
        return path;
      }

      // Fallback: try to get URL if path is not available (for backward compatibility)
      const url =
        payload?.data?.image_url ??
        payload?.image_url ??
        payload?.data?.url ??
        payload?.url;

      if (typeof url === 'string' && url.trim() !== '') {
        return url;
      }

      throw new Error('لم يتم إرجاع path للصورة من الخادم / Image path not returned from server');
    } catch (error: any) {
      // Handle validation errors from backend
      if (error.response?.status === 422) {
        const errors = error.response.data?.errors || error.response.data?.message;
        if (errors?.image) {
          throw new Error(Array.isArray(errors.image) ? errors.image[0] : errors.image);
        }
        if (typeof errors === 'string') {
          throw new Error(errors);
        }
        throw new Error('خطأ في التحقق من الصورة / Image validation error: ' + JSON.stringify(errors));
      }
      
      // Re-throw if it's already our custom error
      if (error.message && (error.message.includes('حجم') || error.message.includes('نوع') || error.message.includes('size') || error.message.includes('type'))) {
        throw error;
      }
      
      // Generic error
      throw new Error(error?.response?.data?.message || error?.message || 'فشل في رفع الصورة / Failed to upload image');
    }
  },
};

