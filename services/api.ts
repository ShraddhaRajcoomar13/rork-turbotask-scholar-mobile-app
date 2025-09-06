import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { AuthResponse, LoginRequest, SignupRequest, User } from '@/types/auth';
import { Subscription, SubscriptionTier, PaymentVerification } from '@/types/subscription';
import { Worksheet, WorksheetRequest, GenerationHistory } from '@/types/worksheet';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://api.turbotaskscholar.com/api';

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

  async generateWorksheet(request: WorksheetRequest): Promise<Worksheet> {
    const formData = new FormData();
    
    if (request.type === 'image') {
      // Handle image upload
      const response = await fetch(request.content);
      const blob = await response.blob();
      formData.append('image', blob as any, 'lesson-plan.jpg');
    } else {
      formData.append('text', request.content);
    }
    
    formData.append('prompt', request.prompt || '');
    formData.append('language', request.language);
    formData.append('grade', request.grade);
    formData.append('subject', request.subject);
    
    const headers = await this.getAuthHeaders();
    delete headers['Content-Type']; // Let browser set multipart boundary
    
    const response = await fetch(`${API_BASE_URL}/worksheets/generate`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Generation failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return response.json();
  }

  async getWorksheets(page = 1, limit = 20): Promise<GenerationHistory> {
    return this.request<GenerationHistory>(`/worksheets?page=${page}&limit=${limit}`);
  }

  async toggleFavorite(worksheetId: string): Promise<{ isFavorite: boolean }> {
    return this.request<{ isFavorite: boolean }>(`/worksheets/${worksheetId}/favorite`, {
      method: 'PATCH',
    });
  }

  async deleteWorksheet(worksheetId: string): Promise<void> {
    await this.request(`/worksheets/${worksheetId}`, {
      method: 'DELETE',
    });
  }

  async downloadWorksheet(worksheetId: string): Promise<string> {
    const response = await this.request<{ downloadUrl: string }>(`/worksheets/${worksheetId}/download`);
    return response.downloadUrl;
  }

  async shareWorksheet(worksheetId: string): Promise<string> {
    const response = await this.request<{ shareUrl: string }>(`/worksheets/${worksheetId}/share`);
    return response.shareUrl;
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