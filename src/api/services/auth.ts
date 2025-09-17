import apiClient from '../axios';
import { type LoginRequest, type LoginResponse, type AdminUser } from '../../types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    console.log('🌐 [AUTH] Attempting admin login with API...');
    const response = await apiClient.post('/auth/login', credentials);
    console.log('✅ [AUTH] Admin API login successful');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<AdminUser> => {
    console.log('🔍 [AUTH] getMe called at:', new Date().toISOString());
    
    try {
      // Primary endpoint per spec
      const response = await apiClient.get('/auth/me');
      console.log('✅ [AUTH] getMe response received at:', new Date().toISOString());
      return response.data;
    } catch (error: any) {
      console.error('❌ [AUTH] getMe failed (primary /auth/me):', error);

      // Fallback to /user for older backends
      if (error?.response?.status === 404) {
        try {
          const fallback = await apiClient.get('/user');
          console.log('✅ [AUTH] getMe fallback /user response received at:', new Date().toISOString());
          return fallback.data;
        } catch (fallbackError: any) {
          console.error('❌ [AUTH] getMe fallback /user failed:', fallbackError);
        }
      }
      
      // If it's a 401 error, clear any invalid tokens
      if (error.response?.status === 401) {
        console.log('🚨 [AUTH] 401 error - clearing invalid tokens');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
      
      throw error;
    }
  },

  updateProfile: async (profileData: Partial<AdminUser>): Promise<AdminUser> => {
    console.log('🔄 [AUTH] Updating admin profile...');
    try {
      const response = await apiClient.put('/auth/me', profileData);
      console.log('✅ [AUTH] Profile updated successfully');
      return response.data;
    } catch (error: any) {
      // Fallback for older backend
      if (error?.response?.status === 404) {
        const fallback = await apiClient.put('/user', profileData);
        console.log('✅ [AUTH] Profile updated via fallback /user');
        return fallback.data;
      }
      throw error;
    }
  },
};
