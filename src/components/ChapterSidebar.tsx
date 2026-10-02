import React from 'react';
import { useStudy } from '../context/StudyContext';
import { CATEGORIES } from '../data/chaptersData';
import {
  BookMarked,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Layers,
  ChevronRight
} from 'lucide-react';

interface ChapterSidebarProps {
  onSelectChapter?: () => void;
}

export const ChapterSidebar: React.FC<ChapterSidebarProps> = ({ onSelectChapter }) => {
  const {
    filteredChapters,
    selectedChapter,
    setSelectedChapter,
    selectedCategory,
    setSelectedCategory,
    studyProgress
  } = useStudy();

  return (
    <aside className="w-full lg:w-80 shrink-0 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-6rem)]">
      {/* Category selector */}
      <div className="p-3 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Chapters ({filteredChapters.length}/19)</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">117 Pages Notes</span>
        </div>

        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chapters list */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredChapters.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            કોઈ પ્રકરણ મળ્યું નથી (No chapters matched your search query).
          </div>
        ) : (
          filteredChapters.map((chapter) => {
            const isSelected = selectedChapter.id === chapter.id;
            const progress = studyProgress[chapter.id];
            const status = progress?.status || 'not_started';

            return (
              <button
                key={chapter.id}
                onClick={() => {
                  setSelectedChapter(chapter);
                  if (onSelectChapter) onSelectChapter();
                }}
                className={`w-full text-left p-3.5 transition-all flex items-start gap-3 group relative ${
                  isSelected
                    ? 'bg-indigo-50/80 text-indigo-950 font-medium border-l-4 border-indigo-600'
                    : 'hover:bg-slate-50 text-slate-700 border-l-4 border-transparent'
                }`}
              >
                {/* Code badge */}
                <div
                  className={`shrink-0 w-11 h-11 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold border transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200 group-hover:border-indigo-300'
                  }`}
                >
                  <span className="uppercase text-[9px] opacity-75">Ch</span>
                  <span className="text-sm font-black leading-none">{chapter.chapterNumber}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-bold text-xs truncate text-slate-900 font-gujarati">
                      {chapter.titleGu}
                    </span>
                    {/* Status indicator */}
                    {status === 'completed' && (
                      <span title="Completed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      </span>
                    )}
                    {status === 'in_progress' && (
                      <span title="In Progress">
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      </span>
                    )}
                    {status === 'revision_needed' && (
                      <span title="Needs Revision">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 truncate mb-1">
                    {chapter.titleEn}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">
                      p. {chapter.pages}
                    </span>
                    <span className="truncate max-w-[120px] text-indigo-600/80 font-medium">
                      {chapter.category}
                    </span>
                  </div>
                </div>

                <ChevronRight
                  className={`w-4 h-4 self-center text-slate-400 shrink-0 transition-transform ${
                    isSelected ? 'text-indigo-600 translate-x-0.5' : 'opacity-0 group-hover:opacity-100'
                  }`}
                />
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};
