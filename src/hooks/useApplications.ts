import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { applicationsService } from '../api/services/applications';
import { type QueryParams } from '../types';

export const useApplications = (params?: QueryParams) => {
  return useQuery({
    queryKey: ['applications', params],
    queryFn: () => applicationsService.getApplications(params),
    staleTime: 2 * 60 * 1000, // 2 minutes for real-time updates
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
  });
};

export const useApplication = (id: number) => {
  return useQuery({
    queryKey: ['applications', id],
    queryFn: () => applicationsService.getApplication(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      applicationsService.updateApplicationStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['applications', id] });
    },
  });
};
