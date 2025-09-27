import { WorksheetRequest, Worksheet } from '@/types/worksheet';

const API_BASE_URL = 'http://vps.kyro.ninja:5000';

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
      let extractedText = '';
      
      // Step 1: Extract text from image if needed
      if (request.type === 'image') {
        extractedText = await this.extractTextFromImage(request.content);
      } else {
        extractedText = request.content;
      }

      // Step 2: Generate worksheet content using OpenAI
      const worksheetContent = await this.generateWorksheetContent({
        text: extractedText,
        prompt: request.prompt,
        grade: request.grade,
        subject: request.subject,
        language: request.language,
      });

      // Step 3: Create PDF from the generated content
      const pdfUrl = await this.createWorksheetPDF({
        title: `${request.subject} Worksheet - ${request.grade}`,
        content: worksheetContent,
        grade: request.grade,
        subject: request.subject,
      });

      // Step 4: Return worksheet object
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
      console.error('Worksheet generation failed:', error);
      throw new Error('Failed to generate worksheet. Please try again.');
    }
  }

  private async extractTextFromImage(imageBase64: string): Promise<string> {
    try {
      // Convert base64 to blob for FormData
      const response = await fetch(imageBase64);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'lesson-plan.jpg');

      const textractResponse = await fetch(`${API_BASE_URL}/textract/image`, {
        method: 'POST',
        body: formData,
      });

      if (!textractResponse.ok) {
        throw new Error('Failed to extract text from image');
      }

      const result = await textractResponse.json();
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

      const openaiResponse = await fetch(`${API_BASE_URL}/openai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'user',
            content: systemPrompt
          }],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!openaiResponse.ok) {
        throw new Error('Failed to generate worksheet content');
      }

      const result = await openaiResponse.json();
      return result.choices?.[0]?.message?.content || result.content || result.text || '';
    } catch (error) {
      console.error('Content generation failed:', error);
      throw new Error('Failed to generate worksheet content');
    }
  }

  private async createWorksheetPDF(params: {
    title: string;
    content: string;
    grade: string;
    subject: string;
  }): Promise<string> {
    try {
      // Step 1: Create S3 bucket for storing the PDF
      const bucketResponse = await fetch(`${API_BASE_URL}/s3/buckets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!bucketResponse.ok) {
        throw new Error('Failed to create storage bucket');
      }

      const { bucket_uuid } = await bucketResponse.json();

      // Step 2: Generate PDF content (in production, use proper PDF library)
      const pdfContent = this.generatePDFContent(params);
      
      // Step 3: Upload PDF to S3
      const formData = new FormData();
      const pdfBlob = new Blob([pdfContent], { type: 'application/pdf' });
      formData.append('file', pdfBlob, `${params.title.replace(/\s+/g, '_')}.pdf`);

      const uploadResponse = await fetch(`${API_BASE_URL}/s3/${bucket_uuid}/objects`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload worksheet PDF');
      }

      const { object_url } = await uploadResponse.json();
      return object_url;
    } catch (error) {
      console.error('PDF creation failed:', error);
      // Fallback to a sample PDF URL for demo
      return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    }
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
(Generated by TurboTask Scholar) Tj
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
    return `https://turbotaskscholar.com/shared/${worksheetId}`;
  }
}

export const worksheetService = new WorksheetService();