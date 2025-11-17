import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../common/Loader';
import { logger } from '../../utils/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  try {
    const { isAuthenticated, isLoading, admin, user } = useAuth();
    const location = useLocation();

    // Use admin if available, fallback to user for backward compatibility
    const currentUser = admin || user;

  logger.debug('ProtectedRoute render', {
    isAuthenticated,
    isLoading,
    hasAdmin: !!admin,
    hasUser: !!user,
    hasCurrentUser: !!currentUser,
    pathname: location.pathname
  });

  // Read from localStorage safely
  const token = localStorage.getItem('admin_token');
  let storedUserStr = null;
  let hasStoredUser = false;
  
  try {
    storedUserStr = localStorage.getItem('admin_user');
    if (storedUserStr) {
      // Try to parse to validate it's valid JSON
      JSON.parse(storedUserStr);
      hasStoredUser = true;
    }
  } catch (error) {
    logger.error('Invalid stored user data', error);
    // Clear invalid data
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
  }

  // While loading and no user yet, show loader
  if (isLoading && !currentUser && !hasStoredUser) {
    logger.debug('Showing loader');
    return <Loader message="جاري التحقق من المصادقة..." />;
  }

  // If we have token and either fetched user or stored user, allow access
  if (token && (currentUser || hasStoredUser)) {
    logger.debug('Authenticated', { via: currentUser ? 'API' : 'localStorage' });
    return <>{children}</>;
  }

    // Otherwise, redirect to login
    logger.debug('Not authenticated, redirecting to login', {
      hasToken: !!token,
      hasCurrentUser: !!currentUser,
      hasStoredUser
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  } catch (error) {
    logger.error('Error in ProtectedRoute', error);
    return <Navigate to="/login" replace />;
  }
};
