import React from 'react';
import { useStudy } from '../context/StudyContext';
import { Bookmark, X, ArrowRight, Trash2 } from 'lucide-react';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChapter: (chapterId: string) => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  onClose,
  onSelectChapter
}) => {
  const { bookmarks, chapters, toggleBookmark } = useStudy();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Bookmark className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Saved Bookmarks</h3>
              <p className="text-xs text-slate-500">
                {bookmarks.length} bookmarked topics & exam snippets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 divide-y divide-slate-100">
          {bookmarks.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              કોઈ બુકમાર્ક સાચવેલા નથી (No bookmarked topics yet. Click the bookmark icon on any chapter or section to save).
            </div>
          ) : (
            bookmarks.map((bm) => {
              const matchedCh = chapters.find((c) => c.id === bm.chapterId);

              return (
                <div key={bm.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {matchedCh?.code || 'Ch'}
                      </span>
                      <span className="font-bold text-xs text-slate-900 truncate font-gujarati">
                        {bm.chapterTitleGu}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-700 font-gujarati mb-1">
                      {bm.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-2 italic font-gujarati">
                      "{bm.snippet}"
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-center">
                    <button
                      onClick={() => {
                        onSelectChapter(bm.chapterId);
                        onClose();
                      }}
                      className="p-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1"
                      title="Open Chapter"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
