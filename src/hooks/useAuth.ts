import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../api/services/auth';
import { type LoginRequest, type AuthUser } from '../types';

export const useAuth = () => {
  const queryClient = useQueryClient();

  console.log('🔄 [useAuth] Hook called at:', new Date().toISOString());

  const hasToken = !!localStorage.getItem('admin_token');
  console.log('🔑 [useAuth] Token check:', { hasToken });

  // Get current user
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.getMe,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    enabled: hasToken, // Only run if token exists
  });

  console.log('📊 [useAuth] Query state:', { 
    hasUser: !!user, 
    isLoading, 
    hasError: !!error,
    timestamp: new Date().toISOString()
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data: AuthUser) => {
      console.log('🎉 [useAuth] Login successful:', {
        hasToken: !!data.token,
        hasUser: !!data.user,
        timestamp: new Date().toISOString()
      });
      
      localStorage.setItem('admin_token', data.token);
      if (data.user) {
        localStorage.setItem('admin_user', JSON.stringify(data.user));
      } else {
        // Avoid storing the string 'undefined' which breaks JSON.parse later
        localStorage.removeItem('admin_user');
      }
      queryClient.setQueryData(['auth', 'me'], data.user);
      
      // Force refetch to ensure the query state is updated
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      
      console.log('💾 [useAuth] Data saved to localStorage and query cache');
    },
    onError: (error) => {
      console.error('❌ [useAuth] Login failed:', error);
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

  const login = async (credentials: LoginRequest) => {
    console.log('🔐 [useAuth] Login function called with:', credentials);
    try {
      const result = await loginMutation.mutateAsync(credentials);
      console.log('🎉 [useAuth] Login mutation completed:', result);
      return result;
    } catch (error) {
      console.error('❌ [useAuth] Login mutation failed:', error);
      throw error;
    }
  };

  const logout = () => {
    return logoutMutation.mutateAsync();
  };

  const isAuthenticated = React.useMemo(() => {
    const tokenExists = !!localStorage.getItem('admin_token');
    const userExists = !!user;
    const result = tokenExists && userExists;
    
    console.log('🔐 [useAuth] isAuthenticated calculation:', {
      tokenExists,
      userExists,
      result,
      timestamp: new Date().toISOString()
    });
    
    return result;
  }, [user]);

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
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
};
