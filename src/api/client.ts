import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { config } from '../config/env';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
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
    
    // Log all requests
    console.log('🌐 [API] Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      timestamp: new Date().toISOString(),
      hasToken: !!token
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
    
    // Handle timeout specifically
    if (error.code === 'ECONNABORTED' || error.message?.toLowerCase()?.includes('timeout')) {
      try {
        // Show a simple snackbar if available
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('app:snackbar', { detail: { message: 'Server not responding', severity: 'error' } });
          window.dispatchEvent(event);
        }
      } catch {}
    }

    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear any invalid tokens
          console.warn('🚨 [API] Unauthorized (401) - token may be expired or invalid');
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          // Redirect to login if not already there
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden:', data.message);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', data.message);
          break;
        case 422:
          // Validation error
          console.error('Validation error:', data.errors);
          break;
        case 500:
          // Server error
          console.error('Server error:', data.message);
          break;
        default:
          console.error('API Error:', data.message || 'Unknown error');
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message);
    } else {
      // Other error
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
