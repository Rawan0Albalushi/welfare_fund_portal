import apiClient from '../client';
import { type Program, type CreateProgramRequest, type UpdateProgramRequest, type PaginatedResponse, type QueryParams } from '../../types';

export const programsService = {
  getPrograms: async (params?: QueryParams): Promise<PaginatedResponse<Program>> => {
    const response = await apiClient.get('/v1/admin/programs', { params });
    return response.data;
  },

  getProgram: async (id: number): Promise<Program> => {
    const response = await apiClient.get(`/v1/admin/programs/${id}`);
    return response.data;
  },

  createProgram: async (data: CreateProgramRequest): Promise<Program> => {
    const response = await apiClient.post('/v1/admin/programs', data);
    return response.data;
  },

  updateProgram: async (id: number, data: UpdateProgramRequest): Promise<Program> => {
    const response = await apiClient.put(`/v1/admin/programs/${id}`, data);
    return response.data;
  },

  deleteProgram: async (id: number): Promise<void> => {
    await apiClient.delete(`/v1/admin/programs/${id}`);
  },
};
