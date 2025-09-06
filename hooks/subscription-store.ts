import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Subscription, SubscriptionTier } from '@/types/subscription';
import { apiService } from '@/services/api';
import { useAuth } from './auth-store';

export const [SubscriptionProvider, useSubscription] = createContextHook(() => {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  // TEST MODE: Mock subscription data
  const testSubscription: Subscription = {
    id: 'test-sub-123',
    userId: 'test-user-123',
    tier: 'premium',
    status: 'active',
    creditsRemaining: 50,
    creditsTotal: 100,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    createdAt: new Date().toISOString(),
  };

  const testTiers: SubscriptionTier[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 99,
      credits: 25,
      duration: 30,
      features: ['25 worksheets per month', 'Basic templates', 'Email support'],
      yocoPaymentLink: 'https://pay.yoco.com/basic',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 199,
      credits: 100,
      duration: 30,
      features: ['100 worksheets per month', 'All templates', 'Priority support', 'Custom branding'],
      yocoPaymentLink: 'https://pay.yoco.com/premium',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 399,
      credits: 999,
      duration: 30,
      features: ['Unlimited worksheets', 'All templates', '24/7 support', 'Custom branding', 'API access'],
      yocoPaymentLink: 'https://pay.yoco.com/enterprise',
    },
  ];

  // TEST MODE: Mock subscription query
  const subscriptionQuery = useQuery({
    queryKey: ['subscription'],
    queryFn: () => Promise.resolve(testSubscription),
    enabled: false, // Disabled in test mode
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // TEST MODE: Mock subscription tiers query
  const tiersQuery = useQuery({
    queryKey: ['subscription-tiers'],
    queryFn: () => Promise.resolve(testTiers),
    enabled: false, // Disabled in test mode
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Payment verification mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: (paymentId: string) => apiService.verifyPayment(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

  const hasActiveSubscription = () => {
    // TEST MODE: Use test subscription directly
    return testSubscription.status === 'active' && 
           new Date(testSubscription.expiresAt) > new Date();
  };

  const hasCredits = () => {
    // TEST MODE: Use test subscription directly
    return hasActiveSubscription() && (testSubscription.creditsRemaining || 0) > 0;
  };

  const canGenerateWorksheet = () => {
    return isAuthenticated && 
           user?.status === 'approved' && 
           hasCredits();
  };

  return {
    subscription: testSubscription, // TEST MODE: Return test data directly
    tiers: testTiers, // TEST MODE: Return test data directly
    isLoading: false, // TEST MODE: Never loading
    error: undefined,
    hasActiveSubscription: hasActiveSubscription(),
    hasCredits: hasCredits(),
    canGenerateWorksheet: canGenerateWorksheet(),
    verifyPayment: verifyPaymentMutation.mutateAsync,
    isVerifyingPayment: verifyPaymentMutation.isPending,
    refreshSubscription: () => subscriptionQuery.refetch(),
  };
});