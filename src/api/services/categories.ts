import apiClient from '../axios';
import { type Category, type CreateCategoryRequest, type UpdateCategoryRequest, type PaginatedResponse, type QueryParams } from '../../types';
import { normalizePaginatedResponse, normalizeItemResponse } from '../../utils/pagination';
import { logger } from '../../utils/logger';
import { handleApiError } from '../../utils/errorHandler';

export const categoriesService = {
  getCategories: async (params?: QueryParams): Promise<PaginatedResponse<Category>> => {
    try {
      logger.log('Fetching categories', { params });
      const response = await apiClient.get('/categories', { params });
      return normalizePaginatedResponse<Category>(response.data, params);
    } catch (error: any) {
      logger.error('Failed to fetch categories', error, { params });
      throw handleApiError(error, { endpoint: '/categories', params });
    }
  },

  getCategory: async (id: number): Promise<Category> => {
    try {
      logger.log('Fetching category', { id });
      const response = await apiClient.get(`/categories/${id}`);
      const category = normalizeItemResponse<Category>(response.data);
      logger.log('Category fetched successfully', { id });
      return category;
    } catch (error: any) {
      logger.error('Failed to fetch category', error, { id });
      throw handleApiError(error, { endpoint: `/categories/${id}` });
    }
  },

  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    try {
      logger.log('Creating category', { name_ar: data.name_ar, name_en: data.name_en });
      const response = await apiClient.post('/categories', data);
      const category = normalizeItemResponse<Category>(response.data);
      logger.log('Category created successfully', { id: category.id });
      return category;
    } catch (error: any) {
      logger.error('Failed to create category', error, { data });
      throw handleApiError(error, { endpoint: '/categories', method: 'POST' });
    }
  },

  updateCategory: async (id: number, data: UpdateCategoryRequest): Promise<Category> => {
    try {
      logger.log('Updating category', { id });
      const response = await apiClient.put(`/categories/${id}`, data);
      const category = normalizeItemResponse<Category>(response.data);
      logger.log('Category updated successfully', { id: category.id });
      return category;
    } catch (error: any) {
      logger.error('Failed to update category', error, { id, data });
      throw handleApiError(error, { endpoint: `/categories/${id}`, method: 'PUT' });
    }
  },

  deleteCategory: async (id: number): Promise<void> => {
    try {
      logger.log('Deleting category', { id });
      await apiClient.delete(`/categories/${id}`);
      logger.log('Category deleted successfully', { id });
    } catch (error: any) {
      logger.error('Failed to delete category', error, { id });
      throw handleApiError(error, { endpoint: `/categories/${id}`, method: 'DELETE' });
    }
  },
};
