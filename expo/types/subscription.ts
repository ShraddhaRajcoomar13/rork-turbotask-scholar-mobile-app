export interface Subscription {
  id: string;
  userId: string;
  tier: 'starter' | 'professional' | 'school';
  status: 'active' | 'cancelled' | 'expired';
  creditsRemaining: number;
  creditsTotal: number;
  expiresAt: string;
  createdAt: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  credits: number;
  duration: number; // days
  features: string[];
  yocoPaymentLink: string;
}

export interface PaymentVerification {
  paymentId: string;
  status: 'success' | 'failed' | 'pending';
  subscriptionId?: string;
}