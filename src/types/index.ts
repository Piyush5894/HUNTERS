export type SectionType =
  | 'home'
  | 'browse'
  | 'short-notes'
  | 'quiz'
  | 'branches'
  | 'upload'
  | 'account'
  | 'login';

export interface ShortNote {
  id: string;
  title: string;
  subject: string;
  branch: string;
  semester: number;
  unit: string;
  keyConcepts: string[];
  formulas?: string[];
  examPitfalls?: string[];
  mnemonic?: string;
  quickSummary: string;
  tags: string[];
}

export interface QuizQuestion {
  id: string;
  subject: string;
  branch: string;
  semester: number;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  formulaHint?: string;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  predictedGrade: string;
  gradeDescription: string;
  timeSpentSeconds: number;
  subject: string;
}

export type NoteCategory =
  | 'Lecture Notes'
  | 'Handwritten Notes'
  | 'Question Bank (PYQ)'
  | 'Formula Sheet'
  | 'Lab Manual'
  | 'Solved Papers';

export interface NotePagePreview {
  pageNumber: number;
  title: string;
  content: string;
  keyPoints?: string[];
  codeSnippet?: string;
  formula?: string;
}

export interface NoteAuthor {
  id: string;
  name: string;
  college: string;
  avatarUrl?: string;
  verified: boolean;
  role?: string;
}

export interface Note {
  id: string;
  title: string;
  subject: string;
  branch: string;
  semester: number;
  category: NoteCategory;
  description: string;
  author: NoteAuthor;
  fileName: string;
  fileSize: string;
  pages: number;
  format: 'pdf' | 'docx' | 'ppt';
  downloads: number;
  rating?: number;
  reviewsCount?: number;
  upvotes: number;
  isVerified: boolean;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
  previewPages: NotePagePreview[];
  syllabusUnitsCovered?: string[];
  syllabusPattern?: string;
  fileDataUrl?: string;
  fileBlobUrl?: string;
  hasOriginalFile?: boolean;
  isUserUploaded?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  college: string;
  branch: string;
  semester: number;
  avatar: string;
  role: 'student' | 'topper' | 'educator';
  reputationPoints: number;
  savedNoteIds: string[];
  downloadedNoteIds: string[];
  upvotedNoteIds: string[];
  uploadedNoteIds: string[];
}

export interface SubjectInfo {
  code: string;
  name: string;
  credits: number;
  description: string;
  units: string[];
}

export interface SemesterSyllabus {
  semester: number;
  subjects: SubjectInfo[];
}

export interface BranchInfo {
  code: string;
  name: string;
  shortDesc: string;
  iconName: string;
  accentColor: string;
  gradient: string;
  totalNotes: number;
  popularSubjects: string[];
  semesters: SemesterSyllabus[];
}
