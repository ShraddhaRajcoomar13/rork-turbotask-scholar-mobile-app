import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, LoginRequest, SignupRequest, User } from '@/types/auth';
import { Subscription, SubscriptionTier, PaymentVerification } from '@/types/subscription';
import { Worksheet, WorksheetRequest, GenerationHistory } from '@/types/worksheet';

const API_BASE_URL = 'https://api.turbotaskscholar.com'; // Replace with actual API URL

class ApiService {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signup(data: SignupRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/auth/profile');
  }

  async refreshToken(): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
    });
  }

  // Subscription endpoints
  async getSubscription(): Promise<Subscription | null> {
    try {
      return await this.request<Subscription>('/subscription');
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async getSubscriptionTiers(): Promise<SubscriptionTier[]> {
    return this.request<SubscriptionTier[]>('/subscription/tiers');
  }

  async verifyPayment(paymentId: string): Promise<PaymentVerification> {
    return this.request<PaymentVerification>('/subscription/verify-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentId }),
    });
  }

  // TEST MODE: Mock worksheet generation
  async generateWorksheet(request: WorksheetRequest): Promise<Worksheet> {
    console.log('TEST MODE: Simulating worksheet generation with request:', request);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock worksheet data
    const mockWorksheet: Worksheet = {
      id: `worksheet-${Date.now()}`,
      userId: 'test-user-123',
      title: `${request.subject} Worksheet - ${request.grade}`,
      content: request.type === 'text' 
        ? `Generated from: ${request.content.substring(0, 100)}...`
        : 'Generated from uploaded image',
      subject: request.subject,
      grade: request.grade,
      language: request.language,
      pdfUrl: 'https://example.com/sample-worksheet.pdf', // Mock PDF URL
      thumbnailUrl: 'https://example.com/sample-thumbnail.jpg',
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };
    
    console.log('TEST MODE: Generated mock worksheet:', mockWorksheet);
    return mockWorksheet;
  }

  // TEST MODE: Mock worksheet history
  async getWorksheets(page = 1, limit = 20): Promise<GenerationHistory> {
    console.log('TEST MODE: Returning mock worksheet history');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockWorksheets: Worksheet[] = [
      {
        id: 'worksheet-1',
        userId: 'test-user-123',
        title: 'Mathematics Worksheet - Grade 5',
        content: 'Addition and subtraction problems',
        subject: 'Mathematics',
        grade: 'Grade 5',
        language: 'en',
        pdfUrl: 'https://example.com/math-worksheet.pdf',
        thumbnailUrl: 'https://example.com/math-thumbnail.jpg',
        isFavorite: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        id: 'worksheet-2',
        userId: 'test-user-123',
        title: 'English Worksheet - Grade 4',
        content: 'Reading comprehension exercises',
        subject: 'English',
        grade: 'Grade 4',
        language: 'en',
        pdfUrl: 'https://example.com/english-worksheet.pdf',
        thumbnailUrl: 'https://example.com/english-thumbnail.jpg',
        isFavorite: false,
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
    ];
    
    return {
      worksheets: mockWorksheets,
      totalGenerated: mockWorksheets.length,
      creditsUsed: mockWorksheets.length,
    };
  }

  async toggleFavorite(worksheetId: string): Promise<{ isFavorite: boolean }> {
    return this.request<{ isFavorite: boolean }>(`/worksheets/${worksheetId}/favorite`, {
      method: 'POST',
    });
  }

  async deleteWorksheet(worksheetId: string): Promise<void> {
    await this.request(`/worksheets/${worksheetId}`, {
      method: 'DELETE',
    });
  }

  // Admin endpoints
  async getPendingUsers(): Promise<User[]> {
    return this.request<User[]>('/admin/users/pending');
  }

  async approveUser(userId: string): Promise<void> {
    await this.request(`/admin/users/${userId}/approve`, {
      method: 'POST',
    });
  }

  async rejectUser(userId: string): Promise<void> {
    await this.request(`/admin/users/${userId}/reject`, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();