import apiClient from '../axios';
import { config } from '../../config/env';
import { logger } from '../../utils/logger';
import { handleApiError } from '../../utils/errorHandler';
import { normalizeItemResponse } from '../../utils/pagination';
import type {
  StudentRegistrationCard,
  UpdateStudentRegistrationCardRequest,
} from '../../types';

const buildBackgroundImageUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) {
    return path;
  }

  const baseUrl = config.apiUrl.replace('/api/v1/admin', '').replace(/\/$/, '') || 'http://localhost:8000';
  const cleanedPath = path.replace(/^\/+/, '');
  return `${baseUrl}/storage/${cleanedPath}`;
};

const normalizeBackgroundForForm = (value: any): string => {
  if (value === undefined || value === null) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
};

const mapApiCardToUi = (payload: any): StudentRegistrationCard => {
  const backgroundImagePath = payload.background_image || payload.background_image_path || null;
  return {
    id: payload.id,
    headline_ar: payload.headline_ar ?? '',
    headline_en: payload.headline_en ?? '',
    subtitle_ar: payload.subtitle_ar ?? '',
    subtitle_en: payload.subtitle_en ?? '',
    background: normalizeBackgroundForForm(payload.background),
    background_image: backgroundImagePath,
    background_image_path: payload.background_image_path || null,
    background_image_url: payload.background_image_url || buildBackgroundImageUrl(backgroundImagePath),
    status: payload.status === 'inactive' ? 'inactive' : 'active',
    created_at: payload.created_at,
    updated_at: payload.updated_at,
  };
};

const mapUiToPayload = (data: UpdateStudentRegistrationCardRequest): Record<string, any> => {
  const payload: Record<string, any> = {};

  if (data.headline_ar !== undefined) {
    payload.headline_ar = data.headline_ar?.trim() ?? '';
  }
  if (data.headline_en !== undefined) {
    payload.headline_en = data.headline_en?.trim() ?? '';
  }
  if (data.subtitle_ar !== undefined) {
    payload.subtitle_ar = data.subtitle_ar?.trim() ?? '';
  }
  if (data.subtitle_en !== undefined) {
    payload.subtitle_en = data.subtitle_en?.trim() ?? '';
  }
  const normalizeBackgroundField = (value: string | Record<string, any> | any[] | null | undefined) => {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) {
        return null;
      }

      try {
        const parsed = JSON.parse(trimmed);
        if (parsed !== null) {
          return parsed;
        }
      } catch {
        // fallback to raw string
      }

      return trimmed;
    }

    return value;
  };

  if (data.background !== undefined) {
    const normalizedBackground = normalizeBackgroundField(data.background);
    if (normalizedBackground !== undefined) {
      payload.background = normalizedBackground;
    }
  }
  if (data.background_image !== undefined) {
    payload.background_image = data.background_image?.trim() || null;
  }
  if (data.background_image_path !== undefined) {
    payload.background_image_path = data.background_image_path?.trim() || null;
  }
  if (data.status !== undefined) {
    payload.status = data.status;
  }

  return payload;
};

export const studentRegistrationCardService = {
  buildBackgroundImageUrl,

  getCard: async (): Promise<StudentRegistrationCard> => {
    try {
      logger.log('Fetching student registration card');
      const response = await apiClient.get('/student-registration-card');
      return normalizeItemResponse<StudentRegistrationCard>(response.data, mapApiCardToUi);
    } catch (error: any) {
      logger.error('Failed to fetch student registration card', error);
      throw handleApiError(error, { endpoint: '/student-registration-card', method: 'GET' });
    }
  },

  updateCard: async (data: UpdateStudentRegistrationCardRequest): Promise<StudentRegistrationCard> => {
    try {
      logger.log('Updating student registration card', { data });
      const payload = mapUiToPayload(data);
      logger.log('Updating student registration card payload', payload);
      const response = await apiClient.put('/student-registration-card', payload);
      return normalizeItemResponse<StudentRegistrationCard>(response.data, mapApiCardToUi);
    } catch (error: any) {
      logger.error('Failed to update student registration card', error, { data });
      throw handleApiError(error, { endpoint: '/student-registration-card', method: 'PUT' });
    }
  },

  uploadBackground: async (file: File): Promise<string> => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      throw new Error('حجم الصورة كبير جداً. الحد الأقصى 10MB');
    }
    if (!allowedTypes.includes(file.type)) {
      throw new Error('نوع الملف غير مدعوم. يرجى رفع صورة (JPEG, PNG, GIF, WebP)');
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await apiClient.post('/student-registration-card/upload-background', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const payload = response.data ?? {};
      const path =
        payload?.data?.path ??
        payload?.path ??
        payload?.data?.background_image ??
        payload?.background_image;

      if (path && typeof path === 'string') {
        return path;
      }

      throw new Error('لم يتم إرجاع مسار الخلفية من الخادم');
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.response.data?.errors || error.response.data?.message;
        if (errors?.image) {
          throw new Error(Array.isArray(errors.image) ? errors.image[0] : errors.image);
        }
        if (typeof errors === 'string') {
          throw new Error(errors);
        }
        throw new Error('خطأ في التحقق من ملف الخلفية');
      }
      if (error.message && (error.message.includes('حجم') || error.message.includes('نوع'))) {
        throw error;
      }
      throw new Error(error?.response?.data?.message || error?.message || 'فشل في رفع الخلفية');
    }
  },
};

export type {
  StudentRegistrationCard,
  UpdateStudentRegistrationCardRequest,
};

