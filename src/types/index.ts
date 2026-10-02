export type UserRole = 'student' | 'parent' | 'teacher' | 'principal';

export interface SchoolTenant {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  board: string;
  totalStudents: number;
  totalTeachers: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  schoolId: string;
  classGrade?: string;
  rollNumber?: string;
  childrenStudentIds?: string[];
  photoURL?: string;
}

export interface NoteSection {
  id: string;
  headingGu: string;
  headingEn: string;
  pageRef: number;
  contentGu: string[];
  contentEn: string[];
  keyFacts?: Array<{ label: string; value: string }>;
}

export interface QuickFact {
  labelGu: string;
  labelEn: string;
  valueGu: string;
  valueEn: string;
  page: number;
}

export interface Flashcard {
  id: string;
  questionGu: string;
  questionEn: string;
  answerGu: string;
  answerEn: string;
  page: number;
}

export interface QuizQuestion {
  id: string;
  questionGu: string;
  questionEn: string;
  optionsGu: string[];
  optionsEn: string[];
  correctIndex: number;
  explanationGu: string;
  explanationEn: string;
}

export interface ChapterNote {
  id: string;
  chapterNumber: number;
  code: string;
  titleGu: string;
  titleEn: string;
  pages: string;
  pageStart: number;
  pageEnd: number;
  category: string;
  summaryGu: string;
  summaryEn: string;
  sections: NoteSection[];
  quickFacts: QuickFact[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  tags: string[];
}

export interface StudyProgressRecord {
  id: string;
  userId: string;
  studentName?: string;
  schoolId: string;
  chapterId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'revision_needed';
  timeSpentMinutes: number;
  lastStudiedAt: string;
  quizScore: number | null;
  personalNotes?: string;
  isBookmarked?: boolean;
}

export interface BookmarkRecord {
  id: string;
  userId: string;
  schoolId: string;
  chapterId: string;
  chapterTitleGu: string;
  chapterTitleEn: string;
  sectionId?: string;
  title: string;
  snippet: string;
  createdAt: string;
}
