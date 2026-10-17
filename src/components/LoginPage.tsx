import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Building,
  KeyRound,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Award,
  BookMarked,
  Layers,
  HelpCircle,
  FolderGit2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SectionType } from '../types';

interface LoginPageProps {
  onNavigate: (section: SectionType) => void;
  initialMode?: 'signin' | 'signup' | 'forgot';
  isFullWidth?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigate,
  initialMode = 'signin'
}) => {
  const {
    user,
    isAuthenticated,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    loginDemoStudent,
    logout,
    rememberedEmail,
    setRememberedEmail
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);

  // Sign In form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);

  // Register form fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regCollege, setRegCollege] = useState('');
  const [regBranch, setRegBranch] = useState('CSE');
  const [regSemester, setRegSemester] = useState<number>(4);
  const [regRollNumber, setRegRollNumber] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Reset password form fields
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load remembered email on mount
  useEffect(() => {
    if (rememberedEmail && !email) {
      setEmail(rememberedEmail);
      setResetEmail(rememberedEmail);
    }
  }, [rememberedEmail]);

  // Sync mode with prop changes
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  // Reset feedback on mode change
  const handleModeChange = (newMode: 'signin' | 'signup' | 'forgot') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Check caps lock
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState('CapsLock')) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  // Sign In handler
  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please provide a valid email format (e.g. name@college.edu).');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithEmail(cleanEmail, password);
      if (res.success) {
        if (rememberMe) {
          setRememberedEmail(cleanEmail);
        }
        setSuccessMessage(`Welcome back, ${res.user?.name || 'Student'}! Opening Engineering Branches...`);
        setTimeout(() => {
          onNavigate('branches');
        }, 500);
      } else {
        setErrorMessage(res.message || 'Incorrect email or password. Please try again.');
      }
    } catch {
      setErrorMessage('An unexpected network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim();

    if (!cleanName) {
      setErrorMessage('Please enter your full student name.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please provide a valid student or college email address.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your confirm password.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerWithEmail({
        name: cleanName,
        email: cleanEmail,
        password: regPassword,
        college: regCollege.trim() || 'Engineering Institute of Technology',
        branch: regBranch,
        semester: Number(regSemester),
        rollNumber: regRollNumber.trim() || undefined
      });

      if (res.success) {
        setSuccessMessage('Student account created successfully! Opening Engineering Branches...');
        if (rememberMe) {
          setRememberedEmail(cleanEmail);
        }
        setTimeout(() => {
          onNavigate('branches');
        }, 500);
      } else {
        setErrorMessage(res.message || 'Failed to create student account.');
      }
    } catch {
      setErrorMessage('Failed to register account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset Password handler
  const handleResetPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = resetEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid registered email address.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(cleanEmail, newPassword);
      if (res.success) {
        setSuccessMessage('Password reset successfully! You can now sign in with your new password.');
        setEmail(cleanEmail);
        setPassword(newPassword);
        setTimeout(() => {
          setMode('signin');
          setSuccessMessage('Password updated! Click "Sign In to Student Account" to continue.');
        }, 1200);
      } else {
        setErrorMessage(res.message || 'Could not reset password for this email.');
      }
    } catch {
      setErrorMessage('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill pre-seeded student
  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
    setSuccessMessage(`Loaded ${demoEmail}. Click "Sign In" to proceed.`);
  };

  // Direct 1-click test student login and redirect to branches
  const handleQuickLoginAndProceed = async (demoEmail: string, demoPass: string, studentName?: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await loginWithEmail(demoEmail, demoPass);
      if (res.success) {
        setSuccessMessage(`Welcome ${studentName || res.user?.name || 'Student'}! Opening Engineering Branches...`);
        setTimeout(() => {
          onNavigate('branches');
        }, 400);
      } else {
        handleQuickFill(demoEmail, demoPass);
      }
    } catch {
      handleQuickFill(demoEmail, demoPass);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-center">
      {/* Top Breadcrumb & Return to Hub */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => onNavigate('branches')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-sky-400 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm group"
        >
          <FolderGit2 className="w-4 h-4 text-sky-400" />
          <span>Explore Engineering Branches Directly</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Encrypted Student Portal Auth</span>
        </div>
      </div>

      {/* Main Grid: Info/Benefits on Left, Auth Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Brand, Benefits, & Quick Demo Fill */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full">
                  EngiStudy Hub Portal
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Student Account Login
                </h1>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Sign in with your email and password to access verified semester notes, participate in MCQ quizzes, download formula sheets, and track your engineering academic progress.
            </p>

            {/* Feature Perks */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Instant Semester Short Notes</h4>
                  <p className="text-[11px] text-slate-400">High-yield unit summaries, bullet points, and mnemonics for rapid exam prep.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Interactive MCQ Quiz Arena</h4>
                  <p className="text-[11px] text-slate-400">Semester-wise questions with deep step-by-step explanations and score tracking.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Earn Karma & Reputation Points</h4>
                  <p className="text-[11px] text-slate-400">Upload your own handwritten notes, bookmark favorites, and unlock badges.</p>
                </div>
              </div>
            </div>

            {/* Quick Demo Student Credentials */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>1-Click Test Student Accounts</span>
                </h3>
                <span className="text-[10px] text-emerald-400 font-semibold">1-Click to Branches</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLoginAndProceed('student@nitk.edu', 'password123', 'Rahul')}
                  className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-500/50 text-left transition-all group cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-200 group-hover:text-sky-400 flex items-center justify-between">
                    <span>Rahul Sharma</span>
                    <span className="text-[10px] text-sky-400 font-mono">NITK • CSE</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">student@nitk.edu</p>
                  <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    <span>Login & View Branches</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLoginAndProceed('topper@iitb.ac.in', 'password123', 'Ananya')}
                  className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 flex items-center justify-between">
                    <span>Ananya Sen</span>
                    <span className="text-[10px] text-emerald-400 font-mono">IIT Bombay</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">topper@iitb.ac.in</p>
                  <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    <span>Login & View Branches</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLoginAndProceed('arjun@dtu.ac.in', 'password123', 'Arjun')}
                  className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 text-left transition-all group cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 flex items-center justify-between">
                    <span>Arjun Verma</span>
                    <span className="text-[10px] text-indigo-400 font-mono">DTU • MECH</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">arjun@dtu.ac.in</p>
                  <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    <span>Login & View Branches</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLoginAndProceed('sneha@vtu.ac.in', 'password123', 'Sneha')}
                  className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/50 text-left transition-all group cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-200 group-hover:text-purple-400 flex items-center justify-between">
                    <span>Sneha Hegde</span>
                    <span className="text-[10px] text-purple-400 font-mono">VTU • ECE</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">sneha@vtu.ac.in</p>
                  <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    <span>Login & View Branches</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: The Dedicated Login / Register Card */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            {/* If user is ALREADY authenticated */}
            {isAuthenticated && user ? (
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Currently Signed In
                  </span>
                  <h2 className="text-2xl font-black text-white mt-3">{user.name}</h2>
                  <p className="text-sm text-slate-400 mt-1">{user.email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 max-w-md mx-auto text-left space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">College:</span>
                    <span className="font-semibold text-slate-200">{user.college}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Branch & Semester:</span>
                    <span className="font-semibold text-sky-400">{user.branch} • Semester {user.semester}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Reputation Karma:</span>
                    <span className="font-bold text-amber-400">{user.reputationPoints} Points</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => onNavigate('branches')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FolderGit2 className="w-4 h-4" />
                    <span>Explore Engineering Branches</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onNavigate('home')}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span>Home Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setErrorMessage(null);
                      setSuccessMessage('Logged out. You can now log in with another account.');
                    }}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 font-semibold text-sm transition-all cursor-pointer"
                  >
                    Switch Account / Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* 1-Click Instant Demo Login Banner */}
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Quick Demo Access</p>
                      <p className="text-[11px] text-slate-400">1-click login and jump straight to engineering branches</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      loginDemoStudent('nitk');
                      setSuccessMessage('Logged in as Rahul Sharma (NITK)! Opening Engineering Branches...');
                      setTimeout(() => {
                        onNavigate('branches');
                      }, 400);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <span>Instant Demo & View Branches</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Auth Mode Tabs */}
                <div className="flex rounded-2xl bg-slate-950 p-1.5 border border-slate-800 mb-6">
                  <button
                    type="button"
                    onClick={() => handleModeChange('signin')}
                    className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      mode === 'signin'
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange('signup')}
                    className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      mode === 'signup'
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Create Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange('forgot')}
                    className={`py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      mode === 'forgot'
                        ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Feedback Alerts */}
                {errorMessage && (
                  <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400 text-xs sm:text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {successMessage && (
                  <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-400 text-xs sm:text-sm animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">{successMessage}</p>
                    </div>
                  </div>
                )}

                {/* TAB 1: SIGN IN FORM */}
                {mode === 'signin' && (
                  <form onSubmit={handleSignIn} className="space-y-5">
                    {/* Email Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-sky-400" />
                          Student Email Address
                        </span>
                        <span className="text-[11px] font-normal text-slate-500">Personal or college email</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. rahul@college.edu or name@gmail.com"
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                        />
                        {email && (
                          <div className="absolute right-3 top-3.5 text-xs text-sky-400 font-mono">
                            ✓
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-sky-400" />
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => handleModeChange('forgot')}
                          className="text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Enter your student password"
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-11 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {capsLockActive && (
                        <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Caps Lock is ON
                        </p>
                      )}
                    </div>

                    {/* Remember me and helper tip */}
                    <div className="flex items-center justify-between text-xs">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-sky-500/20"
                        />
                        <span>Remember my email on this browser</span>
                      </label>
                      <span className="text-slate-500 hidden sm:inline">256-bit secure session</span>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-sky-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <span>Sign In to Student Account</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Quick Demo Helper */}
                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span>Don't have an account yet?</span>
                      <button
                        type="button"
                        onClick={() => handleModeChange('signup')}
                        className="font-bold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                      >
                        Create Free Student Account →
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 2: REGISTER / CREATE ACCOUNT FORM */}
                {mode === 'signup' && (
                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-sky-400" />
                        Full Student Name
                      </label>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Narendra Meshram"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-sky-400" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="student@college.edu or name@gmail.com"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
                      />
                    </div>

                    {/* College & University */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-sky-400" />
                        College / University Name
                      </label>
                      <input
                        type="text"
                        value={regCollege}
                        onChange={(e) => setRegCollege(e.target.value)}
                        placeholder="e.g. National Institute of Technology (NIT) / SPPU"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
                      />
                    </div>

                    {/* Branch & Semester in 2 Columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                          Branch
                        </label>
                        <select
                          value={regBranch}
                          onChange={(e) => setRegBranch(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                        >
                          <option value="CSE">Computer Science (CSE)</option>
                          <option value="ECE">Electronics (ECE)</option>
                          <option value="MECH">Mechanical Engg (MECH)</option>
                          <option value="CIVIL">Civil Engg (CIVIL)</option>
                          <option value="EEE">Electrical Engg (EEE)</option>
                          <option value="AIDS">AI & Data Science (AIDS)</option>
                          <option value="IT">Information Tech (IT)</option>
                          <option value="CHEMICAL">Chemical Engg (CHEM)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                          Current Semester
                        </label>
                        <select
                          value={regSemester}
                          onChange={(e) => setRegSemester(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                        >
                          <option value={1}>Semester 1 (First Year)</option>
                          <option value={2}>Semester 2 (First Year)</option>
                          <option value={3}>Semester 3 (Second Year)</option>
                          <option value={4}>Semester 4 (Second Year)</option>
                          <option value={5}>Semester 5 (Third Year)</option>
                          <option value={6}>Semester 6 (Third Year)</option>
                          <option value={7}>Semester 7 (Final Year)</option>
                          <option value={8}>Semester 8 (Final Year)</option>
                        </select>
                      </div>
                    </div>

                    {/* Password & Confirm Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span>Password</span>
                          <span className="text-[10px] text-slate-500">Min 6 chars</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Choose password"
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span>Confirm Password</span>
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="text-[10px] text-sky-400 hover:underline cursor-pointer"
                          >
                            {showRegPassword ? 'Hide' : 'Show'}
                          </button>
                        </label>
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Re-type password"
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                        />
                      </div>
                    </div>

                    {/* Submit Register */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 mt-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <span>Create Student Account & Get +50 Karma</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>Already registered?</span>
                      <button
                        type="button"
                        onClick={() => handleModeChange('signin')}
                        className="font-bold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                      >
                        Sign In with Email & Password →
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 3: FORGOT / RESET PASSWORD */}
                {mode === 'forgot' && (
                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <KeyRound className="w-4 h-4 text-amber-400" />
                        <h3 className="text-sm font-bold text-slate-200">Reset Student Password</h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        Enter your registered student email address and choose a new password. Your account credentials will be updated immediately.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Registered Email
                      </label>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="e.g. student@nitk.edu"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                          New Password
                        </label>
                        <input
                          type={showResetPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span>Confirm</span>
                          <button
                            type="button"
                            onClick={() => setShowResetPassword(!showResetPassword)}
                            className="text-[10px] text-sky-400 cursor-pointer hover:underline"
                          >
                            {showResetPassword ? 'Hide' : 'Show'}
                          </button>
                        </label>
                        <input
                          type={showResetPassword ? 'text' : 'password'}
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Confirm new password"
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>Update Password & Return to Login</span>
                        </>
                      )}
                    </button>

                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleModeChange('signin')}
                        className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      >
                        ← Cancel and Back to Sign In
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* Bottom Security Info */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Persistent local credential storage
              </span>
              <span>100% Free for Engineering Students</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
