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
    // TEST MODE: Skip all auth checks and redirect to main app
    console.log('TEST MODE: Bypassing auth checks, redirecting to main app');
    
    const inAuthGroup = segments[0] === '(auth)';
    
    // Always redirect to main app if in auth screens
    if (inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [segments]);

  // TEST MODE: Never show loading, always render children
  return <>{children}</>;
}