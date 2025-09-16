import apiClient from '../client';
import { type StudentRegistration, type PaginatedResponse, type QueryParams } from '../../types';

export const applicationsService = {
  getApplications: async (params?: QueryParams): Promise<PaginatedResponse<StudentRegistration>> => {
    const response = await apiClient.get('/v1/admin/applications', { params });
    return response.data;
  },

  getApplication: async (id: number): Promise<StudentRegistration> => {
    const response = await apiClient.get(`/v1/admin/applications/${id}`);
    return response.data;
  },

  updateApplicationStatus: async (id: number, status: string): Promise<StudentRegistration> => {
    const response = await apiClient.patch(`/v1/admin/applications/${id}/status`, { status });
    return response.data;
  },
};
