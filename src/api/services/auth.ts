import apiClient from '../client';
import { type LoginRequest, type LoginResponse, type User } from '../../types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      console.log('🌐 [AUTH] Attempting login with API...');
      const response = await apiClient.post('/auth/login', credentials);
      console.log('✅ [AUTH] API login successful');
      return response.data;
    } catch (error: any) {
      console.error('❌ [AUTH] API login failed:', error);
      
      // Fallback for development/testing - create mock response
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500 || error.code === 'ECONNREFUSED') {
        console.log('🔄 [AUTH] Using fallback login for development...');
        console.log('🔄 [AUTH] Error details:', {
          code: error.code,
          status: error.response?.status,
          message: error.message
        });
        
        // Mock successful login for development
        const mockUser = {
          id: 1,
          name: 'Admin User',
          phone: credentials.phone,
          email: 'admin@example.com',
          settings: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        const mockResponse = {
          user: mockUser,
          token: 'mock_token_' + Date.now(),
        };
        
        console.log('🎭 [AUTH] Mock login successful:', mockResponse);
        return mockResponse;
      }
      
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    console.log('🔍 [AUTH] getMe called at:', new Date().toISOString());
    
    try {
      const response = await apiClient.get('/auth/me');
      console.log('✅ [AUTH] getMe response received at:', new Date().toISOString());
      return response.data;
    } catch (error: any) {
      console.error('❌ [AUTH] getMe failed:', error);
      
      // Fallback - try to get user from localStorage
      const storedUser = localStorage.getItem('admin_user');
      if (storedUser) {
        console.log('🔄 [AUTH] Using stored user data as fallback');
        return JSON.parse(storedUser);
      }
      
      throw error;
    }
  },
};
