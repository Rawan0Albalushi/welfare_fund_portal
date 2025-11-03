import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../api/services/dashboard';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getDashboard,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    retry: (count, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) return false;
      return count < 1;
    },
  });
};

export const useStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: dashboardService.getStats,
    staleTime: 2 * 60 * 1000, // Data is considered fresh for 2 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus to get latest stats
    refetchOnMount: true, // Refetch when component mounts to ensure fresh data
    refetchOnReconnect: true, // Refetch when network reconnects
    refetchInterval: false, // Don't auto-refetch on interval to avoid unnecessary requests
    retry: (count, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) return false;
      return count < 1;
    },
  });
};
