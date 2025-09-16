import apiClient from '../client';
import { type DashboardStats } from '../../types';

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/v1/admin/dashboard/stats');
    return response.data;
  },
};
