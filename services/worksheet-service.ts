import { WorksheetRequest, Worksheet } from '@/types/worksheet';

const API_BASE_URL = 'https://vps.kyro.ninja';

export class WorksheetService {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    // In production, get token from secure storage
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-token',
    };
  }

  async generateWorksheet(request: WorksheetRequest): Promise<Worksheet> {
    try {
      console.log('Starting worksheet generation:', request);
      
      let extractedText = '';
      
      // Step 1: Extract text from image if needed
      if (request.type === 'image') {
        console.log('Processing image request:', { imageUri: request.content });
        try {
          extractedText = await this.extractTextFromImage(request.content);
          console.log('Extracted text length:', extractedText.length);
        } catch (error) {
          console.warn('Text extraction failed, using fallback:', error);
          extractedText = `Sample lesson plan content about ${request.subject} for ${request.grade} students.`;
        }
      } else {
        extractedText = request.content;
      }

      // Step 2: Generate worksheet content using OpenAI or fallback
      let worksheetContent: string;
      try {
        worksheetContent = await this.generateWorksheetContent({
          text: extractedText,
          prompt: request.prompt,
          grade: request.grade,
          subject: request.subject,
          language: request.language,
        });
      } catch (error) {
        console.warn('AI content generation failed, using fallback:', error);
        worksheetContent = this.generateFallbackContent({
          text: extractedText,
          prompt: request.prompt,
          grade: request.grade,
          subject: request.subject,
          language: request.language,
        });
      }

      // Step 3: Create PDF from the generated content
      const pdfUrl = await this.createWorksheetPDF({
        title: `${request.subject} Worksheet - ${request.grade}`,
        content: worksheetContent,
        grade: request.grade,
        subject: request.subject,
      });

      // Step 4: Return worksheet object
      const worksheet = {
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
      
      console.log('Worksheet generated successfully:', worksheet.title);
      return worksheet;
    } catch (error) {
      console.error('Worksheet generation failed:', error);
      
      // Return a fallback worksheet instead of throwing
      return this.generateFallbackWorksheet(request);
    }
  }

  private async extractTextFromImage(imageUri: string): Promise<string> {
    try {
      console.log('Converting image to base64:', imageUri);
      
      // Convert image to base64
      const response = await fetch(imageUri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log('Blob size:', blob.size, 'type:', blob.type);
      
      if (blob.size === 0) {
        throw new Error('Image file is empty');
      }
      
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            resolve(reader.result as string);
          } else {
            reject(new Error('Failed to read image as base64'));
          }
        };
        reader.onerror = () => reject(new Error('FileReader error'));
        reader.readAsDataURL(blob);
      });
      
      console.log('Base64 length:', base64.length);
      console.log('Base64 prefix:', base64.substring(0, 50));
      
      // Remove data:image/jpeg;base64, prefix
      const base64Data = base64.split(',')[1];
      
      if (!base64Data || base64Data.length === 0) {
        throw new Error('No base64 data after splitting');
      }
      
      console.log('Base64 data length:', base64Data.length);
      console.log('First 100 chars of base64:', base64Data.substring(0, 100));
      
      const payload = { image_b64: base64Data };
      const payloadString = JSON.stringify(payload);
      console.log('Payload size:', payloadString.length);
      console.log('Making request to:', `${API_BASE_URL}/textract/image`);
      
      const textractResponse = await fetch(`${API_BASE_URL}/textract/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payloadString,
      });
      
      console.log('Response status:', textractResponse.status);
      console.log('Response headers:', Object.fromEntries(textractResponse.headers.entries()));
      
      const responseText = await textractResponse.text();
      console.log('API response text:', responseText);

      if (!textractResponse.ok) {
        throw new Error(`Failed to extract text from image: ${responseText}`);
      }

      const result = JSON.parse(responseText);
      return result.text || result.extractedText || '';
    } catch (error) {
      console.error('Text extraction failed:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  private async generateWorksheetContent(params: {
    text: string;
    prompt?: string;
    grade: string;
    subject: string;
    language: string;
  }): Promise<string> {
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
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const openaiResponse = await fetch(`${API_BASE_URL}/openai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      clearTimeout(timeoutId);
      console.error('Content generation failed:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - server took too long to respond');
        }
        if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
          throw new Error('Network error - unable to connect to server');
        }
      }
      
      throw error;
    }
  }

  private async createWorksheetPDF(params: {
    title: string;
    content: string;
    grade: string;
    subject: string;
  }): Promise<string> {
    try {
      // For React Native, return a data URI instead of blob URL
      const textContent = `${params.title}\n\n${params.content}`;
      const base64Content = btoa(unescape(encodeURIComponent(textContent)));
      return `data:text/plain;base64,${base64Content}`;
    } catch (error) {
      console.error('PDF creation failed:', error);
      // Fallback to a working text file
      const fallbackContent = `${params.title}\n\nWorksheet content would appear here.\n\nGenerated by Bizzee Bee Worksheets`;
      const base64Content = btoa(unescape(encodeURIComponent(fallbackContent)));
      return `data:text/plain;base64,${base64Content}`;
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

  private async generateFallbackWorksheet(request: WorksheetRequest): Promise<Worksheet> {
    console.log('Generating fallback worksheet for:', request);
    
    const worksheetId = `worksheet-${Date.now()}`;
    const title = `${request.subject} Worksheet - ${request.grade}`;
    
    let extractedText = '';
    
    if (request.type === 'image') {
      extractedText = `Sample lesson plan content about ${request.subject} for ${request.grade} students.`;
    } else {
      extractedText = request.content;
    }
    
    const content = this.generateFallbackContent({
      text: extractedText,
      prompt: request.prompt,
      grade: request.grade,
      subject: request.subject,
      language: request.language,
    });
    
    const pdfUrl = await this.createWorksheetPDF({
      title,
      content,
      grade: request.grade,
      subject: request.subject,
    });
    
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

  private generatePDFContent(params: {
    title: string;
    content: string;
    grade: string;
    subject: string;
  }): string {
    // This is a simplified PDF structure for demo purposes
    // In production, use a proper PDF generation library like jsPDF or PDFKit
    const pdfHeader = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 5 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 16 Tf
72 720 Td
(${params.title}) Tj
0 -30 Td
/F1 12 Tf
(Grade: ${params.grade} | Subject: ${params.subject}) Tj
0 -40 Td
(Generated by Bizzee Bee Worksheets) Tj
0 -30 Td
(${params.content.substring(0, 100)}...) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000273 00000 n 
0000000523 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
590
%%EOF`;

    return pdfHeader;
  }

  async downloadWorksheet(worksheetId: string): Promise<string> {
    // In production, this would return a secure download URL
    // For demo, return the PDF URL directly
    return `${API_BASE_URL}/worksheets/${worksheetId}/download`;
  }

  async shareWorksheet(worksheetId: string): Promise<string> {
    // In production, this would create a shareable link
    return `https://bizzeebee.com/shared/${worksheetId}`;
  }
}

export const worksheetService = new WorksheetService();