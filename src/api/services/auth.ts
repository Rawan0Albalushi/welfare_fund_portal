import apiClient from '../axios';
import { type LoginRequest, type LoginResponse, type AdminUser } from '../../types';
import { logger } from '../../utils/logger';
import { handleApiError } from '../../utils/errorHandler';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      logger.auth('Attempting admin login', { email: credentials.email });
      const response = await apiClient.post('/auth/login', credentials);
      logger.auth('Admin API login successful');
      return response.data;
    } catch (error) {
      logger.error('Admin login failed', error);
      throw handleApiError(error, { endpoint: '/auth/login' });
    }
  },

  logout: async (): Promise<void> => {
    try {
      logger.auth('Logging out');
      await apiClient.post('/auth/logout');
      logger.auth('Logout successful');
    } catch (error) {
      logger.error('Logout failed', error);
      // Don't throw on logout errors - still clear local storage
    }
  },

  getMe: async (): Promise<AdminUser> => {
    logger.auth('getMe called');
    
    try {
      // Primary endpoint per spec
      const response = await apiClient.get('/auth/me');
      logger.auth('getMe response received');
      return response.data;
    } catch (error: any) {
      logger.error('getMe failed (primary /auth/me)', error);

      // Fallback to /user for older backends
      if (error?.response?.status === 404) {
        try {
          logger.auth('Trying fallback endpoint /user');
          const fallback = await apiClient.get('/user');
          logger.auth('getMe fallback /user response received');
          return fallback.data;
        } catch (fallbackError: any) {
          logger.error('getMe fallback /user failed', fallbackError);
        }
      }
      
      // If it's a 401 error, clear any invalid tokens
      if (error.response?.status === 401) {
        logger.auth('401 error - clearing invalid tokens');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
      
      throw handleApiError(error, { endpoint: '/auth/me' });
    }
  },

  updateProfile: async (profileData: Partial<AdminUser>): Promise<AdminUser> => {
    logger.auth('Updating admin profile');
    try {
      const response = await apiClient.put('/auth/me', profileData);
      logger.auth('Profile updated successfully');
      return response.data;
    } catch (error: any) {
      // Fallback for older backend
      if (error?.response?.status === 404) {
        try {
          logger.auth('Trying fallback endpoint /user for profile update');
          const fallback = await apiClient.put('/user', profileData);
          logger.auth('Profile updated via fallback /user');
          return fallback.data;
        } catch (fallbackError) {
          logger.error('Profile update fallback failed', fallbackError);
          throw handleApiError(fallbackError, { endpoint: '/user' });
        }
      }
      throw handleApiError(error, { endpoint: '/auth/me' });
    }
  },
};
