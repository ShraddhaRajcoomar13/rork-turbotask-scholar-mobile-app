import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { Subscription, SubscriptionTier } from '@/types/subscription';
import { apiService } from '@/services/api';
import { useAuth } from './auth-store';

export const [SubscriptionProvider, useSubscription] = createContextHook(() => {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  const subscriptionQuery = useQuery({
    queryKey: ['subscription'],
    queryFn: () => apiService.getSubscription(),
    enabled: isAuthenticated && user?.status === 'approved',
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const tiersQuery = useQuery({
    queryKey: ['subscription-tiers'],
    queryFn: () => apiService.getSubscriptionTiers(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: (paymentId: string) => apiService.verifyPayment(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

  const hasActiveSubscription = useCallback(() => {
    const subscription = subscriptionQuery.data;
    return subscription?.status === 'active' && 
           new Date(subscription.expiresAt) > new Date();
  }, [subscriptionQuery.data]);

  const hasCredits = useCallback(() => {
    const subscription = subscriptionQuery.data;
    return hasActiveSubscription() && (subscription?.creditsRemaining || 0) > 0;
  }, [subscriptionQuery.data, hasActiveSubscription]);

  const canGenerateWorksheet = useCallback(() => {
    return isAuthenticated && 
           user?.status === 'approved' && 
           hasCredits();
  }, [isAuthenticated, user?.status, hasCredits]);

  const { refetch: refetchSubscription } = subscriptionQuery;
  const refreshSubscription = useCallback(() => refetchSubscription(), [refetchSubscription]);

  const { mutateAsync: verifyPaymentAsync, isPending: isVerifyingPayment } = verifyPaymentMutation;

  return useMemo(() => ({
    subscription: subscriptionQuery.data || null,
    tiers: tiersQuery.data || [],
    isLoading: subscriptionQuery.isLoading || tiersQuery.isLoading,
    error: subscriptionQuery.error?.message || tiersQuery.error?.message,
    hasActiveSubscription: hasActiveSubscription(),
    hasCredits: hasCredits(),
    canGenerateWorksheet: canGenerateWorksheet(),
    verifyPayment: verifyPaymentAsync,
    isVerifyingPayment,
    refreshSubscription,
  }), [
    subscriptionQuery.data,
    subscriptionQuery.isLoading,
    subscriptionQuery.error,
    tiersQuery.data,
    tiersQuery.isLoading,
    tiersQuery.error,
    hasActiveSubscription,
    hasCredits,
    canGenerateWorksheet,
    verifyPaymentAsync,
    isVerifyingPayment,
    refreshSubscription,
  ]);
});