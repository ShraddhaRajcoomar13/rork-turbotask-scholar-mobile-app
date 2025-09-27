export interface WorksheetRequest {
  type: 'text' | 'image';
  content: string; // text content or base64 image
  prompt?: string;
  language: string;
  grade: string;
  subject: string;
}

export interface Worksheet {
  id: string;
  userId?: string;
  title: string;
  content: string;
  language: string;
  grade: string;
  subject: string;
  pdfUrl: string;
  thumbnailUrl?: string;
  createdAt: string;
  isFavorite: boolean;
  downloadCount?: number;
}

export interface GenerationHistory {
  worksheets: Worksheet[];
  totalGenerated: number;
  creditsUsed: number;
}

export const SOUTH_AFRICAN_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'zu', name: 'isiZulu' },
  { code: 'xh', name: 'isiXhosa' },
  { code: 'st', name: 'Sesotho' },
  { code: 'tn', name: 'Setswana' },
  { code: 'ss', name: 'siSwati' },
  { code: 've', name: 'Tshivenda' },
  { code: 'ts', name: 'Xitsonga' },
  { code: 'nr', name: 'isiNdebele' },
  { code: 'nso', name: 'Sepedi' },
] as const;