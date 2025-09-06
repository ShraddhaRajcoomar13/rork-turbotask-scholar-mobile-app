import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { AuthState, User, LoginRequest, SignupRequest } from '@/types/auth';
import { apiService } from '@/services/api';

export const [AuthProvider, useAuth] = createContextHook(() => {
  // TEST MODE: Create a mock authenticated user
  const testUser: User = {
    id: 'test-user-123',
    email: 'test@turbotask.com',
    firstName: 'Test',
    lastName: 'Teacher',
    role: 'teacher',
    status: 'approved',
    createdAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
  };

  const [authState, setAuthState] = useState<AuthState>({
    user: testUser,
    token: 'test-token-123',
    isLoading: false,
    isAuthenticated: true,
  });

  const queryClient = useQueryClient();

  // TEST MODE: Skip auth initialization, already authenticated
  useEffect(() => {
    console.log('TEST MODE: User automatically authenticated as:', testUser.email);
  }, []);

  // TEST MODE: Mock profile query
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: () => Promise.resolve(testUser),
    enabled: false, // Disabled in test mode
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => apiService.login(credentials),
    onSuccess: async (data) => {
      await AsyncStorage.setItem('auth_token', data.token);
      await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
      
      setAuthState({
        user: data.user,
        token: data.token,
        isLoading: false,
        isAuthenticated: true,
      });

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: (data: SignupRequest) => apiService.signup(data),
  });

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['auth_token', 'user_data']);
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
      queryClient.clear();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // TEST MODE: Skip profile sync
  useEffect(() => {
    // Profile data is already set in test mode
  }, []);

  return {
    ...authState,
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    logout,
    isLoginLoading: loginMutation.isPending,
    isSignupLoading: signupMutation.isPending,
    loginError: loginMutation.error?.message,
    signupError: signupMutation.error?.message,
    refreshProfile: () => profileQuery.refetch(),
  };
});