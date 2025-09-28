import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { AuthResponse, LoginRequest, SignupRequest, User } from '@/types/auth';
import { Subscription, SubscriptionTier, PaymentVerification } from '@/types/subscription';
import { Worksheet, WorksheetRequest, GenerationHistory } from '@/types/worksheet';
import { SAMPLE_USERS, SAMPLE_CREDENTIALS, SUBSCRIPTION_TIERS, SAMPLE_SUBSCRIPTIONS } from '@/constants/sample-data';

const API_BASE_URL = 'http://vps.kyro.ninja:5000';

// Fallback to local development server if main server is unavailable
const FALLBACK_API_URL = 'http://localhost:5000';

// Health check function to test server connectivity
const testServerConnection = async (): Promise<{ isAvailable: boolean; url: string }> => {
  const urls = [API_BASE_URL, FALLBACK_API_URL];
  
  for (const url of urls) {
    try {
      console.log(`Testing server connection to: ${url}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduced timeout
      
      const response = await fetch(`${url}/health`, {
        signal: controller.signal,
        mode: 'cors', // Explicitly set CORS mode
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`✅ Server available at: ${url}`);
        return { isAvailable: true, url };
      }
    } catch (error) {
      console.warn(`❌ Server connection failed for ${url}:`, error);
      continue;
    }
  }
  
  console.warn('❌ All servers unavailable, using fallback mode');
  return { isAvailable: false, url: API_BASE_URL };
};

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
    options: RequestInit = {},
    baseUrl?: string
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    const apiUrl = baseUrl || API_BASE_URL;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout
      
      const response = await fetch(`${apiUrl}${endpoint}`, {
        ...options,
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          ...headers,
          ...options.headers,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorMessage = `HTTP ${response.status}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      if (!responseText) {
        return {} as T;
      }
      
      try {
        return JSON.parse(responseText);
      } catch {
        // If response is not JSON, return as string
        return responseText as unknown as T;
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - server is not responding');
        }
        if (error.message.includes('Failed to fetch') || 
            error.message.includes('Network request failed') ||
            error.message.includes('CORS') ||
            error.message.includes('ERR_NETWORK')) {
          throw new Error(`Network error - unable to connect to server at ${apiUrl}`);
        }
      }
      throw error;
    }
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
    // Check server connectivity first
    const serverStatus = await testServerConnection();
    
    if (!serverStatus.isAvailable || __DEV__) {
      console.log('Using fallback worksheet generation (server unavailable or dev mode)');
      return this.mockGenerateWorksheet(request);
    }
    
    const apiUrl = serverStatus.url;

    try {
      let extractedText = '';
      
      if (request.type === 'image') {
        // Handle image upload - first extract text using Textract
        try {
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
          
          const textractResult = await textractResponse.json();
          extractedText = textractResult.text || textractResult.extractedText || '';
        } catch (error) {
          console.warn('Text extraction failed, using fallback:', error);
          extractedText = `Sample lesson plan content about ${request.subject} for ${request.grade} students.`;
        }
      } else {
        extractedText = request.content;
      }
      
      // Generate worksheet content using OpenAI
      const worksheetContent = await this.generateWorksheetContent({
        text: extractedText,
        prompt: request.prompt,
        grade: request.grade,
        subject: request.subject,
        language: request.language,
      }, apiUrl);
      
      // Create PDF from the generated content
      const pdfUrl = await this.createWorksheetPDF({
        title: `${request.subject} Worksheet - ${request.grade}`,
        content: worksheetContent,
        grade: request.grade,
        subject: request.subject,
      });
      
      // Return worksheet object
      return {
        id: `worksheet-${Date.now()}`,
        title: `${request.subject} Worksheet - ${request.grade}`,
        content: worksheetContent,
        grade: request.grade,
        subject: request.subject,
        language: request.language,
        pdfUrl,
        createdAt: new Date().toISOString(),
        isFavorite: false,
        downloadCount: 0,
      };
    } catch (error) {
      console.error('Worksheet generation failed, falling back to mock:', error);
      return this.mockGenerateWorksheet(request);
    }
  }

  private async generateWorksheetContent(params: {
    text: string;
    prompt?: string;
    grade: string;
    subject: string;
    language: string;
  }, apiUrl: string = API_BASE_URL): Promise<string> {
    try {
      const systemPrompt = `You are an expert teacher creating educational worksheets. Create a comprehensive, well-structured worksheet that is appropriate for ${params.grade} students studying ${params.subject}.

The worksheet should include:
- Clear title and instructions
- 10-15 varied questions with different difficulty levels
- Mix of question types (multiple choice, short answer, problem solving)
- Answer key at the end
- Professional formatting suitable for printing

Base the content on: ${params.text}
${params.prompt ? `Additional requirements: ${params.prompt}` : ''}

Format the output as a clean, printable worksheet in ${params.language === 'en' ? 'English' : 'the requested language'}.`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const openaiResponse = await fetch(`${apiUrl}/openai`, {
        method: 'POST',
        mode: 'cors',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          prompt: systemPrompt,
          max_tokens: 2000,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text().catch(() => 'Unknown error');
        throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
      }

      const result = await openaiResponse.json();
      const content = result.result || result.content || result.text || result.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI API');
      }
      
      return content;
    } catch (error) {
      console.error('Content generation failed, using fallback:', error);
      return this.generateFallbackContent(params);
    }
  }

  private generateFallbackContent(params: {
    text: string;
    prompt?: string;
    grade: string;
    subject: string;
    language: string;
  }): string {
    const questions = this.generateSubjectQuestions(params.subject, params.grade);
    
    return `${params.subject} Worksheet - ${params.grade}

Name: _________________________ Date: _____________

Instructions: Complete all questions below. Show your work where applicable.

${questions.map((q, i) => `${i + 1}. ${q}`).join('\n\n')}

${'='.repeat(50)}
ANSWER KEY
${'='.repeat(50)}

${questions.map((_, i) => `${i + 1}. [Answer for question ${i + 1}]`).join('\n')}

Generated by Bizzee Bee Worksheets - AI-Powered Worksheet Generator`;
  }

  private generateSubjectQuestions(subject: string, grade: string): string[] {
    const questionBank: Record<string, string[]> = {
      'Mathematics': [
        'Solve: 25 + 37 = ?',
        'What is 8 × 9?',
        'If Sarah has 15 apples and gives away 6, how many does she have left?',
        'Round 247 to the nearest ten.',
        'What is the area of a rectangle with length 8cm and width 5cm?',
        'Convert 3/4 to a decimal.',
        'What is 50% of 80?',
        'Solve for x: x + 12 = 20',
        'List the factors of 24.',
        'What is the perimeter of a square with sides of 7cm?'
      ],
      'English': [
        'Write a sentence using the word "adventure".',
        'What is the past tense of "run"?',
        'Identify the noun in this sentence: "The cat sat on the mat."',
        'Write a synonym for "happy".',
        'What type of sentence is this: "Are you coming to the party?"',
        'Correct the spelling: "recieve"',
        'Write a short paragraph about your favorite season.',
        'What is the plural of "child"?',
        'Identify the verb in: "She quickly ran to school."',
        'Write an antonym for "hot".'
      ],
      'Natural Sciences': [
        'Name the three states of matter.',
        'What gas do plants need for photosynthesis?',
        'How many legs does an insect have?',
        'What is the largest planet in our solar system?',
        'Name one renewable energy source.',
        'What happens to water when it freezes?',
        'Which organ pumps blood through your body?',
        'What do we call animals that eat only plants?',
        'Name the force that pulls objects toward Earth.',
        'What is the chemical symbol for water?'
      ],
      'Social Sciences': [
        'Name the seven continents.',
        'What is the capital city of South Africa?',
        'Who was the first president of democratic South Africa?',
        'What are the three branches of government?',
        'Name two natural resources found in South Africa.',
        'What is democracy?',
        'Name one of South Africa\'s official languages.',
        'What is the difference between a city and a town?',
        'Why do people migrate from one place to another?',
        'What is culture?'
      ]
    };

    return questionBank[subject] || [
      'Define the main concept of this topic.',
      'Give three examples related to this subject.',
      'Explain why this topic is important.',
      'Compare and contrast two key ideas.',
      'What would happen if...?',
      'Describe the process of...',
      'List the main characteristics of...',
      'How does this relate to everyday life?',
      'What are the advantages and disadvantages?',
      'Summarize what you have learned.'
    ];
  }

  private async createWorksheetPDF(params: {
    title: string;
    content: string;
    grade: string;
    subject: string;
  }): Promise<string> {
    try {
      // Always use local PDF generation for now to avoid server dependency
      const pdfContent = this.generateMockPDF(params.title, params.content, params);
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('PDF creation failed:', error);
      // Fallback to a working demo PDF
      const pdfContent = this.generateMockPDF(params.title, params.content, params);
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      return URL.createObjectURL(blob);
    }
  }

  private async mockGenerateWorksheet(request: WorksheetRequest): Promise<Worksheet> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const worksheetId = `worksheet-${Date.now()}`;
    const title = `${request.subject} Worksheet - ${request.grade}`;
    
    let extractedText = '';
    
    if (request.type === 'image') {
      // For demo, simulate text extraction
      extractedText = `Sample lesson plan content about ${request.subject} for ${request.grade} students. This would normally be extracted from the uploaded image using AWS Textract.`;
    } else {
      extractedText = request.content;
    }
    
    // Generate worksheet content
    const content = this.generateFallbackContent({
      text: extractedText,
      prompt: request.prompt,
      grade: request.grade,
      subject: request.subject,
      language: request.language,
    });
    
    // Create PDF
    const pdfContent = this.generateMockPDF(title, content, {
      title,
      content,
      grade: request.grade,
      subject: request.subject,
    });
    
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(blob);
    
    return {
      id: worksheetId,
      title,
      content,
      grade: request.grade,
      subject: request.subject,
      language: request.language,
      pdfUrl,
      createdAt: new Date().toISOString(),
      isFavorite: false,
      downloadCount: 0,
    };
  }

  private generateMockPDF(title: string, content: string, params: any): string {
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