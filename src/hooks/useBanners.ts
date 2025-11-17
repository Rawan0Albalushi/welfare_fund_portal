import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bannersService } from '../api/services/banners';
import { type QueryParams, type UpdateBannerRequest } from '../types';

export const useBanners = (params?: QueryParams) => {
  return useQuery({
    queryKey: ['banners', params],
    queryFn: () => bannersService.getBanners(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
};

export const useBanner = (id: number) => {
  return useQuery({
    queryKey: ['banners', id],
    queryFn: () => bannersService.getBanner(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
};

export const useCreateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bannersService.createBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
};

export const useUpdateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBannerRequest }) =>
      bannersService.updateBanner(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners', id] });
    },
  });
};

export const useDeleteBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bannersService.deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
};

