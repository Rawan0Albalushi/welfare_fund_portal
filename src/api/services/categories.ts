import apiClient from '../axios';
import { type Category, type CreateCategoryRequest, type UpdateCategoryRequest, type PaginatedResponse, type QueryParams } from '../../types';

export const categoriesService = {
  getCategories: async (params?: QueryParams): Promise<PaginatedResponse<Category>> => {
    const response = await apiClient.get('/categories', { params });
    const payload = (response.data?.data ?? response.data);
    if (Array.isArray(payload)) {
      const total = payload.length;
      return {
        data: payload as Category[],
        current_page: 1,
        last_page: 1,
        per_page: total,
        total,
        from: total > 0 ? 1 : 0,
        to: total,
      } as PaginatedResponse<Category>;
    }
    return payload as PaginatedResponse<Category>;
  },

  getCategory: async (id: number): Promise<Category> => {
    const response = await apiClient.get(`/categories/${id}`);
    return (response.data?.data ?? response.data) as Category;
  },

  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.post('/categories', data);
    return (response.data?.data ?? response.data) as Category;
  },

  updateCategory: async (id: number, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await apiClient.put(`/categories/${id}`, data);
    return (response.data?.data ?? response.data) as Category;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
