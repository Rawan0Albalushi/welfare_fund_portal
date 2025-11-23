import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsPagesService, type UpdateSettingsPageRequest } from '../api/services/settingsPages';
import type { QueryParams } from '../types';

export const useSettingsPages = (params?: QueryParams) => {
  return useQuery({
    queryKey: ['settings-pages', params],
    queryFn: () => settingsPagesService.getSettingsPages(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
  });
};

export const useSettingsPage = (key: string) => {
  return useQuery({
    queryKey: ['settings-page', key],
    queryFn: () => settingsPagesService.getSettingsPage(key),
    enabled: !!key,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
  });
};

export const useUpdateSettingsPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: UpdateSettingsPageRequest }) =>
      settingsPagesService.updateSettingsPage(key, data),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch settings pages list
      queryClient.invalidateQueries({ queryKey: ['settings-pages'] });
      // Invalidate the specific page
      queryClient.invalidateQueries({ queryKey: ['settings-page', variables.key] });
    },
  });
};

