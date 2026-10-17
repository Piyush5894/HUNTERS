import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Sparkles,
  Trophy,
  Flame,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Lightbulb,
  Scissors,
  Bot,
  Zap,
  Target,
  GraduationCap,
  Award,
  ChevronRight,
  Filter
} from 'lucide-react';
import { QuizQuestion, QuizResult, SectionType } from '../types';
import { SEED_QUIZ_QUESTIONS } from '../data/seedQuizQuestions';
import { BRANCHES_DATA } from '../data/branchesData';
import { generateQuizFromAI } from '../services/aiDoubtService';

interface QuizSectionProps {
  onNavigate: (section: SectionType) => void;
  onOpenAIDoubt: (context?: {
    subject?: string;
    branch?: string;
    noteTitle?: string;
    noteSnippet?: string;
    initialQuestion?: string;
  }) => void;
  initialSubject?: string;
  initialBranch?: string;
  isFullWidth?: boolean;
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  onNavigate,
  onOpenAIDoubt,
  initialSubject,
  initialBranch,
  isFullWidth
}) => {
  // Setup State
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'result'>('lobby');
  const [selectedBranch, setSelectedBranch] = useState<string>(initialBranch || 'ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || 'ALL');
  const [quizLength, setQuizLength] = useState<5 | 10>(5);
  const [enableTimer, setEnableTimer] = useState<boolean>(true);
  const [isLoadingAIQuestions, setIsLoadingAIQuestions] = useState<boolean>(false);
  const [customTopic, setCustomTopic] = useState<string>('');

  // Active Quiz State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  // Lifelines
  const [usedFiftyFifty, setUsedFiftyFifty] = useState<boolean>(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Results History
  const [userAnswers, setUserAnswers] = useState<
    Array<{
      question: QuizQuestion;
      selectedIndex: number;
      isCorrect: boolean;
      timeTaken: number;
    }>
  >([]);
  const [startTime, setStartTime] = useState<number>(0);

  // Available subjects based on branch
  const availableSubjects = React.useMemo(() => {
    if (selectedBranch === 'ALL') {
      const set = new Set<string>();
      SEED_QUIZ_QUESTIONS.forEach((q) => set.add(q.subject));
      return Array.from(set);
    }
    const branchInfo = BRANCHES_DATA.find((b) => b.code === selectedBranch);
    if (!branchInfo) return [];
    return branchInfo.popularSubjects;
  }, [selectedBranch]);

  // Start the Quiz
  const handleStartQuiz = async (useAI = false) => {
    setIsLoadingAIQuestions(true);

    try {
      let pool: QuizQuestion[] = [];

      if (useAI && selectedSubject !== 'ALL') {
        const aiQs = await generateQuizFromAI(
          selectedSubject,
          selectedBranch === 'ALL' ? 'Engineering' : selectedBranch,
          customTopic || selectedSubject,
          quizLength
        );
        if (aiQs && aiQs.length > 0) {
          pool = aiQs;
        }
      }

      if (pool.length === 0) {
        // Filter from seed question bank
        pool = SEED_QUIZ_QUESTIONS.filter((q) => {
          const matchBranch = selectedBranch === 'ALL' || q.branch === selectedBranch;
          const matchSub = selectedSubject === 'ALL' || q.subject === selectedSubject;
          return matchBranch && matchSub;
        });

        // If pool is too small, fallback to all questions
        if (pool.length === 0) {
          pool = SEED_QUIZ_QUESTIONS;
        }

        // Shuffle
        pool = [...pool].sort(() => Math.random() - 0.5);
      }

      const activeQuestions = pool.slice(0, quizLength);
      setQuestions(activeQuestions);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setScore(0);
      setStreak(0);
      setMaxStreak(0);
      setUserAnswers([]);
      setUsedFiftyFifty(false);
      setEliminatedOptions([]);
      setShowHint(false);
      setTimeLeft(30);
      setStartTime(Date.now());
      setGameState('playing');
      setTimerRunning(true);
    } finally {
      setIsLoadingAIQuestions(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing' || !enableTimer || !timerRunning) return;

    if (timeLeft <= 0) {
      // Auto-submit unanswered
      handleOptionSelect(-1);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, enableTimer, timerRunning, timeLeft]);

  // Handle Option Selection
  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswerSubmitted) return;

    const currentQ = questions[currentIndex];
    const isCorrect = optionIndex === currentQ.correctIndex;

    setSelectedOption(optionIndex);
    setIsAnswerSubmitted(true);
    setTimerRunning(false);

    // Score & Streak calculation
    if (isCorrect) {
      const streakBonus = streak * 2;
      const speedBonus = timeLeft > 20 ? 5 : timeLeft > 10 ? 2 : 0;
      const pointsEarned = 10 + streakBonus + speedBonus;

      setScore((prev) => prev + pointsEarned);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
    } else {
      setStreak(0);
    }

    // Save record
    setUserAnswers((prev) => [
      ...prev,
      {
        question: currentQ,
        selectedIndex: optionIndex,
        isCorrect,
        timeTaken: 30 - timeLeft
      }
    ]);
  };

  // Next Question or Finish
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setEliminatedOptions([]);
      setShowHint(false);
      setTimeLeft(30);
      setTimerRunning(true);
    } else {
      setGameState('result');
    }
  };

  // 50-50 Lifeline
  const handleUseFiftyFifty = () => {
    if (usedFiftyFifty || isAnswerSubmitted) return;

    const currentQ = questions[currentIndex];
    const incorrectIndices = [0, 1, 2, 3].filter((idx) => idx !== currentQ.correctIndex);
    // Pick 2 random incorrect to eliminate
    const shuffled = incorrectIndices.sort(() => Math.random() - 0.5);
    setEliminatedOptions([shuffled[0], shuffled[1]]);
    setUsedFiftyFifty(true);
  };

  // Predicted Grade Calculations
  const resultStats = React.useMemo(() => {
    const total = questions.length || 1;
    const correctCount = userAnswers.filter((a) => a.isCorrect).length;
    const accuracy = Math.round((correctCount / total) * 100);

    let predictedGrade = 'A';
    let gradeDescription = 'Good Subject Grasp';
    let gradeColor = 'text-sky-400 border-sky-500/30 bg-sky-500/10';

    if (accuracy >= 90) {
      predictedGrade = 'O (10.0 CGPA)';
      gradeDescription = 'University Topper Rank! Outstanding Mastery.';
      gradeColor = 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    } else if (accuracy >= 80) {
      predictedGrade = 'A+ (9.0+ CGPA)';
      gradeDescription = 'Distinction Level! Excellent Exam Preparation.';
      gradeColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    } else if (accuracy >= 70) {
      predictedGrade = 'A (8.0+ CGPA)';
      gradeDescription = 'First Class with Distinction! Solid Concepts.';
      gradeColor = 'text-sky-400 border-sky-500/40 bg-sky-500/10';
    } else if (accuracy >= 60) {
      predictedGrade = 'B+ (7.0+ CGPA)';
      gradeDescription = 'Clear Pass. Practice short notes formulas to hit 9+.';
      gradeColor = 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10';
    } else {
      predictedGrade = 'Needs Revision';
      gradeDescription = 'Brush up on key formulas and retry to guarantee marks!';
      gradeColor = 'text-rose-400 border-rose-500/40 bg-rose-500/10';
    }

    return {
      total,
      correctCount,
      accuracy,
      predictedGrade,
      gradeDescription,
      gradeColor,
      totalTimeSeconds: Math.round((Date.now() - startTime) / 1000)
    };
  }, [questions, userAnswers, startTime]);

  return (
    <div className={`min-h-[85vh] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 space-y-8 transition-all duration-200 ${isFullWidth ? 'max-w-none' : 'max-w-[1600px] 2xl:max-w-[1720px]'}`}>
      {/* ================= LOBBY / SETUP SCREEN ================= */}
      {gameState === 'lobby' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 shadow-2xl relative overflow-hidden text-center sm:text-left">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Semester Exam MCQ Arena</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                Ace Your <span className="bg-gradient-to-r from-purple-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">Semester Exams</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Test your conceptual understanding and numerical skills with realistic university exam MCQs. Earn streaks, predict your semester CGPA, and learn why common exam traps trip students up!
              </p>
            </div>
          </div>

          {/* Setup Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Target className="w-5 h-5 text-sky-400" />
              <span>Configure Your Exam Simulation</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Branch Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  1. Select Engineering Branch:
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => {
                    setSelectedBranch(e.target.value);
                    setSelectedSubject('ALL');
                  }}
                  className="w-full bg-slate-950 text-slate-200 text-sm px-4 py-3 rounded-2xl border border-slate-800 focus:outline-none focus:border-sky-500 font-semibold cursor-pointer"
                >
                  <option value="ALL">All Branches (Mixed Core Engineering)</option>
                  {BRANCHES_DATA.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  2. Select Subject:
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 text-sm px-4 py-3 rounded-2xl border border-slate-800 focus:outline-none focus:border-sky-500 font-semibold cursor-pointer"
                >
                  <option value="ALL">All High-Yield University Subjects</option>
                  {availableSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quiz Mode & Length */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  3. Quiz Format:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setQuizLength(5)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      quizLength === 5
                        ? 'bg-sky-500/20 border-sky-500/40 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-sm text-sky-400">
                      <Zap className="w-4 h-4" />
                      <span>5 Questions</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Rapid 3-Min Power Sprint
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuizLength(10)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      quizLength === 10
                        ? 'bg-purple-500/20 border-purple-500/40 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-sm text-purple-400">
                      <Trophy className="w-4 h-4" />
                      <span>10 Questions</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Full Semester Midterm Simulation
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  4. Timer Settings:
                </label>
                <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-200">
                        Exam Pressure Timer (30s)
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Simulates university timed exam speed
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnableTimer(!enableTimer)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer border ${
                      enableTimer
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {enableTimer ? '✓ Enabled' : 'Off (Relaxed)'}
                  </button>
                </div>
              </div>
            </div>

            {/* AI Custom Unit / Topic Prompt */}
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Optional: Focus on Specific Unit or Exam Topic
                </span>
                <span className="text-[10px] text-purple-400 font-semibold">
                  AI Dynamic Generation
                </span>
              </div>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g. Virtual Memory & Page Replacement, Euler Beam Bending, Carnot Cycle, Master Theorem..."
                className="w-full bg-slate-950 text-xs text-slate-200 px-3.5 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Launch Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => onNavigate('short-notes')}
                className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>Want to revise first? Open Short Notes</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  disabled={isLoadingAIQuestions}
                  onClick={() => handleStartQuiz(false)}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-sky-500/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Brain className="w-4 h-4" />
                  <span>Start Semester Quiz</span>
                </button>

                {customTopic.trim() && (
                  <button
                    disabled={isLoadingAIQuestions}
                    onClick={() => handleStartQuiz(true)}
                    className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate with AI</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ACTIVE PLAYING SCREEN ================= */}
      {gameState === 'playing' && questions.length > 0 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Game Bar: Progress, Score, Streak, Timer, Lifelines */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <span className="text-xs font-extrabold text-slate-400">
                Question <strong className="text-white text-base">{currentIndex + 1}</strong> of {questions.length}
              </span>

              {/* Streak Badge */}
              {streak > 1 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/40 text-xs font-black animate-bounce">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>Streak x{streak}!</span>
                </div>
              )}
            </div>

            {/* Score & Timer */}
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-sky-400">
                Score: <span className="text-white font-mono text-sm">{score}</span> pts
              </div>

              {enableTimer && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
                    timeLeft <= 7
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{timeLeft}s</span>
                </div>
              )}

              {/* Lifeline: 50-50 */}
              <button
                disabled={usedFiftyFifty || isAnswerSubmitted}
                onClick={handleUseFiftyFifty}
                title={usedFiftyFifty ? '50-50 already used in this quiz' : 'Eliminate 2 wrong options'}
                className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  usedFiftyFifty
                    ? 'opacity-30 cursor-not-allowed bg-slate-950 border-slate-800 text-slate-600'
                    : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-amber-400 hover:text-amber-300'
                }`}
              >
                <Scissors className="w-4 h-4" />
                <span className="hidden sm:inline">50:50</span>
              </button>

              {/* Lifeline: Formula Hint */}
              {questions[currentIndex].formulaHint && (
                <button
                  disabled={isAnswerSubmitted}
                  onClick={() => setShowHint(!showHint)}
                  title="Reveal formula hint"
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-purple-400 hover:text-purple-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span className="hidden sm:inline">Hint</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full transition-all duration-300"
              style={{
                width: `${((currentIndex + (isAnswerSubmitted ? 1 : 0)) / questions.length) * 100}%`
              }}
            />
          </div>

          {/* Question Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between gap-3 flex-wrap text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold uppercase text-[10px]">
                  {questions[currentIndex].branch}
                </span>
                <span className="text-slate-400 font-semibold">
                  {questions[currentIndex].subject}
                </span>
                <span>•</span>
                <span className="text-slate-300 font-medium">
                  {questions[currentIndex].topic}
                </span>
              </div>

              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  questions[currentIndex].difficulty === 'Easy'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : questions[currentIndex].difficulty === 'Hard'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {questions[currentIndex].difficulty}
              </span>
            </div>

            {/* Question Text */}
            <h2 className="text-lg sm:text-2xl font-extrabold text-white leading-snug">
              {questions[currentIndex].question}
            </h2>

            {/* Hint Box (if revealed) */}
            {showHint && questions[currentIndex].formulaHint && (
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-xs text-purple-200 flex items-start gap-2 animate-in fade-in">
                <Lightbulb className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-purple-300">Exam Hint / Formula:</strong>{' '}
                  <span>{questions[currentIndex].formulaHint}</span>
                </div>
              </div>
            )}

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {questions[currentIndex].options.map((opt, optIdx) => {
                const isEliminated = eliminatedOptions.includes(optIdx);
                const isCorrect = optIdx === questions[currentIndex].correctIndex;
                const isSelected = selectedOption === optIdx;

                let btnStyle =
                  'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700';

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    btnStyle =
                      'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/10 font-bold';
                  } else if (isSelected) {
                    btnStyle =
                      'bg-rose-500/20 border-rose-500/50 text-rose-300 line-through font-semibold';
                  } else {
                    btnStyle = 'bg-slate-950/40 opacity-40 border-slate-800 text-slate-500';
                  }
                } else if (isEliminated) {
                  btnStyle = 'opacity-20 cursor-not-allowed bg-slate-950 border-slate-900';
                }

                return (
                  <button
                    key={optIdx}
                    disabled={isAnswerSubmitted || isEliminated}
                    onClick={() => handleOptionSelect(optIdx)}
                    className={`p-4 rounded-2xl border text-left text-sm transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isAnswerSubmitted && isCorrect
                          ? 'bg-emerald-500 text-white'
                          : isAnswerSubmitted && isSelected
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="flex-1 leading-snug">{opt}</span>
                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation & Next Action */}
            {isAnswerSubmitted && (
              <div className="mt-6 pt-5 border-t border-slate-800 space-y-4 animate-in fade-in duration-200">
                <div
                  className={`p-4 rounded-2xl border ${
                    selectedOption === questions[currentIndex].correctIndex
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-rose-950/20 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {selectedOption === questions[currentIndex].correctIndex ? (
                      <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Correct Answer! (+10 pts)
                      </span>
                    ) : (
                      <span className="text-xs font-extrabold text-rose-400 flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Incorrect Choice (Exam Trap)
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {questions[currentIndex].explanation}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <button
                    onClick={() =>
                      onOpenAIDoubt({
                        subject: questions[currentIndex].subject,
                        branch: questions[currentIndex].branch,
                        noteTitle: `MCQ: ${questions[currentIndex].question}`,
                        noteSnippet: `Question: ${questions[currentIndex].question}\nOptions: ${questions[currentIndex].options.join(', ')}\nCorrect Answer: ${questions[currentIndex].options[questions[currentIndex].correctIndex]}\nExplanation: ${questions[currentIndex].explanation}`,
                        initialQuestion: `Can you explain why "${questions[currentIndex].options[questions[currentIndex].correctIndex]}" is the correct answer and how to solve similar problems in exam?`
                      })
                    }
                    className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Ask AI why this is correct / clarify</span>
                  </button>

                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2 cursor-pointer ml-auto"
                  >
                    <span>
                      {currentIndex + 1 < questions.length ? 'Next Question' : 'View Exam Results'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= RESULTS SCREEN ================= */}
      {gameState === 'result' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Big Score Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center text-white mx-auto shadow-xl shadow-amber-500/20">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <div
                className={`inline-block px-4 py-1.5 rounded-full border text-xs sm:text-sm font-extrabold uppercase tracking-wider ${resultStats.gradeColor}`}
              >
                {resultStats.predictedGrade}
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white">
                Exam Simulation Complete!
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                {resultStats.gradeDescription}
              </p>
            </div>

            {/* Performance Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-2xl mx-auto pt-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  Final Score
                </span>
                <p className="text-2xl font-black text-sky-400 mt-1">{score} pts</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  Accuracy
                </span>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  {resultStats.accuracy}%
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  Correct / Total
                </span>
                <p className="text-2xl font-black text-white mt-1">
                  {resultStats.correctCount} / {resultStats.total}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  Max Streak
                </span>
                <p className="text-2xl font-black text-amber-400 mt-1">
                  🔥 {maxStreak}
                </p>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex items-center justify-center gap-4 pt-4 flex-wrap">
              <button
                onClick={() => setGameState('lobby')}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-sky-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Another Quiz</span>
              </button>

              <button
                onClick={() => onNavigate('short-notes')}
                className="px-5 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-sky-300 hover:text-white border border-slate-800 text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Review Short Notes & Formulas</span>
              </button>
            </div>
          </div>

          {/* Detailed Question Review List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <BookOpen className="w-5 h-5 text-sky-400" />
              <span>Full Question Review & Exam Solutions</span>
            </h3>

            <div className="space-y-4">
              {userAnswers.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border ${
                    item.isCorrect
                      ? 'bg-slate-950/80 border-emerald-500/30'
                      : 'bg-slate-950/80 border-rose-500/30'
                  } space-y-3`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <span className="font-bold flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold ${
                          item.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-slate-300">
                        {item.question.subject} • {item.question.topic}
                      </span>
                    </span>

                    <span
                      className={`font-semibold ${
                        item.isCorrect ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {item.isCorrect ? '✓ Correct' : '✕ Missed'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white">
                    {item.question.question}
                  </h4>

                  <div className="text-xs space-y-1">
                    <p className="text-slate-400">
                      Your answer:{' '}
                      <strong
                        className={item.isCorrect ? 'text-emerald-400' : 'text-rose-400'}
                      >
                        {item.selectedIndex >= 0
                          ? item.question.options[item.selectedIndex]
                          : 'Timed out (Unanswered)'}
                      </strong>
                    </p>
                    {!item.isCorrect && (
                      <p className="text-slate-400">
                        Correct answer:{' '}
                        <strong className="text-emerald-400">
                          {item.question.options[item.question.correctIndex]}
                        </strong>
                      </p>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-sky-300">Explanation: </strong>
                    {item.question.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
