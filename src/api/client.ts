import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { toUserFriendlyError } from '../utils/errorHandler';

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
    logger.apiRequest(
      config.method?.toUpperCase() || 'UNKNOWN',
      config.url || '',
      {
        hasToken: !!token,
        isFormData: config.data instanceof FormData
      }
    );
    
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
    logger.apiResponse(
      response.config.method?.toUpperCase() || 'UNKNOWN',
      response.config.url || '',
      response.status
    );
    return response;
  },
  (error) => {
    // Log error responses
    logger.apiResponse(
      error.config?.method?.toUpperCase() || 'UNKNOWN',
      error.config?.url || '',
      error.response?.status || 0
    );
    
    // Build a localized, user-friendly error and show global snackbar
    try {
      const friendly = toUserFriendlyError(error);
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
