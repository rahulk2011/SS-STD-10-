import { ChapterNote } from '../types';
import { CHAPTERS_PART_1 } from './chaptersPart1';
import { CHAPTERS_PART_2 } from './chaptersPart2';
import { CHAPTERS_PART_3 } from './chaptersPart3';
import { CHAPTERS_PART_4 } from './chaptersPart4';

export const ALL_CHAPTERS: ChapterNote[] = [
  ...CHAPTERS_PART_1,
  ...CHAPTERS_PART_2,
  ...CHAPTERS_PART_3,
  ...CHAPTERS_PART_4,
];

export const CATEGORIES = [
  'All',
  'Heritage & Culture',
  'Handicrafts & Fine Arts',
  'Sculpture & Architecture',
  'Literature & Ancient Universities',
  'Science & Heritage',
  'Heritage Sites & UNESCO',
  'Geography & Resources',
  'Agriculture & Crops',
  'Water & Irrigation',
  'Minerals & Energy',
  'Industries & Economy',
  'Transport & Infrastructure',
  'Economics & Systems',
  'Economics & Policy',
  'Poverty & Employment',
  'Consumer Rights & Standards',
  'Human Development & Health',
  'Social Justice & Security',
  'Civic Rights & Laws'
];
