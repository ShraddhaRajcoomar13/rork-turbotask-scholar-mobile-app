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
    profile: {
      school: 'Greenwood Primary School',
      subjects: ['Mathematics', 'Natural Sciences', 'English'],
      grades: ['Grade 4', 'Grade 5', 'Grade 6'],
      bio: 'Passionate educator with 8 years of experience in primary education. I love creating engaging learning experiences that make complex concepts accessible to young minds.',
      experience: 8,
      qualifications: ['B.Ed Primary Education', 'PGCE Mathematics', 'Certificate in Educational Technology'],
    },
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
    profile: {
      school: 'Riverside High School',
      subjects: ['Physical Sciences', 'Mathematics', 'Life Sciences'],
      grades: ['Grade 10', 'Grade 11', 'Grade 12'],
      bio: 'High school science teacher dedicated to inspiring the next generation of scientists and mathematicians.',
      experience: 12,
      qualifications: ['BSc Physics', 'Honours in Education', 'PGCE Physical Sciences'],
    },
  },
  {
    id: '3',
    email: 'pending@demo.com',
    firstName: 'Mary',
    lastName: 'Williams',
    role: 'teacher',
    status: 'pending',
    createdAt: '2024-01-25T14:15:00Z',
    profile: {
      school: 'Sunset Elementary',
      subjects: ['English', 'Arts and Culture'],
      grades: ['Grade 1', 'Grade 2', 'Grade 3'],
      bio: 'New teacher excited to bring creativity and innovation to early childhood education.',
      experience: 2,
      qualifications: ['B.Ed Foundation Phase', 'Certificate in Creative Arts Education'],
    },
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
  {
    id: '5',
    email: 'test@demo.com',
    firstName: 'Test',
    lastName: 'Teacher',
    role: 'teacher',
    status: 'approved',
    createdAt: '2024-01-01T00:00:00Z',
    approvedAt: '2024-01-01T00:00:00Z',
    profile: {
      school: 'Test School',
      subjects: ['Mathematics', 'English'],
      grades: ['Grade 1', 'Grade 2'],
      bio: 'Test teacher account for debugging',
      experience: 1,
      qualifications: ['Test Qualification'],
    },
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
      '10 AI-generated worksheets per month',
      'All subjects and grades',
      'Professional PDF downloads',
      'Email support',
      'All 11 South African languages',
      'Basic worksheet templates',
      'Image-to-worksheet conversion',
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
      '25 AI-generated worksheets per month',
      'Premium worksheet templates',
      'AI Chat Assistant for instant creation',
      'Priority email support',
      'All 11 South African languages',
      'Custom worksheet branding',
      'Complete worksheet history',
      'Advanced formatting options',
      'Curriculum-aligned content',
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
      '60 AI-generated worksheets per month',
      'Unlimited premium templates',
      'AI Chat Assistant with priority processing',
      'Phone & email support',
      'All 11 South African languages',
      'School branding and logos',
      'Complete worksheet analytics',
      'Bulk worksheet generation',
      'Multi-teacher account management',
      'Curriculum mapping tools',
      'Export to Google Classroom',
      'Advanced reporting dashboard',
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
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
  },
  {
    id: 'sub-2',
    userId: '2',
    tier: 'school',
    status: 'active',
    creditsRemaining: 45,
    creditsTotal: 60,
    expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days from now
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
  },
  {
    id: 'sub-3',
    userId: '5',
    tier: 'professional',
    status: 'active',
    creditsRemaining: 25,
    creditsTotal: 25,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
];

// Sample login credentials for demo
export const SAMPLE_CREDENTIALS = {
  teacher: {
    email: 'teacher@demo.com',
    password: 'demo123',
    description: 'Primary school teacher with Professional Plan (18/25 credits)',
  },
  john: {
    email: 'john.smith@demo.com',
    password: 'demo123',
    description: 'High school teacher with School Plan (45/60 credits)',
  },
  pending: {
    email: 'pending@demo.com',
    password: 'demo123',
    description: 'New teacher awaiting approval (no subscription)',
  },
  admin: {
    email: 'admin@demo.com',
    password: 'admin123',
    description: 'Administrator account',
  },
  test: {
    email: 'test@demo.com',
    password: 'demo123',
    description: 'Test teacher with full Professional Plan (25/25 credits)',
  },
};

// Sample worksheet templates for teachers
export const SAMPLE_WORKSHEET_TEMPLATES = [
  {
    id: 'math-addition',
    name: 'Addition Practice',
    subject: 'Mathematics',
    grade: 'Grade 2',
    description: 'Basic addition problems with visual aids',
    prompt: 'Create 15 addition problems for Grade 2 students using numbers 1-20. Include visual representations like dots or pictures to help students understand the concept.',
  },
  {
    id: 'english-comprehension',
    name: 'Reading Comprehension',
    subject: 'English',
    grade: 'Grade 4',
    description: 'Short story with questions',
    prompt: 'Create a short, age-appropriate story (150-200 words) about friendship for Grade 4 students, followed by 8 comprehension questions that test understanding, inference, and vocabulary.',
  },
  {
    id: 'science-plants',
    name: 'Plant Life Cycle',
    subject: 'Natural Sciences',
    grade: 'Grade 3',
    description: 'Interactive plant life cycle worksheet',
    prompt: 'Create a worksheet about plant life cycles for Grade 3 students. Include a diagram to label, 10 multiple choice questions, and a short activity where students describe each stage.',
  },
  {
    id: 'afrikaans-vocab',
    name: 'Afrikaanse Woordeskat',
    subject: 'Afrikaans',
    grade: 'Grade 5',
    description: 'Vocabulary building exercises',
    prompt: 'Skep \'n Afrikaanse woordeskat-werkblad vir Graad 5 leerders met 20 nuwe woorde, definisies, en sinne. Sluit woordsoeke en kruiswoordraaisel in.',
  },
];

// Teaching tips for the dashboard
export const TEACHING_TIPS = [
  {
    id: 'tip-1',
    title: 'Use Visual Learning',
    description: 'Include diagrams, charts, and images in your worksheets to help visual learners grasp concepts better.',
    category: 'pedagogy',
  },
  {
    id: 'tip-2',
    title: 'Differentiate Difficulty',
    description: 'Create worksheets with varying difficulty levels to accommodate all students in your class.',
    category: 'differentiation',
  },
  {
    id: 'tip-3',
    title: 'Include Answer Keys',
    description: 'Always generate answer keys to save time during marking and enable student self-assessment.',
    category: 'efficiency',
  },
  {
    id: 'tip-4',
    title: 'Align with Curriculum',
    description: 'Reference specific CAPS curriculum outcomes when creating worksheets to ensure alignment.',
    category: 'curriculum',
  },
  {
    id: 'tip-5',
    title: 'Use Local Context',
    description: 'Include South African examples and contexts to make learning more relevant for your students.',
    category: 'localization',
  },
];

// Sample generated worksheets for history
export const SAMPLE_WORKSHEETS = [
  {
    id: 'ws-1',
    userId: '1',
    title: 'Grade 5 Mathematics - Fractions Practice',
    content: 'A comprehensive worksheet covering basic fraction concepts...',
    language: 'en',
    grade: 'Grade 5',
    subject: 'Mathematics',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    createdAt: '2024-01-20T10:00:00Z',
    isFavorite: true,
    downloadCount: 5,
  },
  {
    id: 'ws-2',
    userId: '1',
    title: 'Grade 4 Natural Sciences - Plant Life Cycles',
    content: 'Interactive worksheet about how plants grow and reproduce...',
    language: 'en',
    grade: 'Grade 4',
    subject: 'Natural Sciences',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    createdAt: '2024-01-18T14:30:00Z',
    isFavorite: false,
    downloadCount: 3,
  },
  {
    id: 'ws-3',
    userId: '2',
    title: 'Grade 11 Physical Sciences - Newton\'s Laws',
    content: 'Advanced physics worksheet covering the three laws of motion...',
    language: 'en',
    grade: 'Grade 11',
    subject: 'Physical Sciences',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    createdAt: '2024-01-22T09:15:00Z',
    isFavorite: true,
    downloadCount: 8,
  },
];

// Subject-specific curriculum topics
export const CURRICULUM_TOPICS = {
  'Mathematics': {
    'Grade R': ['Numbers 1-10', 'Shapes', 'Patterns', 'Size and Position'],
    'Grade 1': ['Numbers 1-50', 'Addition and Subtraction', '2D Shapes', 'Time'],
    'Grade 2': ['Numbers 1-100', 'Place Value', 'Measurement', 'Data Handling'],
    'Grade 3': ['Numbers 1-1000', 'Multiplication', 'Fractions', 'Geometry'],
  },
  'English': {
    'Grade R': ['Phonics', 'Vocabulary', 'Listening Skills', 'Pre-writing'],
    'Grade 1': ['Reading', 'Writing', 'Grammar Basics', 'Comprehension'],
    'Grade 2': ['Sentence Structure', 'Spelling', 'Creative Writing', 'Poetry'],
    'Grade 3': ['Paragraphs', 'Punctuation', 'Literature', 'Oral Communication'],
  },
  'Natural Sciences': {
    'Grade R': ['My Body', 'Animals', 'Plants', 'Weather'],
    'Grade 1': ['Living and Non-living', 'Seasons', 'Materials', 'Movement'],
    'Grade 2': ['Life Cycles', 'Habitats', 'Properties of Materials', 'Forces'],
    'Grade 3': ['Plant and Animal Needs', 'Matter', 'Energy', 'Earth and Space'],
  },
};