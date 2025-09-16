import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../common/Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  console.log('🛡️ [ProtectedRoute] Render at:', new Date().toISOString(), {
    isAuthenticated,
    isLoading,
    hasUser: !!user,
    pathname: location.pathname
  });

  // Read from localStorage safely
  const token = localStorage.getItem('admin_token');
  const storedUserStr = localStorage.getItem('admin_user');
  const hasStoredUser = !!storedUserStr;

  // While loading and no user yet, show loader
  if (isLoading && !user && !hasStoredUser) {
    console.log('⏳ [ProtectedRoute] Showing loader');
    return <Loader message="Checking authentication..." />;
  }

  // If we have token and either fetched user or stored user, allow access
  if (token && (user || hasStoredUser)) {
    console.log('✅ [ProtectedRoute] Authenticated via', user ? 'API' : 'localStorage');
    return <>{children}</>;
  }

  // Otherwise, redirect to login
  console.log('🚫 [ProtectedRoute] Not authenticated, redirecting to login', {
    hasToken: !!token,
    hasUser: !!user,
    hasStoredUser
  });
  return <Navigate to="/login" state={{ from: location }} replace />;
};
