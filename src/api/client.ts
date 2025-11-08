import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { config } from '../config/env';
import { getUserFriendlyError } from '../utils/error';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('admin_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData - let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // Log all requests
    console.log('🌐 [API] Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      timestamp: new Date().toISOString(),
      hasToken: !!token,
      isFormData: config.data instanceof FormData
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses
    console.log('✅ [API] Response:', {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      timestamp: new Date().toISOString()
    });
    return response;
  },
  (error) => {
    // Log error responses
    console.log('❌ [API] Error:', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      timestamp: new Date().toISOString()
    });
    
    // Build a localized, user-friendly error and show global snackbar
    try {
      const friendly = getUserFriendlyError(error);
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('app:snackbar', { detail: friendly });
        window.dispatchEvent(event);
      }
    } catch {}

    if (error?.response?.status === 401) {
      // Clear tokens and redirect to login
      try {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      } catch {}
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
