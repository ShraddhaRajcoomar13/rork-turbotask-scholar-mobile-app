import React, { useEffect } from 'react';
import { router, useSegments } from 'expo-router';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/auth-store';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    console.log('Auth state:', { isAuthenticated, user: user?.email, status: user?.status, segments });

    if (!isAuthenticated) {
      // Not authenticated - redirect to login
      if (!inAuthGroup) {
        console.log('Not authenticated, redirecting to login');
        router.replace('/(auth)/login');
      }
    } else {
      // Authenticated - check approval status
      if (user?.status === 'pending') {
        // User is pending approval
        if (!segments.includes('pending')) {
          console.log('User pending approval, redirecting to pending screen');
          router.replace('/(auth)/pending');
        }
      } else if (user?.status === 'approved') {
        // User is approved - redirect to main app
        if (inAuthGroup) {
          console.log('User approved, redirecting to main app');
          router.replace('/(tabs)/dashboard');
        }
      }
    }
  }, [isAuthenticated, isLoading, user, segments]);

  if (isLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return <>{children}</>;
}