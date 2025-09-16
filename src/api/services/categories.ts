import apiClient from '../client';
import { type Category, type CreateCategoryRequest, type UpdateCategoryRequest, type PaginatedResponse, type QueryParams } from '../../types';

export const categoriesService = {
  getCategories: async (params?: QueryParams): Promise<PaginatedResponse<Category>> => {
    const response = await apiClient.get('/v1/admin/categories', { params });
    return response.data;
  },

  getCategory: async (id: number): Promise<Category> => {
    const response = await apiClient.get(`/v1/admin/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.post('/v1/admin/categories', data);
    return response.data;
  },

  updateCategory: async (id: number, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await apiClient.put(`/v1/admin/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/admin/categories/${id}`);
  },
};
