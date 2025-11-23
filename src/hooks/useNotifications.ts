import { useMutation } from '@tanstack/react-query';
import { notificationsService, type SendNotificationRequest } from '../api/services/notifications';

export const useSendNotification = () => {
  return useMutation({
    mutationFn: (data: SendNotificationRequest) => notificationsService.sendNotification(data),
  });
};

