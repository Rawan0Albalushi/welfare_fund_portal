import apiClient from '../axios';
import { logger } from '../../utils/logger';
import { handleApiError } from '../../utils/errorHandler';

export interface SendNotificationRequest {
  title: string;
  body: string;
  user_ids?: number[];
}

export interface SendNotificationResponse {
  success: boolean;
  total_sent: number;
  total_failed: number;
  message?: string;
}

export const notificationsService = {
  sendNotification: async (data: SendNotificationRequest): Promise<SendNotificationResponse> => {
    try {
      logger.log('Sending notification', { title: data.title, userCount: data.user_ids?.length || 'all' });
      const response = await apiClient.post('/send-notification', data);
      const result = response.data?.data || response.data;
      logger.log('Notification sent successfully', { 
        total_sent: result.total_sent, 
        total_failed: result.total_failed 
      });
      return result;
    } catch (error: any) {
      logger.error('Failed to send notification', error, { data });
      throw handleApiError(error, { endpoint: '/send-notification', method: 'POST' });
    }
  },
};

