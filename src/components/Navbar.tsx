import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import { UserRole } from '../types';
import {
  BookOpen,
  GraduationCap,
  Users,
  ShieldCheck,
  Building2,
  Bookmark,
  LogIn,
  LogOut,
  Sparkles,
  Database,
  Search,
  CheckCircle2,
  Volume2,
  VolumeX,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenBookmarks: () => void;
  activeTab: 'notes' | 'dashboard';
  setActiveTab: (tab: 'notes' | 'dashboard') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenBookmarks,
  activeTab,
  setActiveTab
}) => {
  const {
    currentUser,
    userProfile,
    currentSchool,
    currentRole,
    schools,
    signInWithGoogle,
    logout,
    switchRole,
    switchSchool,
    isFirebaseConnected
  } = useAuth();

  const { bookmarks, isSpeaking, stopSpeaking, searchQuery, setSearchQuery } = useStudy();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showSchoolMenu, setShowSchoolMenu] = useState(false);

  const roles: { role: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
    { role: 'student', label: 'Student (વિદ્યાર્થી)', icon: <GraduationCap className="w-4 h-4" />, color: 'bg-emerald-500' },
    { role: 'parent', label: 'Parent (વાલી)', icon: <Users className="w-4 h-4" />, color: 'bg-indigo-500' },
    { role: 'teacher', label: 'Teacher (શિક્ષક)', icon: <BookOpen className="w-4 h-4" />, color: 'bg-amber-500' },
    { role: 'principal', label: 'Principal (આચાર્ય)', icon: <ShieldCheck className="w-4 h-4" />, color: 'bg-purple-500' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand & Mobile Sidebar Toggle */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                title="Toggle Chapters Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-lg tracking-tight">Smart Study Tracker</span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    B2B EdTech SaaS
                  </span>
                </div>
                <div className="text-xs text-slate-500 hidden sm:block">
                  સામાજિક વિજ્ઞાન હસ્તલિખિત નોંધો ડિજિટલ સંગ્રહ (GSEB / GPSC)
                </div>
              </div>
            </div>
          </div>

          {/* Center: Search & Navigation Tabs */}
          <div className="hidden md:flex items-center gap-2">
            <div className="relative w-64 lg:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes (e.g. મોહેં-જો-દડો, NH-44, GDP)..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'notes'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Study Notes (નોંધ)
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Role Dashboard</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </button>
            </div>
          </div>

          {/* Right: Tenant, Audio, Role & Auth Controls */}
          <div className="flex items-center gap-2">
            {/* Audio Speech Indicator */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 rounded-lg animate-pulse"
                title="Stop Audio Narration"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Speaking</span>
              </button>
            )}

            {/* Bookmarks Counter Button */}
            <button
              onClick={onOpenBookmarks}
              className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
              title="Saved Bookmarks & Highlights"
            >
              <Bookmark className="w-4 h-4" />
              {bookmarks.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {bookmarks.length}
                </span>
              )}
            </button>

            {/* Multi-Tenant School Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSchoolMenu(!showSchoolMenu)}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg"
                title="Switch School Tenant"
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span className="max-w-[120px] truncate">{currentSchool.name.split(',')[0]}</span>
              </button>

              {showSchoolMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    SaaS Multi-Tenancy (School ID)
                  </div>
                  {schools.map((sch) => (
                    <button
                      key={sch.id}
                      onClick={() => {
                        switchSchool(sch.id);
                        setShowSchoolMenu(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs hover:bg-slate-50 flex items-start gap-2.5 transition-colors ${
                        currentSchool.id === sch.id ? 'bg-indigo-50/70 text-indigo-900 font-medium' : 'text-slate-700'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold">{sch.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {sch.city}, {sch.state} • {sch.board}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200 rounded-lg capitalize transition-colors"
                title="Switch Role View"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span>{currentRole}</span>
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Role-Based Access (RBAC)
                  </div>
                  {roles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchRole(r.role);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs hover:bg-slate-50 flex items-center gap-2.5 transition-colors ${
                        currentRole === r.role ? 'bg-indigo-50 text-indigo-900 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span className="p-1 rounded-md bg-slate-100 text-slate-700">{r.icon}</span>
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Google Firebase Auth */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                    {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                  </div>
                )}
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
                title="Sign in with Google via Firebase Auth"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Google Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Realtime Firebase Sync Badge */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 flex items-center justify-between border-t border-slate-800">
        <div className="flex items-center gap-2">
          <Database className="w-3 h-3 text-emerald-400" />
          <span>
            Firestore Connected: <strong className="text-white">ai-studio-scriptscan</strong>
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
        </div>
        <div className="text-slate-400 hidden md:block">
          Tenant: <span className="text-white font-medium">{currentSchool.name}</span> ({currentSchool.code})
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">User:</span>
          <span className="text-white font-medium">{userProfile?.displayName || 'Guest User'}</span>
          <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-mono text-[10px] uppercase">
            {currentRole}
          </span>
        </div>
      </div>
    </header>
  );
};
