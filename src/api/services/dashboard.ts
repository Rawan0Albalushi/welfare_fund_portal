import apiClient from '../axios';
import { type DashboardStats } from '../../types';

export const dashboardService = {
  getDashboard: async (): Promise<any> => {
    const response = await apiClient.get('/dashboard');
    return response.data?.data ?? response.data;
  },

  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/stats');
    const payload = response.data?.data ?? response.data;
    return payload as DashboardStats;
  },
};
