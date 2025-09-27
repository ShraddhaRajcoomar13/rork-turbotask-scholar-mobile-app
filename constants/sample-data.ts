import { User } from '@/types/auth';
import { SubscriptionTier, Subscription } from '@/types/subscription';

// Sample user accounts for development/demo
export const SAMPLE_USERS: User[] = [
  {
    id: '1',
    email: 'teacher@demo.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'teacher',
    status: 'approved',
    createdAt: '2024-01-15T08:00:00Z',
    approvedAt: '2024-01-15T09:00:00Z',
  },
  {
    id: '2',
    email: 'john.smith@demo.com',
    firstName: 'John',
    lastName: 'Smith',
    role: 'teacher',
    status: 'approved',
    createdAt: '2024-01-20T10:30:00Z',
    approvedAt: '2024-01-20T11:00:00Z',
  },
  {
    id: '3',
    email: 'pending@demo.com',
    firstName: 'Mary',
    lastName: 'Williams',
    role: 'teacher',
    status: 'pending',
    createdAt: '2024-01-25T14:15:00Z',
  },
  {
    id: '4',
    email: 'admin@demo.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    status: 'approved',
    createdAt: '2024-01-01T00:00:00Z',
    approvedAt: '2024-01-01T00:00:00Z',
  },
];

// Sample subscription tiers with South African pricing
export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'starter',
    name: 'Starter Plan',
    price: 25, // R25 per month
    credits: 10,
    duration: 30, // 30 days
    features: [
      '10 worksheets per month',
      'Basic templates',
      'PDF downloads',
      'Email support',
      'All South African languages',
    ],
    yocoPaymentLink: 'https://pay.yoco.com/starter-plan-r25',
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    price: 50, // R50 per month
    credits: 25,
    duration: 30, // 30 days
    features: [
      '25 worksheets per month',
      'Premium templates',
      'PDF downloads',
      'Priority email support',
      'All South African languages',
      'Custom branding',
      'Worksheet history',
    ],
    yocoPaymentLink: 'https://pay.yoco.com/professional-plan-r50',
  },
  {
    id: 'school',
    name: 'School Plan',
    price: 100, // R100 per month
    credits: 60,
    duration: 30, // 30 days
    features: [
      '60 worksheets per month',
      'All premium templates',
      'PDF downloads',
      'Phone & email support',
      'All South African languages',
      'Custom branding',
      'Worksheet history',
      'Bulk generation',
      'Analytics dashboard',
      'Multi-teacher access',
    ],
    yocoPaymentLink: 'https://pay.yoco.com/school-plan-r100',
  },
];

// Sample subscriptions for demo users
export const SAMPLE_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-1',
    userId: '1',
    tier: 'professional',
    status: 'active',
    creditsRemaining: 18,
    creditsTotal: 25,
    expiresAt: '2024-02-15T08:00:00Z',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'sub-2',
    userId: '2',
    tier: 'starter',
    status: 'active',
    creditsRemaining: 3,
    creditsTotal: 10,
    expiresAt: '2024-02-20T10:30:00Z',
    createdAt: '2024-01-20T10:30:00Z',
  },
];

// Sample login credentials for demo
export const SAMPLE_CREDENTIALS = {
  teacher: {
    email: 'teacher@demo.com',
    password: 'demo123',
  },
  john: {
    email: 'john.smith@demo.com',
    password: 'demo123',
  },
  pending: {
    email: 'pending@demo.com',
    password: 'demo123',
  },
  admin: {
    email: 'admin@demo.com',
    password: 'admin123',
  },
};