import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentRegistrationCardService } from '../api/services/studentRegistrationCard';

export const useStudentRegistrationCard = () => {
  return useQuery({
    queryKey: ['studentRegistrationCard'],
    queryFn: studentRegistrationCardService.getCard,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
};

export const useUpdateStudentRegistrationCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof studentRegistrationCardService.updateCard>[0]) =>
      studentRegistrationCardService.updateCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentRegistrationCard'] });
    },
  });
};

