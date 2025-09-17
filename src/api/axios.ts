import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { config } from '../config/env';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: config.apiUrl || 'http://192.168.100.105:8000/api/v1/admin',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Include token on each request
api.interceptors.request.use((cfg: any) => {
  const token = localStorage.getItem('admin_token');
  if (token && cfg.headers) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

// Global response handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Timeout / Network
    if (error.code === 'ECONNABORTED' || error.message?.toLowerCase()?.includes('timeout') || error.message === 'Network Error') {
      try {
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('app:snackbar', { detail: { message: 'Server not responding', severity: 'error' } });
          window.dispatchEvent(event);
        }
      } catch {}
    }

    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;


