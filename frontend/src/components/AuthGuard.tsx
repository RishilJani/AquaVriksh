"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, isLoggedIn, getUserId } from '../utils/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const currentUser = getUser();
      const loggedIn = isLoggedIn();
      
      setUser(currentUser);
      
      if (!isLoading && requireAuth && !loggedIn) {
        router.push(redirectTo);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [requireAuth, redirectTo, router, isLoading]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth is required and user is not logged in, don't render children
  if (requireAuth && !isLoggedIn()) {
    return null;
  }

  return <>{children}</>;
};

// Hook to get current user ID with fallback
export const useUserId = () => {
  const userId = getUserId();
  
  // Fallback: if getUserId returns null, try to extract from user object
  if (!userId) {
    const user = getUser();
    if (user) {
      console.log('useUserId: getUserId returned null, trying fallback extraction from user object:', user);
      const userAny = user as any; // Type assertion for fallback
      const fallbackUserId = userAny.userId || userAny._id || userAny.id;
      if (fallbackUserId) {
        console.log('useUserId: Found fallback userId:', fallbackUserId);
        return fallbackUserId;
      }
    }
  }
  
  return userId;
};

// Hook to check if user is authenticated
export const useIsAuthenticated = () => {
  return isLoggedIn();
};

// Hook to get current user
export const useUser = () => {
  return getUser();
};
