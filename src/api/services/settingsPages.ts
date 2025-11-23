import apiClient from '../axios';
import { normalizeItemResponse, normalizePaginatedResponse } from '../../utils/pagination';
import { logger } from '../../utils/logger';
import { handleApiError } from '../../utils/errorHandler';
import type { QueryParams } from '../../types';

export interface SettingsPage {
  key: string;
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
  updated_at: string;
  created_at?: string;
}

export interface UpdateSettingsPageRequest {
  title_ar?: string;
  title_en?: string;
  content_ar?: string;
  content_en?: string;
}

export const settingsPagesService = {
  getSettingsPages: async (params?: QueryParams) => {
    try {
      logger.log('Fetching settings pages', { params });
      const response = await apiClient.get('/settings-pages', { params });
      return normalizePaginatedResponse<SettingsPage>(response.data, params);
    } catch (error: any) {
      logger.error('Failed to fetch settings pages', error, { params });
      throw handleApiError(error, { endpoint: '/settings-pages', params });
    }
  },

  getSettingsPage: async (key: string): Promise<SettingsPage> => {
    try {
      logger.log('Fetching settings page', { key });
      const response = await apiClient.get(`/settings-pages/${key}`);
      const page = normalizeItemResponse<SettingsPage>(response.data);
      logger.log('Settings page fetched successfully', { key });
      return page;
    } catch (error: any) {
      logger.error('Failed to fetch settings page', error, { key });
      throw handleApiError(error, { endpoint: `/settings-pages/${key}` });
    }
  },

  updateSettingsPage: async (key: string, data: UpdateSettingsPageRequest): Promise<SettingsPage> => {
    try {
      logger.log('Updating settings page', { key });
      const response = await apiClient.put(`/settings-pages/${key}`, data);
      const page = normalizeItemResponse<SettingsPage>(response.data);
      logger.log('Settings page updated successfully', { key });
      return page;
    } catch (error: any) {
      logger.error('Failed to update settings page', error, { key, data });
      throw handleApiError(error, { endpoint: `/settings-pages/${key}`, method: 'PUT' });
    }
  },
};

