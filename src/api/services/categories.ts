import apiClient from '../axios';
import { type Category, type CreateCategoryRequest, type UpdateCategoryRequest, type PaginatedResponse, type QueryParams } from '../../types';

export const categoriesService = {
  getCategories: async (params?: QueryParams): Promise<PaginatedResponse<Category>> => {
    const response = await apiClient.get('/categories', { params });
    const payload = (response.data?.data ?? response.data);
    if (Array.isArray(payload)) {
      const total = payload.length;
      const currentPage = Math.max(1, Number(params?.page) || 1);
      const perPage = Math.max(1, Number(params?.per_page) || total || 1);
      const startIndex = (currentPage - 1) * perPage;
      const endIndex = startIndex + perPage;
      const sliced = (payload as Category[]).slice(startIndex, endIndex);
      const lastPage = Math.max(1, Math.ceil(total / perPage));
      return {
        data: sliced,
        current_page: currentPage,
        last_page: lastPage,
        per_page: perPage,
        total,
        from: total > 0 ? Math.min(total, startIndex + 1) : 0,
        to: total > 0 ? Math.min(total, endIndex) : 0,
      } as PaginatedResponse<Category>;
    }
    const raw = payload as PaginatedResponse<Category>;
    const totalFallback = typeof (raw as any).total === 'number' ? (raw as any).total : (
      (raw as any).last_page && (raw as any).per_page ? (raw as any).last_page * (raw as any).per_page : (Array.isArray((raw as any).data) ? (raw as any).data.length : 0)
    );
    return {
      ...raw,
      total: totalFallback,
    } as PaginatedResponse<Category>;
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
