import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthState, LoginRequest, SignupRequest } from '@/types/auth';
import { apiService } from '@/services/api';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const queryClient = useQueryClient();

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const [token, userData] = await AsyncStorage.multiGet(['auth_token', 'user_data']);
        
        if (token[1] && userData[1]) {
          const user = JSON.parse(userData[1]);
          setAuthState({
            user,
            token: token[1],
            isLoading: false,
            isAuthenticated: true,
          });
          
          // Profile will be refreshed by the query when enabled
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    initializeAuth();
  }, []);

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiService.getProfile(),
    enabled: authState.isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error instanceof Error && error.message.includes('401')) {
        logout();
        return false;
      }
      return failureCount < 2;
    },
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
  const logout = useCallback(async () => {
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
  }, [queryClient]);

  // Sync profile data when query succeeds
  useEffect(() => {
    if (profileQuery.data && authState.isAuthenticated) {
      setAuthState(prev => ({
        ...prev,
        user: profileQuery.data,
      }));
      
      // Update stored user data
      AsyncStorage.setItem('user_data', JSON.stringify(profileQuery.data));
    }
  }, [profileQuery.data, authState.isAuthenticated]);

  const { refetch: refetchProfile } = profileQuery;
  const refreshProfile = useCallback(() => refetchProfile(), [refetchProfile]);

  const { mutateAsync: loginAsync, isPending: isLoginLoading, error: loginError } = loginMutation;
  const { mutateAsync: signupAsync, isPending: isSignupLoading, error: signupError } = signupMutation;

  return useMemo(() => ({
    ...authState,
    login: loginAsync,
    signup: signupAsync,
    logout,
    isLoginLoading,
    isSignupLoading,
    loginError: loginError?.message,
    signupError: signupError?.message,
    refreshProfile,
  }), [authState, loginAsync, signupAsync, logout, isLoginLoading, isSignupLoading, loginError, signupError, refreshProfile]);
});