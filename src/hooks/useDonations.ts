import { useQuery } from '@tanstack/react-query';
import { donationsService } from '../api/services/donations';
import { type QueryParams } from '../types';

export const useDonations = (params?: QueryParams) => {
  return useQuery({
    queryKey: ['donations', params],
    queryFn: () => donationsService.getDonations(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
};

export const useDonation = (id: number) => {
  return useQuery({
    queryKey: ['donations', id],
    queryFn: () => donationsService.getDonation(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
};
