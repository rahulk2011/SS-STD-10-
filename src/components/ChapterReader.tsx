import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { useAuth } from '../context/AuthContext';
import { ChapterNote } from '../types';
import {
  Volume2,
  VolumeX,
  Bookmark,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Printer,
  Sparkles,
  BookOpen,
  HelpCircle,
  Lightbulb,
  FileText,
  RotateCw,
  Check,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export const ChapterReader: React.FC = () => {
  const {
    selectedChapter,
    studyProgress,
    updateChapterProgress,
    saveQuizScore,
    toggleBookmark,
    isBookmarked,
    speakText,
    stopSpeaking,
    isSpeaking
  } = useStudy();

  const { userProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards' | 'quiz' | 'personal'>('notes');
  const [languageMode, setLanguageMode] = useState<'both' | 'gu' | 'en'>('both');
  const [copied, setCopied] = useState(false);
  const [personalNotes, setPersonalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Flashcards state
  const [currentFcIndex, setCurrentFcIndex] = useState(0);
  const [showFcAnswer, setShowFcAnswer] = useState(false);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const progress = studyProgress[selectedChapter.id];
  const currentStatus = progress?.status || 'not_started';

  const handleCopyNotes = () => {
    const text = `${selectedChapter.code} - ${selectedChapter.titleGu} (${selectedChapter.titleEn})\n\n` +
      selectedChapter.sections.map((s) => `${s.headingGu} / ${s.headingEn}\n` + s.contentGu.join('\n')).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = (status: 'not_started' | 'in_progress' | 'completed' | 'revision_needed') => {
    updateChapterProgress(selectedChapter.id, status, 15);
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await updateChapterProgress(selectedChapter.id, currentStatus, 5, personalNotes);
    setSavingNotes(false);
  };

  const handleQuizOption = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    let score = 0;
    selectedChapter.quiz.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });
    setQuizSubmitted(true);
    await saveQuizScore(selectedChapter.id, score);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
  };

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      {/* Chapter Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {selectedChapter.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {selectedChapter.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Pages {selectedChapter.pages} (117 Total)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-gujarati mb-1">
              {selectedChapter.titleGu}
            </h1>
            <h2 className="text-base text-slate-500 font-medium">
              {selectedChapter.titleEn}
            </h2>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Audio Read Aloud */}
            <button
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking();
                } else {
                  speakText(
                    `${selectedChapter.titleGu}. ${selectedChapter.summaryGu}. ` +
                      selectedChapter.sections.map((s) => s.contentGu.join('. ')).join('. '),
                    'gu-IN'
                  );
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                isSpeaking
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Voice narration of notes"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
              <span>{isSpeaking ? 'Stop Audio' : 'Audio Reader (વાંચી સંભળાવો)'}</span>
            </button>

            {/* Bookmark button */}
            <button
              onClick={() => toggleBookmark(selectedChapter)}
              className={`p-2 rounded-lg border text-xs font-semibold transition-colors ${
                isBookmarked(selectedChapter.id)
                  ? 'bg-amber-50 text-amber-600 border-amber-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Bookmark this chapter"
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>

            {/* Copy button */}
            <button
              onClick={handleCopyNotes}
              className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 text-xs transition-colors"
              title="Copy notes text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Print button */}
            <button
              onClick={() => window.print()}
              className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 text-xs transition-colors"
              title="Printable Study Sheet"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Status Select */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 pl-2">Status:</span>
              <select
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value as any)}
                className="text-xs bg-white border-0 rounded-md px-2 py-1 font-semibold text-slate-800 shadow-2xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="not_started">Not Started (શરૂ નથી)</option>
                <option value="in_progress">In Progress (ચાલુ છે)</option>
                <option value="completed">Completed (સંપૂર્ણ તૈયાર)</option>
                <option value="revision_needed">Needs Revision (પુનરાવર્તન)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chapter Summary Card */}
        <div className="mt-4 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>પ્રકરણ સારાંશ (Executive Summary)</span>
          </div>
          <p className="text-sm text-slate-800 font-gujarati leading-relaxed">
            {selectedChapter.summaryGu}
          </p>
          <p className="text-xs text-slate-600 mt-2 italic leading-relaxed">
            {selectedChapter.summaryEn}
          </p>
        </div>

        {/* Quick Facts Strip */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {selectedChapter.quickFacts.map((fact, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between"
            >
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                {fact.labelGu} ({fact.labelEn})
              </div>
              <div className="text-xs font-extrabold text-indigo-900 mt-1 font-gujarati">
                {fact.valueGu}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                Source Page {fact.page}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 mb-6 bg-white rounded-xl px-4 py-2 shadow-2xs">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'notes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Full Notes (સંપૂર્ણ નોંધ)</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'flashcards'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Flashcards ({selectedChapter.flashcards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'quiz'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Quiz Assessment</span>
          </button>

          <button
            onClick={() => setActiveTab('personal')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'personal'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Study Log</span>
          </button>
        </div>

        {/* Language switcher */}
        {activeTab === 'notes' && (
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setLanguageMode('both')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                languageMode === 'both' ? 'bg-white font-bold text-indigo-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Dual (દ્વિભાષી)
            </button>
            <button
              onClick={() => setLanguageMode('gu')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                languageMode === 'gu' ? 'bg-white font-bold text-indigo-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              ગુજરાતી
            </button>
            <button
              onClick={() => setLanguageMode('en')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                languageMode === 'en' ? 'bg-white font-bold text-indigo-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              English
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Detailed Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {selectedChapter.sections.map((section, idx) => (
            <div
              key={section.id || idx}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-gujarati">
                      {section.headingGu}
                    </h3>
                    <h4 className="text-xs text-slate-500 font-medium">
                      {section.headingEn}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    p. {section.pageRef}
                  </span>
                  <button
                    onClick={() => toggleBookmark(selectedChapter, section.headingGu, section.contentGu[0])}
                    className="p-1.5 text-slate-400 hover:text-amber-500 rounded"
                    title="Bookmark this section"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Parallel or Single Mode */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {(languageMode === 'both' || languageMode === 'gu') && (
                  <div className={languageMode === 'both' ? 'md:col-span-6' : 'md:col-span-12'}>
                    <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                      <span>ગુજરાતી મૂળ લખાણ (Original Text)</span>
                    </div>
                    <ul className="space-y-2.5">
                      {section.contentGu.map((point, pIdx) => (
                        <li key={pIdx} className="text-sm text-slate-800 font-gujarati leading-relaxed flex items-start gap-2">
                          <span className="text-indigo-500 font-bold mt-1 text-xs">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(languageMode === 'both' || languageMode === 'en') && (
                  <div
                    className={`${
                      languageMode === 'both' ? 'md:col-span-6 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 pt-4 md:pt-0' : 'md:col-span-12'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      <span>English Annotated Analysis</span>
                    </div>
                    <ul className="space-y-2.5">
                      {section.contentEn.map((point, pIdx) => (
                        <li key={pIdx} className="text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                          <span className="text-slate-400 font-bold mt-1 text-xs">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Section Key Facts */}
              {section.keyFacts && section.keyFacts.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                  {section.keyFacts.map((kf, kfIdx) => (
                    <span
                      key={kfIdx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      <strong className="text-indigo-900">{kf.label}:</strong>
                      <span>{kf.value}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Tags */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500">Key Tags:</span>
            {selectedChapter.tags.map((tag, tIdx) => (
              <span
                key={tIdx}
                className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Flashcards */}
      {activeTab === 'flashcards' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-900">
              પુનરાવર્તન ફ્લેશકાર્ડ (Active Recall Study Cards)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Click on the card to flip and verify your memory. Card {currentFcIndex + 1} of{' '}
              {selectedChapter.flashcards.length}
            </p>
          </div>

          {selectedChapter.flashcards.length > 0 ? (
            <div>
              {/* Card Container */}
              <div
                onClick={() => setShowFcAnswer(!showFcAnswer)}
                className="min-h-[260px] bg-white rounded-3xl p-8 border-2 border-indigo-100 shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono">
                    Page {selectedChapter.flashcards[currentFcIndex].page} Reference
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                    {showFcAnswer ? 'ANSWER (જવાબ)' : 'QUESTION (પ્રશ્ન)'}
                  </span>
                </div>

                <div className="py-6 text-center">
                  {!showFcAnswer ? (
                    <div>
                      <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-gujarati leading-snug">
                        {selectedChapter.flashcards[currentFcIndex].questionGu}
                      </div>
                      <div className="text-sm text-slate-500 mt-2">
                        {selectedChapter.flashcards[currentFcIndex].questionEn}
                      </div>
                      <div className="mt-4 text-xs font-semibold text-indigo-600 flex items-center justify-center gap-1">
                        <RotateCw className="w-3.5 h-3.5" /> Click anywhere to reveal answer
                      </div>
                    </div>
                  ) : (
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                      <div className="text-xl sm:text-2xl font-black text-emerald-700 font-gujarati leading-snug">
                        {selectedChapter.flashcards[currentFcIndex].answerGu}
                      </div>
                      <div className="text-sm text-slate-600 mt-2">
                        {selectedChapter.flashcards[currentFcIndex].answerEn}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center text-xs text-slate-400">
                  Tap to flip • Smart Study Tracker
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between mt-4">
                <button
                  disabled={currentFcIndex === 0}
                  onClick={() => {
                    setShowFcAnswer(false);
                    setCurrentFcIndex((prev) => Math.max(0, prev - 1));
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <div className="text-xs font-bold text-slate-600">
                  {currentFcIndex + 1} / {selectedChapter.flashcards.length}
                </div>

                <button
                  disabled={currentFcIndex === selectedChapter.flashcards.length - 1}
                  onClick={() => {
                    setShowFcAnswer(false);
                    setCurrentFcIndex((prev) => Math.min(selectedChapter.flashcards.length - 1, prev + 1));
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              No flashcards available for this chapter.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Self-Assessment Quiz */}
      {activeTab === 'quiz' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-gujarati">
                  સ્વ-મૂલ્યાંકન ક્વિઝ (Chapter Self-Assessment)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify your mastery of key dates, acts, and concepts. Scores persist to your student profile.
                </p>
              </div>

              {progress?.quizScore !== null && progress?.quizScore !== undefined && (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black">
                  Last Score: {progress.quizScore}/{selectedChapter.quiz.length}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {selectedChapter.quiz.map((q, qIdx) => {
                const selected = selectedAnswers[q.id];
                const isAnswered = selected !== undefined;

                return (
                  <div key={q.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-1">
                      પ્રશ્ન {qIdx + 1}
                    </div>
                    <div className="font-bold text-sm text-slate-900 font-gujarati mb-1">
                      {q.questionGu}
                    </div>
                    <div className="text-xs text-slate-500 mb-3">{q.questionEn}</div>

                    <div className="space-y-2">
                      {q.optionsGu.map((optGu, optIdx) => {
                        let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300';
                        if (selected === optIdx) {
                          btnStyle = 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold';
                        }
                        if (quizSubmitted) {
                          if (optIdx === q.correctIndex) {
                            btnStyle = 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold';
                          } else if (selected === optIdx && selected !== q.correctIndex) {
                            btnStyle = 'bg-rose-50 border-rose-500 text-rose-900 line-through';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleQuizOption(q.id, optIdx)}
                            className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                          >
                            <span className="font-gujarati">{optGu}</span>
                            <span className="text-[11px] text-slate-400 font-normal">
                              ({q.optionsEn[optIdx]})
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 text-xs">
                        <strong className="text-slate-800">સમજૂતી (Explanation): </strong>
                        <span className="font-gujarati text-slate-700">{q.explanationGu}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={handleResetQuiz}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
              >
                Reset Answers
              </button>

              <button
                onClick={handleSubmitQuiz}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                Submit & Save to Firestore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Study Log & Personal Notes */}
      {activeTab === 'personal' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              અભ્યાસ નોંધો (Personal Notes & Revision Log)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Jot down important mnemonic tricks, exam dates, or personal reflections for {selectedChapter.code}.
            </p>

            <textarea
              rows={6}
              value={personalNotes || progress?.personalNotes || ''}
              onChange={(e) => setPersonalNotes(e.target.value)}
              placeholder="અહીં તમારી વ્યક્તિગત પરીક્ષા નોંધો લખો (e.g. મોઢેરા સૂર્યમંદિર સોલંકી શૈલી 1026 ઈ.સ., કુંડમાં 108 નાના મંદિરો)..."
              className="w-full text-xs font-gujarati p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Total Time Logged:{' '}
                <strong className="text-slate-800">{progress?.timeSpentMinutes || 0} minutes</strong>
              </div>

              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
