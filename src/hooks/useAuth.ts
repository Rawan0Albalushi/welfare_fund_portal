import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../api/services/auth';
import { type LoginRequest, type AuthUser, type AdminUser } from '../types';
import { logger } from '../utils/logger';

export const useAuth = () => {
  const queryClient = useQueryClient();

  logger.debug('useAuth hook called');

  const hasToken = !!localStorage.getItem('admin_token');
  logger.debug('Token check', { hasToken });

  // Get current admin user
  const { data: admin, isLoading, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.getMe,
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    enabled: hasToken, // Only run if token exists
  });

  logger.debug('Query state', { 
    hasAdmin: !!admin, 
    isLoading, 
    hasError: !!error
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data: AuthUser) => {
      logger.auth('Login successful', {
        hasToken: !!data.token,
        hasAdmin: !!data.admin
      });
      
      try {
        localStorage.setItem('admin_token', data.token);
        if (data.admin) {
          localStorage.setItem('admin_user', JSON.stringify(data.admin));
        } else {
          // Avoid storing the string 'undefined' which breaks JSON.parse later
          localStorage.removeItem('admin_user');
        }
        queryClient.setQueryData(['auth', 'me'], data.admin);
        
        // Force refetch to ensure the query state is updated
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        
        logger.debug('Data saved to localStorage and query cache');
      } catch (error) {
        logger.error('Error saving to localStorage', error);
        // Clear potentially corrupted data
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    },
    onError: (error) => {
      logger.error('Login failed', error);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      queryClient.clear();
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (updatedAdmin: AdminUser) => {
      localStorage.setItem('admin_user', JSON.stringify(updatedAdmin));
      queryClient.setQueryData(['auth', 'me'], updatedAdmin);
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });

  const login = async (credentials: LoginRequest) => {
    logger.auth('Login function called', { email: credentials.email });
    try {
      const result = await loginMutation.mutateAsync(credentials);
      logger.auth('Login mutation completed');
      
      // Validate response structure
      if (!result || !result.token) {
        throw new Error('Invalid login response: missing token');
      }
      
      // Our LoginResponse/AuthUser contains `admin` not `user`
      if (!result.admin) {
        throw new Error('Invalid login response: missing admin data');
      }
      
      return result;
    } catch (error) {
      logger.error('Login mutation failed', error);
      throw error;
    }
  };

  const logout = () => {
    return logoutMutation.mutateAsync();
  };

  const updateProfile = async (profileData: Partial<AdminUser>) => {
    return updateProfileMutation.mutateAsync(profileData);
  };

  const isAuthenticated = React.useMemo(() => {
    const tokenExists = !!localStorage.getItem('admin_token');
    const adminExists = !!admin;
    const result = tokenExists && adminExists;
    
    logger.debug('isAuthenticated calculation', {
      tokenExists,
      adminExists,
      result
    });
    
    return result;
  }, [admin]);

  // Force re-render when localStorage changes
  const [, setLocalStorageVersion] = React.useState(0);
  
  React.useEffect(() => {
    const handleStorageChange = () => {
      setLocalStorageVersion(prev => prev + 1);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    admin,
    user: admin, // Keep backward compatibility
    isLoading,
    error,
    login,
    logout,
    updateProfile,
    isAuthenticated,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
  };
};
