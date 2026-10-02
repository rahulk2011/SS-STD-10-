import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from './AuthContext';
import { ChapterNote, StudyProgressRecord, BookmarkRecord } from '../types';
import { ALL_CHAPTERS } from '../data/chaptersData';

interface StudyContextType {
  chapters: ChapterNote[];
  selectedChapter: ChapterNote;
  setSelectedChapter: (chapter: ChapterNote) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  studyProgress: Record<string, StudyProgressRecord>;
  bookmarks: BookmarkRecord[];
  updateChapterProgress: (chapterId: string, status: StudyProgressRecord['status'], timeSpentDelta?: number, personalNotes?: string) => Promise<void>;
  saveQuizScore: (chapterId: string, score: number) => Promise<void>;
  toggleBookmark: (chapter: ChapterNote, sectionHeading?: string, snippetText?: string) => Promise<void>;
  isBookmarked: (chapterId: string) => boolean;
  filteredChapters: ChapterNote[];
  totalStudyTimeMinutes: number;
  completedChaptersCount: number;
  speakText: (text: string, lang?: 'gu-IN' | 'en-US') => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile, currentSchool } = useAuth();
  const [chapters] = useState<ChapterNote[]>(ALL_CHAPTERS);
  const [selectedChapter, setSelectedChapter] = useState<ChapterNote>(ALL_CHAPTERS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [studyProgress, setStudyProgress] = useState<Record<string, StudyProgressRecord>>({});
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Firestore sync for study progress - ONLY attach listener when currentUser is authenticated
  useEffect(() => {
    if (!currentUser) {
      // Load saved progress from localStorage for demo / unauthenticated preview
      try {
        const saved = localStorage.getItem(`study_progress_${currentSchool.id}`);
        if (saved) {
          setStudyProgress(JSON.parse(saved));
        }
      } catch (e) {
        console.warn('LocalStorage load error:', e);
      }
      return;
    }

    try {
      const q = query(
        collection(db, 'study_progress'),
        where('userId', '==', currentUser.uid)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const map: Record<string, StudyProgressRecord> = {};
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as StudyProgressRecord;
            map[data.chapterId] = data;
          });
          setStudyProgress(map);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'study_progress');
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('Progress listener fallback:', err);
    }
  }, [currentUser, currentSchool.id]);

  // Firestore sync for bookmarks - ONLY attach listener when currentUser is authenticated
  useEffect(() => {
    if (!currentUser) {
      // Load saved bookmarks from localStorage for demo / unauthenticated preview
      try {
        const saved = localStorage.getItem('study_bookmarks');
        if (saved) {
          setBookmarks(JSON.parse(saved));
        }
      } catch (e) {
        console.warn('LocalStorage load error:', e);
      }
      return;
    }

    try {
      const q = query(
        collection(db, 'bookmarks'),
        where('userId', '==', currentUser.uid)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const bList: BookmarkRecord[] = [];
          snapshot.forEach((docSnap) => {
            bList.push({ ...docSnap.data(), id: docSnap.id } as BookmarkRecord);
          });
          setBookmarks(bList);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'bookmarks');
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('Bookmarks listener fallback:', err);
    }
  }, [currentUser]);

  const updateChapterProgress = async (
    chapterId: string,
    status: StudyProgressRecord['status'],
    timeSpentDelta = 0,
    personalNotes?: string
  ) => {
    const existing = studyProgress[chapterId];
    const uid = currentUser?.uid || userProfile?.uid || 'guest_user';
    const updatedRecord: StudyProgressRecord = {
      id: `${uid}_${chapterId}`,
      userId: uid,
      studentName: userProfile?.displayName || 'Study Scholar',
      schoolId: currentSchool.id,
      chapterId,
      status,
      timeSpentMinutes: (existing?.timeSpentMinutes || 0) + timeSpentDelta,
      lastStudiedAt: new Date().toISOString(),
      quizScore: existing?.quizScore ?? null,
      personalNotes: personalNotes !== undefined ? personalNotes : existing?.personalNotes || ''
    };

    // Update state & localStorage immediately
    setStudyProgress((prev) => {
      const next = { ...prev, [chapterId]: updatedRecord };
      try {
        localStorage.setItem(`study_progress_${currentSchool.id}`, JSON.stringify(next));
      } catch (e) {
        // ignore storage quota error
      }
      return next;
    });

    // If authenticated with Firebase, persist to Firestore
    if (currentUser) {
      try {
        await setDoc(doc(db, 'study_progress', updatedRecord.id), updatedRecord, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'study_progress');
      }
    }
  };

  const saveQuizScore = async (chapterId: string, score: number) => {
    const existing = studyProgress[chapterId];
    const uid = currentUser?.uid || userProfile?.uid || 'guest_user';
    const updatedRecord: StudyProgressRecord = {
      id: `${uid}_${chapterId}`,
      userId: uid,
      studentName: userProfile?.displayName || 'Study Scholar',
      schoolId: currentSchool.id,
      chapterId,
      status: (existing?.status === 'not_started' || !existing?.status) ? 'in_progress' : existing.status,
      timeSpentMinutes: (existing?.timeSpentMinutes || 0) + 5,
      lastStudiedAt: new Date().toISOString(),
      quizScore: score,
      personalNotes: existing?.personalNotes || ''
    };

    setStudyProgress((prev) => {
      const next = { ...prev, [chapterId]: updatedRecord };
      try {
        localStorage.setItem(`study_progress_${currentSchool.id}`, JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });

    if (currentUser) {
      try {
        await setDoc(doc(db, 'study_progress', updatedRecord.id), updatedRecord, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'study_progress');
      }
    }
  };

  const toggleBookmark = async (chapter: ChapterNote, sectionHeading?: string, snippetText?: string) => {
    const uid = currentUser?.uid || userProfile?.uid || 'guest_user';
    const bookmarkDocId = `${uid}_${chapter.id}`;
    const alreadyBookmarked = bookmarks.some((b) => b.chapterId === chapter.id);

    if (alreadyBookmarked) {
      const nextList = bookmarks.filter((b) => b.chapterId !== chapter.id);
      setBookmarks(nextList);
      try {
        localStorage.setItem('study_bookmarks', JSON.stringify(nextList));
      } catch (e) {
        // ignore
      }

      if (currentUser) {
        try {
          await deleteDoc(doc(db, 'bookmarks', bookmarkDocId));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, 'bookmarks');
        }
      }
    } else {
      const newBm: BookmarkRecord = {
        id: bookmarkDocId,
        userId: uid,
        schoolId: currentSchool.id,
        chapterId: chapter.id,
        chapterTitleGu: chapter.titleGu,
        chapterTitleEn: chapter.titleEn,
        title: sectionHeading || chapter.titleGu,
        snippet: snippetText || chapter.summaryGu.substring(0, 150) + '...',
        createdAt: new Date().toISOString()
      };
      const nextList = [...bookmarks, newBm];
      setBookmarks(nextList);
      try {
        localStorage.setItem('study_bookmarks', JSON.stringify(nextList));
      } catch (e) {
        // ignore
      }

      if (currentUser) {
        try {
          await setDoc(doc(db, 'bookmarks', bookmarkDocId), newBm);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'bookmarks');
        }
      }
    }
  };

  const isBookmarked = (chapterId: string) => {
    return bookmarks.some((b) => b.chapterId === chapterId);
  };

  // Text-To-Speech
  const speakText = (text: string, lang: 'gu-IN' | 'en-US' = 'gu-IN') => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Filtered chapters calculation
  const filteredChapters = useMemo(() => {
    return chapters.filter((ch) => {
      const matchesCategory = selectedCategory === 'All' || ch.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      const inTitleGu = ch.titleGu.toLowerCase().includes(q);
      const inTitleEn = ch.titleEn.toLowerCase().includes(q);
      const inCode = ch.code.toLowerCase().includes(q);
      const inSummary = ch.summaryGu.toLowerCase().includes(q) || ch.summaryEn.toLowerCase().includes(q);
      const inTags = ch.tags.some((t) => t.toLowerCase().includes(q));
      const inSections = ch.sections.some(
        (sec) =>
          sec.headingGu.toLowerCase().includes(q) ||
          sec.headingEn.toLowerCase().includes(q) ||
          sec.contentGu.some((c) => c.toLowerCase().includes(q)) ||
          sec.contentEn.some((c) => c.toLowerCase().includes(q))
      );
      const inFacts = ch.quickFacts.some(
        (f) =>
          f.labelGu.toLowerCase().includes(q) ||
          f.valueGu.toLowerCase().includes(q) ||
          f.labelEn.toLowerCase().includes(q) ||
          f.valueEn.toLowerCase().includes(q)
      );

      return inTitleGu || inTitleEn || inCode || inSummary || inTags || inSections || inFacts;
    });
  }, [chapters, selectedCategory, searchQuery]);

  const totalStudyTimeMinutes = useMemo(() => {
    return Object.values(studyProgress).reduce((acc, curr) => acc + (curr.timeSpentMinutes || 0), 0);
  }, [studyProgress]);

  const completedChaptersCount = useMemo(() => {
    return Object.values(studyProgress).filter((p) => p.status === 'completed').length;
  }, [studyProgress]);

  return (
    <StudyContext.Provider
      value={{
        chapters,
        selectedChapter,
        setSelectedChapter,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        studyProgress,
        bookmarks,
        updateChapterProgress,
        saveQuizScore,
        toggleBookmark,
        isBookmarked,
        filteredChapters,
        totalStudyTimeMinutes,
        completedChaptersCount,
        speakText,
        stopSpeaking,
        isSpeaking
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) throw new Error('useStudy must be used within a StudyProvider');
  return context;
};
