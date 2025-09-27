import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { AuthResponse, LoginRequest, SignupRequest, User } from '@/types/auth';
import { Subscription, SubscriptionTier, PaymentVerification } from '@/types/subscription';
import { Worksheet, WorksheetRequest, GenerationHistory } from '@/types/worksheet';
import { SAMPLE_USERS, SAMPLE_CREDENTIALS, SUBSCRIPTION_TIERS, SAMPLE_SUBSCRIPTIONS } from '@/constants/sample-data';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000' 
  : 'https://api.turbotaskscholar.com';

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
    // For development, use sample data
    if (__DEV__) {
      return this.mockLogin(credentials);
    }
    
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  private async mockLogin(credentials: LoginRequest): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find matching credentials
    const matchingCredential = Object.values(SAMPLE_CREDENTIALS).find(
      cred => cred.email === credentials.email && cred.password === credentials.password
    );
    
    if (!matchingCredential) {
      throw new Error('Invalid email or password');
    }
    
    const user = SAMPLE_USERS.find(u => u.email === credentials.email);
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      user,
      token: `mock-token-${user.id}-${Date.now()}`,
    };
  }

  async signup(data: SignupRequest): Promise<{ message: string }> {
    // For development, simulate signup
    if (__DEV__) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { message: 'Account created successfully! Please wait for admin approval.' };
    }
    
    return this.request<{ message: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<User> {
    if (__DEV__) {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token || !token.startsWith('mock-token-')) {
        throw new Error('Unauthorized');
      }
      
      const userId = token.split('-')[2];
      const user = SAMPLE_USERS.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    }
    
    return this.request<User>('/auth/profile');
  }

  async refreshToken(): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
    });
  }

  // Subscription endpoints
  async getSubscription(): Promise<Subscription | null> {
    if (__DEV__) {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token || !token.startsWith('mock-token-')) {
        return null;
      }
      
      const userId = token.split('-')[2];
      return SAMPLE_SUBSCRIPTIONS.find(s => s.userId === userId) || null;
    }
    
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
    if (__DEV__) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return SUBSCRIPTION_TIERS;
    }
    
    return this.request<SubscriptionTier[]>('/subscription/tiers');
  }

  async verifyPayment(paymentId: string): Promise<PaymentVerification> {
    return this.request<PaymentVerification>('/subscription/verify-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentId }),
    });
  }

  async generateWorksheet(request: WorksheetRequest): Promise<Worksheet> {
    if (__DEV__) {
      return this.mockGenerateWorksheet(request);
    }

    const formData = new FormData();
    
    if (request.type === 'image') {
      // Handle image upload - first extract text using Textract
      const response = await fetch(request.content);
      const blob = await response.blob();
      
      // Extract text from image using Textract
      const textractFormData = new FormData();
      textractFormData.append('image', blob as any, 'lesson-plan.jpg');
      
      const textractResponse = await fetch(`${API_BASE_URL}/textract/image`, {
        method: 'POST',
        body: textractFormData,
      });
      
      if (!textractResponse.ok) {
        throw new Error('Failed to extract text from image');
      }
      
      const { text } = await textractResponse.json();
      formData.append('extracted_text', text);
    } else {
      formData.append('text', request.content);
    }
    
    formData.append('prompt', request.prompt || '');
    formData.append('language', request.language);
    formData.append('grade', request.grade);
    formData.append('subject', request.subject);
    
    const headers = await this.getAuthHeaders();
    delete headers['Content-Type']; // Let browser set multipart boundary
    
    // Generate worksheet using OpenAI and create PDF
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

  private async mockGenerateWorksheet(request: WorksheetRequest): Promise<Worksheet> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const worksheetId = `worksheet-${Date.now()}`;
    const title = `${request.subject} Worksheet - ${request.grade}`;
    
    // Create a mock PDF using OpenAI API
    const prompt = `Create a comprehensive ${request.subject} worksheet for ${request.grade} students. ${request.content || request.prompt}. Include 10-15 questions with varying difficulty levels. Format as a clean, printable worksheet with clear instructions.`;
    
    try {
      // Call OpenAI to generate worksheet content
      const openaiResponse = await fetch(`${API_BASE_URL}/openai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4',
          prompt: prompt,
          language: request.language
        })
      });
      
      if (!openaiResponse.ok) {
        throw new Error('Failed to generate worksheet content');
      }
      
      const { content } = await openaiResponse.json();
      
      // Create S3 bucket for storing the PDF
      const bucketResponse = await fetch(`${API_BASE_URL}/s3/buckets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const { bucket_uuid } = await bucketResponse.json();
      
      // Generate PDF content (mock for now)
      const pdfContent = this.generateMockPDF(title, content, request);
      
      // Upload PDF to S3
      const uploadFormData = new FormData();
      uploadFormData.append('file', new Blob([pdfContent], { type: 'application/pdf' }), `${worksheetId}.pdf`);
      
      const uploadResponse = await fetch(`${API_BASE_URL}/s3/${bucket_uuid}/objects`, {
        method: 'POST',
        body: uploadFormData
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload worksheet PDF');
      }
      
      const { object_url } = await uploadResponse.json();
      
      return {
        id: worksheetId,
        title,
        content,
        grade: request.grade,
        subject: request.subject,
        language: request.language,
        pdfUrl: object_url,
        createdAt: new Date().toISOString(),
        isFavorite: false,
        downloadCount: 0,
      };
    } catch (error) {
      console.error('Mock generation error:', error);
      // Fallback to simple mock
      return {
        id: worksheetId,
        title,
        content: `This is a sample ${request.subject} worksheet for ${request.grade} students.\n\n1. Sample question 1\n2. Sample question 2\n3. Sample question 3`,
        grade: request.grade,
        subject: request.subject,
        language: request.language,
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        createdAt: new Date().toISOString(),
        isFavorite: false,
        downloadCount: 0,
      };
    }
  }

  private generateMockPDF(title: string, content: string, request: WorksheetRequest): string {
    // This would normally use a PDF generation library
    // For now, return a simple text representation
    return `%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(${title}) Tj\nET\nendstream\nendobj\n\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000206 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n299\n%%EOF`;
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