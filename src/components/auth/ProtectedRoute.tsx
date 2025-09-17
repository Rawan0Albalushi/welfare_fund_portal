import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../common/Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  try {
    const { isAuthenticated, isLoading, admin, user } = useAuth();
    const location = useLocation();

    // Use admin if available, fallback to user for backward compatibility
    const currentUser = admin || user;

  console.log('🛡️ [ProtectedRoute] Render at:', new Date().toISOString(), {
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
    console.error('🚨 [ProtectedRoute] Invalid stored user data:', error);
    // Clear invalid data
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
  }

  // While loading and no user yet, show loader
  if (isLoading && !currentUser && !hasStoredUser) {
    console.log('⏳ [ProtectedRoute] Showing loader');
    return <Loader message="جاري التحقق من المصادقة..." />;
  }

  // If we have token and either fetched user or stored user, allow access
  if (token && (currentUser || hasStoredUser)) {
    console.log('✅ [ProtectedRoute] Authenticated via', currentUser ? 'API' : 'localStorage');
    return <>{children}</>;
  }

    // Otherwise, redirect to login
    console.log('🚫 [ProtectedRoute] Not authenticated, redirecting to login', {
      hasToken: !!token,
      hasCurrentUser: !!currentUser,
      hasStoredUser
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  } catch (error) {
    console.error('🚨 [ProtectedRoute] Error in ProtectedRoute:', error);
    return <Navigate to="/login" replace />;
  }
};
