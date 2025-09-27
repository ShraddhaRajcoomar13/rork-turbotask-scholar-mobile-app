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

export const GRADE_OPTIONS = [
  'Grade R', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
];

export const SUBJECT_OPTIONS = [
  'Mathematics', 'English', 'Afrikaans', 'Natural Sciences', 'Social Sciences',
  'Technology', 'Arts and Culture', 'Life Orientation', 'Economic Management Sciences',
  'Physical Sciences', 'Life Sciences', 'Geography', 'History', 'Accounting',
  'Business Studies', 'Tourism', 'Consumer Studies', 'Information Technology',
  'Creative Arts', 'Home Language', 'First Additional Language', 'Second Additional Language'
];

export interface WorksheetTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  grade: string;
  prompt: string;
  thumbnail?: string;
}

export interface TeacherProfile {
  school?: string;
  subjects?: string[];
  grades?: string[];
  bio?: string;
  experience?: number;
  qualifications?: string[];
}