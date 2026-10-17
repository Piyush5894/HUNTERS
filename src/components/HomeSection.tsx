import React, { useState } from 'react';
import {
  ChevronRight,
  BookOpen,
  GraduationCap,
  Bot,
  Sparkles,
  Zap,
  Brain,
  Trophy,
  Flame,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight,
  Compass,
  Bookmark,
  AlertCircle
} from 'lucide-react';
import { Note, SectionType } from '../types';
import { BRANCHES_DATA } from '../data/branchesData';
import { BranchIcon } from './BranchIcon';
import { useNotes } from '../context/NotesContext';
import { useAuth } from '../context/AuthContext';

interface HomeSectionProps {
  notes: Note[];
  onNavigate: (section: SectionType) => void;
  onSelectSubject: (subject: string) => void;
  onPreviewNote: (note: Note) => void;
  onOpenAIDoubt?: (context?: {
    subject?: string;
    branch?: string;
    noteTitle?: string;
    noteSnippet?: string;
    initialQuestion?: string;
  }) => void;
  onOpenAuthModal?: (mode?: 'signin' | 'signup') => void;
  isFullWidth?: boolean;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  notes,
  onNavigate,
  onSelectSubject,
  onPreviewNote,
  onOpenAIDoubt,
  onOpenAuthModal,
  isFullWidth
}) => {
  const { setSelectedBranch, setSelectedSemester, setSearchQuery } = useNotes();
  const { user, isAuthenticated, loginWithEmail, logout } = useAuth();

  // Direct branch and semester selection handler
  const handleSelectBranch = (branchCode: string, sem?: number) => {
    setSelectedBranch(branchCode);
    if (sem) {
      setSelectedSemester(sem);
    } else {
      setSelectedSemester(null);
    }
    onNavigate('browse');
  };

  // Quick Home Login form state
  const [quickEmail, setQuickEmail] = useState('student@nitk.edu');
  const [quickPassword, setQuickPassword] = useState('password123');
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);
  const [quickLoginFeedback, setQuickLoginFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Daily Quiz Mini Challenge state
  const [dailySelectedOption, setDailySelectedOption] = useState<number | null>(null);
  const [dailyAnswered, setDailyAnswered] = useState(false);

  // Daily question mock
  const dailyQuestion = {
    question: "In thermodynamics, which equation describes the first law for a closed system undergoing a process?",
    options: [
      "dQ = dU + dW",
      "dQ = dH - VdP",
      "PV = mRT",
      "dS = dQ / T"
    ],
    correctIndex: 0,
    explanation: "The First Law of Thermodynamics expresses energy conservation: Heat added to the system (dQ) equals the change in internal energy (dU) plus work done by the system (dW)."
  };

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickLoginLoading(true);
    setQuickLoginFeedback(null);
    try {
      const res = await loginWithEmail(quickEmail, quickPassword);
      if (res.success) {
        setQuickLoginFeedback({ type: 'success', text: res.message || 'Logged in!' });
      } else {
        setQuickLoginFeedback({ type: 'error', text: res.message || 'Login failed.' });
      }
    } catch {
      setQuickLoginFeedback({ type: 'error', text: 'Network/auth error.' });
    } finally {
      setQuickLoginLoading(false);
    }
  };

  return (
    <div className={`min-h-[85vh] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 space-y-10 transition-all duration-200 ${isFullWidth ? 'max-w-none' : 'max-w-[1600px] 2xl:max-w-[1720px]'}`}>
      {/* ===================== HERO SECTION ===================== */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/50 border border-slate-800 shadow-2xl">
        {/* Glow ambient spots */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 2xl:gap-12">
          <div className="space-y-4 max-w-2xl 2xl:max-w-3xl text-center lg:text-left flex-1 min-w-0">
            {/* Student Exam Readiness Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-bold tracking-wide shadow-sm">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Exam Prep Hub • 35,000+ University Students Scoring 9+ CGPA</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Ace Your Engineering Semesters with{' '}
              <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                Topper Notes & MCQs
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Unit-wise handwritten lecture notes, last-minute formula cram sheets, high-yield semester MCQ quiz practice, and university-curated study resources tailored for your branch.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('branches-grid');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-400 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-500/25 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <Compass className="w-4 h-4" />
                <span>Select Your Branch</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('short-notes')}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/30 hover:border-amber-400/60 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Formula Cram Sheets</span>
              </button>

              <button
                onClick={() => onNavigate('quiz')}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-sky-300 border border-sky-500/30 hover:border-sky-400/60 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <Brain className="w-4 h-4 text-sky-400" />
                <span>Semester Quiz Arena</span>
              </button>

              <button
                onClick={() => onNavigate('login')}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4 text-emerald-200" />
                <span>Student Login (Email & Password)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Quick Student Portal Login or Active Profile Card */}
          <div className="w-full lg:w-96 2xl:w-[420px] shrink-0">
            {isAuthenticated && user ? (
              /* Logged In Student Profile Summary */
              <div className="p-6 rounded-3xl bg-slate-950/80 border border-sky-500/30 shadow-2xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-11 h-11 rounded-2xl object-cover border border-sky-500/40"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg border border-sky-500/40">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-sm font-bold text-white leading-none">{user.name}</h2>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                          Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 truncate max-w-[180px]">
                        {user.college}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => logout()}
                    className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    Logout
                  </button>
                </div>

                {/* Academic Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="block text-xs font-bold text-sky-400">{user.branch}</span>
                    <span className="text-[10px] text-slate-400">Branch</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="block text-xs font-bold text-indigo-400">Sem {user.semester}</span>
                    <span className="text-[10px] text-slate-400">Semester</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="block text-xs font-bold text-amber-400">{user.reputationPoints}</span>
                    <span className="text-[10px] text-slate-400">Karma Pts</span>
                  </div>
                </div>

                {/* Quick actions for student */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => onNavigate('account')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-slate-200 border border-slate-800 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Bookmark className="w-3.5 h-3.5 text-sky-400" />
                      <span>My Bookmarks & Downloads</span>
                    </span>
                    <span className="text-[11px] text-sky-400 font-bold">
                      {user.savedNoteIds?.length || 0} notes
                    </span>
                  </button>

                  <button
                    onClick={() => onNavigate('quiz')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-slate-200 border border-slate-800 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Semester Quiz Practice</span>
                    </span>
                    <span className="text-[11px] text-amber-400 font-bold">9+ CGPA</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Quick Email & Password Student Login Card */
              <div className="p-6 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </span>
                    <div>
                      <h2 className="text-sm font-bold text-white">Student Campus Login</h2>
                      <p className="text-[11px] text-slate-400">Sign in with email & password</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Free
                  </span>
                </div>

                {quickLoginFeedback && (
                  <div
                    className={`text-xs p-2.5 rounded-xl border flex items-center gap-2 ${
                      quickLoginFeedback.type === 'success'
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {quickLoginFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{quickLoginFeedback.text}</span>
                  </div>
                )}

                <form onSubmit={handleQuickLogin} className="space-y-2.5">
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={quickEmail}
                      onChange={(e) => setQuickEmail(e.target.value)}
                      placeholder="student@university.edu"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-400 pl-8 pr-3 py-2.5 focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={quickPassword}
                      onChange={(e) => setQuickPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-400 pl-8 pr-3 py-2.5 focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={quickLoginLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <span>{quickLoginLoading ? 'Signing in...' : 'Sign In with Email'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Quick 1-click test fill */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Quick Test:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setQuickEmail('student@nitk.edu');
                        setQuickPassword('password123');
                      }}
                      className="text-sky-400 hover:underline font-semibold cursor-pointer"
                    >
                      Rahul (NITK)
                    </button>
                    <span className="text-slate-400">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setQuickEmail('topper@iitb.ac.in');
                        setQuickPassword('topper123');
                      }}
                      className="text-amber-400 hover:underline font-semibold cursor-pointer"
                    >
                      Priya (IITB)
                    </button>
                  </div>
                </div>

                <div className="text-center space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 hover:text-sky-300 text-xs font-semibold border border-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Open Full Student Login Page →</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Don't have an account? <span className="text-emerald-400 font-bold underline">Create Free Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================== LIVE METRICS STRIP ===================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-extrabold text-white">14,500+</div>
            <div className="text-xs text-slate-400">Verified Notes & PYQs</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-extrabold text-white">1,200+</div>
            <div className="text-xs text-slate-400">Formula Cram Sheets</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-extrabold text-white">8,400+</div>
            <div className="text-xs text-slate-400">Semester Exam MCQs</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-extrabold text-white">120+</div>
            <div className="text-xs text-slate-400">Universities Covered</div>
          </div>
        </div>
      </div>

      {/* ===================== AI DOUBT SOLVER BANNER ===================== */}
      {onOpenAIDoubt && (
        <div className="rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-purple-950/50 via-indigo-950/40 to-sky-950/40 border border-purple-500/30 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold">
                  <Bot className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  <span>24/7 AI Engineering Tutor (EngiBot)</span>
                </span>
                <span className="text-xs text-slate-400 hidden md:inline">
                  Step-by-step derivations, code & 10-mark exam answers
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                Stuck on a tricky concept or derivation? Ask EngiBot!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Get instant, university-curriculum-ready answers for any engineering subject or past year exam paper.
              </p>
            </div>

            <button
              onClick={() => onOpenAIDoubt()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center gap-2 hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Doubt Solver</span>
            </button>
          </div>

          {/* Quick doubts chips */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-purple-500/20 overflow-x-auto scrollbar-none text-xs">
            <span className="text-purple-300/80 font-bold shrink-0 text-[11px]">
              Try Asking:
            </span>
            {[
              'Derive Euler-Bernoulli beam bending equation',
              'Explain Dijkstra vs Bellman-Ford algorithms',
              'Explain Carnot Cycle with P-V & T-S diagrams',
              'How does Paging and Segmentation work in OS?'
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => onOpenAIDoubt({ initialQuestion: q })}
                className="px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-purple-500/30 whitespace-nowrap text-xs transition-colors cursor-pointer shrink-0"
              >
                {q} →
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===================== INTERACTIVE DAILY CHALLENGE & FEATURE CARDS ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Short Notes Card */}
        <div
          onClick={() => onNavigate('short-notes')}
          className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 hover:border-amber-500/50 shadow-xl transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4 hover:-translate-y-0.5"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                High-Yield Cram
              </span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
              Short Notes & Formula Hub
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Curated revision cards, key equations, and memory mnemonics tailored for last-minute cramming and university exams.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
            <span>Explore Short Notes</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Semester Quiz Arena Card */}
        <div
          onClick={() => onNavigate('quiz')}
          className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/30 border border-slate-800 hover:border-sky-500/50 shadow-xl transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4 hover:-translate-y-0.5"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold">
                <Brain className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
                Predicted CGPA
              </span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
              Semester MCQ Quiz Arena
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Gamified exam practice with timers, streak multipliers, lifelines, and instant explanations to help you score an O-Grade (10 CGPA).
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-sky-400 group-hover:translate-x-1 transition-transform">
            <span>Start Practice Quiz</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Interactive Today's MCQ Widget directly on Home */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-xl flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                <span>Today's Daily MCQ Challenge</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                +20 Karma
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-200 leading-snug">
              {dailyQuestion.question}
            </p>

            {/* Options */}
            <div className="space-y-1.5 pt-1">
              {dailyQuestion.options.map((opt, i) => {
                const isSelected = dailySelectedOption === i;
                const isCorrect = i === dailyQuestion.correctIndex;
                let btnStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700';

                if (dailyAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-300';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-300';
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (!dailyAnswered) {
                        setDailySelectedOption(i);
                        setDailyAnswered(true);
                      }
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${btnStyle}`}
                  >
                    <span className="font-bold mr-2 text-slate-400">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {dailyAnswered && (
              <div className="text-[11px] p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 mt-2">
                <span className="font-bold text-emerald-400">Explanation: </span>
                <span>{dailyQuestion.explanation}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('quiz')}
            className="w-full text-center py-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            Play 500+ More Semester MCQs →
          </button>
        </div>
      </div>

      {/* ===================== CHOOSE YOUR ENGINEERING BRANCH SECTION ===================== */}
      <div id="branches-grid" className="space-y-6 pt-4">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Compass className="w-6 h-6 text-sky-400" />
              <span>Choose Your Engineering Branch</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Select your engineering branch to view semester lecture notes, question banks, and syllabus guides
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedBranch('ALL');
              setSelectedSemester(null);
              onNavigate('browse');
            }}
            className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            <span>Search All Library Notes</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Clean, Simple Grid of Engineering Branches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5">
          {BRANCHES_DATA.map((branch, index) => {
            const sequenceNumber = index + 1;
            const totalSubjects = branch.semesters.reduce((acc, sem) => acc + sem.subjects.length, 0);

            return (
              <div
                key={branch.code}
                className="group p-5 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/50 shadow-lg hover:shadow-sky-950/40 transition-all duration-200 flex flex-col justify-between space-y-4 hover:-translate-y-0.5"
              >
                <div>
                  {/* Top Bar: Icon, Code Badge & Subject Count */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors shrink-0">
                        <BranchIcon name={branch.iconName} className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {branch.code}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
                      #{sequenceNumber} • {totalSubjects} Subjects
                    </span>
                  </div>

                  {/* Branch Title & Description */}
                  <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                    {branch.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {branch.shortDesc}
                  </p>

                  {/* Popular Core Subjects */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {branch.popularSubjects?.slice(0, 3).map((sub, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 truncate max-w-[200px]"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>

                  {/* Quick Semester Jump */}
                  <div className="mt-3.5 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
                      <span>Jump to Semester:</span>
                      <span className="text-[10px] text-sky-400 font-semibold">Sem 1 - 8</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <button
                          key={sem}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectBranch(branch.code, sem);
                          }}
                          className="py-1 rounded-lg bg-slate-950 hover:bg-sky-500 text-slate-300 hover:text-white border border-slate-800 hover:border-sky-500 text-[11px] font-semibold transition-colors cursor-pointer text-center"
                          title={`Open ${branch.name} Semester ${sem} Notes`}
                        >
                          Sem {sem}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Main Action Button */}
                <button
                  onClick={() => handleSelectBranch(branch.code)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-sky-500 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer border border-slate-700 hover:border-sky-500 shadow-sm group-hover:border-sky-500"
                >
                  <span>Browse All {branch.code} Notes</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
