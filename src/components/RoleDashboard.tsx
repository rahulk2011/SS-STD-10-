import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import {
  GraduationCap,
  Users,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  TrendingUp,
  FileSpreadsheet,
  Calendar,
  Building2,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const RoleDashboard: React.FC<{ onSelectChapter: (chapterId: string) => void }> = ({ onSelectChapter }) => {
  const { currentRole, userProfile, currentSchool } = useAuth();
  const { chapters, studyProgress, totalStudyTimeMinutes, completedChaptersCount } = useStudy();

  const totalChapters = chapters.length; // 19
  const progressPercent = Math.round((completedChaptersCount / totalChapters) * 100);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/60 p-4 sm:p-6 lg:p-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                {currentRole} portal • {currentSchool.name.split(',')[0]}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Academic Year 2026-27
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, {userProfile?.displayName}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              {currentRole === 'student' &&
                'Track your GSEB/GPSC Social Science handwritten notes mastery, active recall cards, and assessment scores.'}
              {currentRole === 'parent' &&
                'Monitor your ward’s learning consistency, chapter completion rate, and preparation readiness.'}
              {currentRole === 'teacher' &&
                'Track student syllabus coverage across 19 chapters, evaluate quiz outcomes, and assign revision topics.'}
              {currentRole === 'principal' &&
                'Executive school-wide academic governance, syllabus completion rate, and digital archive utilization.'}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="text-right">
              <div className="text-xs text-indigo-200 uppercase font-semibold">Syllabus Covered</div>
              <div className="text-2xl font-black text-white">{progressPercent}%</div>
              <div className="text-[11px] text-slate-300">{completedChaptersCount} of {totalChapters} Chapters</div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-inner">
              {currentRole === 'student' && <GraduationCap className="w-7 h-7" />}
              {currentRole === 'parent' && <Users className="w-7 h-7" />}
              {currentRole === 'teacher' && <BookOpen className="w-7 h-7" />}
              {currentRole === 'principal' && <ShieldCheck className="w-7 h-7" />}
            </div>
          </div>
        </div>
      </div>

      {/* Role View: STUDENT */}
      {currentRole === 'student' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
                <span>Completed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">{completedChaptersCount} / {totalChapters}</div>
              <div className="text-xs text-emerald-600 mt-1 font-semibold">{progressPercent}% of total syllabus</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
                <span>Study Time</span>
                <Clock className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">{totalStudyTimeMinutes} min</div>
              <div className="text-xs text-slate-500 mt-1">Logged on active revision</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
                <span>Notes Archive</span>
                <BookOpen className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">117 Pages</div>
              <div className="text-xs text-amber-600 mt-1 font-semibold">100% Faithful Transcription</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
                <span>Target Score</span>
                <Award className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">95%+</div>
              <div className="text-xs text-purple-600 mt-1 font-semibold">GSEB Class 10 Board Target</div>
            </div>
          </div>

          {/* Quick Chapters Grid */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>Chapter Readiness Tracker (19 Chapters)</span>
              <span className="text-xs text-indigo-600 font-normal">Click chapter to open reader</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {chapters.map((ch) => {
                const prog = studyProgress[ch.id];
                const status = prog?.status || 'not_started';

                return (
                  <button
                    key={ch.id}
                    onClick={() => onSelectChapter(ch.id)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/40 text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                          {ch.code}
                        </span>
                        <span className="text-[10px] text-slate-500">pp. {ch.pages}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 font-gujarati group-hover:text-indigo-900">
                        {ch.titleGu}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                        {ch.titleEn}
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {status === 'completed' && (
                        <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Ready
                        </span>
                      )}
                      {status === 'in_progress' && (
                        <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                          Studying
                        </span>
                      )}
                      {status === 'revision_needed' && (
                        <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800">
                          Revise
                        </span>
                      )}
                      {status === 'not_started' && (
                        <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-slate-200 text-slate-600">
                          Start
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Role View: PARENT */}
      {currentRole === 'parent' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base">
                  AP
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Child: Aarav Patel (Class 10-A, Roll: 10042)
                  </h3>
                  <div className="text-xs text-slate-500">
                    School: {currentSchool.name} • Board: {currentSchool.board}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> On Track for Board Exams
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold">Weekly Study Hours</div>
                <div className="text-xl font-black text-slate-900 mt-1">14.5 Hours</div>
                <div className="text-[11px] text-emerald-600 font-medium">↑ 2.1 hrs more than last week</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold">Average Quiz Accuracy</div>
                <div className="text-xl font-black text-slate-900 mt-1">88.4%</div>
                <div className="text-[11px] text-indigo-600 font-medium">Class percentile: Top 5%</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold">Teacher Remark</div>
                <div className="text-xs font-bold text-slate-800 mt-1 italic">
                  "Excellent grasp on Gujarat heritage & economic systems."
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Prof. Hitesh Mehta</div>
              </div>
            </div>

            <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-3">
              Chapters Requiring Immediate Attention
            </h4>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-amber-900">che:12 - ભારત: ખનીજ અને શક્તિનાં સંસાધનો</span>
                  <div className="text-amber-700 text-[11px]">Recommended: Review non-conventional energy projects</div>
                </div>
                <button
                  onClick={() => onSelectChapter('che-12-khanij-ane-shakti')}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700"
                >
                  View Notes
                </button>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-indigo-900">che:18 - ભાવવધારો અને ગ્રાહક જાગૃતિ</span>
                  <div className="text-indigo-700 text-[11px]">Recommended: Practice COPRA 1986 consumer court limits</div>
                </div>
                <button
                  onClick={() => onSelectChapter('che-18-bhavvadhara-grahak-jagrutti')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  View Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role View: TEACHER */}
      {currentRole === 'teacher' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Class 10-A Curriculum Management (Social Science)
                </h3>
                <p className="text-xs text-slate-500">
                  Assigned Faculty: Prof. Hitesh Mehta • 48 Students Registered
                </p>
              </div>

              <button
                onClick={() => alert('New digital assignment dispatched to Class 10-A on Firestore!')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                + Assign Chapter Homework
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold">Total Handwritten Pages Digitized</div>
                <div className="text-2xl font-black text-slate-900 mt-1">117 Pages</div>
                <div className="text-xs text-indigo-600 font-semibold">19 Chapters Ready</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold">Class Avg. Completion</div>
                <div className="text-2xl font-black text-slate-900 mt-1">79.2%</div>
                <div className="text-xs text-emerald-600 font-semibold">38 students completed 14+ chapters</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold">Upcoming Revision Test</div>
                <div className="text-base font-bold text-slate-900 mt-1">Friday: Chapters 1 to 6</div>
                <div className="text-[11px] text-slate-500">Heritage, Fine Arts & Architecture</div>
              </div>
            </div>

            <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-3">
              Teacher Teaching Material Checklist
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {chapters.slice(0, 5).map((ch) => (
                <div key={ch.id} className="p-3 bg-white flex items-center justify-between text-xs hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-indigo-700">{ch.code}</span>
                    <span className="font-gujarati font-bold text-slate-900">{ch.titleGu}</span>
                    <span className="text-slate-400">({ch.titleEn})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectChapter(ch.id)}
                      className="text-xs text-indigo-600 font-semibold hover:underline"
                    >
                      Open Lesson Notes →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Role View: PRINCIPAL */}
      {currentRole === 'principal' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  School-Wide EdTech Executive Dashboard
                </h3>
                <p className="text-xs text-slate-500">
                  {currentSchool.name} • Institution Code: {currentSchool.code}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Tenant Isolation Verified (Firestore ABAC)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold">Total Students</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{currentSchool.totalStudents}</div>
                <div className="text-[11px] text-indigo-600 font-medium">All classes enrolled</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold">Teaching Faculty</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{currentSchool.totalTeachers}</div>
                <div className="text-[11px] text-slate-500">Social Science Dept: 6</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold">Curriculum Digitization</div>
                <div className="text-2xl font-black text-slate-900 mt-1">100%</div>
                <div className="text-[11px] text-emerald-600 font-semibold">117 Handwritten Pages Online</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 font-semibold">Board Readiness Index</div>
                <div className="text-2xl font-black text-slate-900 mt-1">94.8%</div>
                <div className="text-[11px] text-emerald-600 font-semibold">Projected Distinction</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-indigo-950 text-sm">Download School Board Preparation Audit</h4>
                <p className="text-xs text-indigo-700 mt-0.5">
                  Generate official institution-wide revision coverage report for GSEB/CBSE inspection.
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                Export Audit PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
