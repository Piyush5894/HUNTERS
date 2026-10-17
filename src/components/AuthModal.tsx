import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
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
  Zap
} from 'lucide-react';
import { useAuth, PRE_SEEDED_STUDENTS } from '../context/AuthContext';
import { BRANCHES_DATA } from '../data/branchesData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin'
}) => {
  const {
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    loginDemoStudent,
    loginDemoTopper,
    rememberedEmail,
    setRememberedEmail
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign up fields
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [semester, setSemester] = useState(3);

  // Status feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize with remembered email
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
      setSuccessMessage(null);
      if (rememberedEmail && !email) {
        setEmail(rememberedEmail);
        setPassword('password123'); // prefill for demo convenience
      }
    }
  }, [isOpen, initialMode, rememberedEmail]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        setSuccessMessage(res.message || 'Logged in with Google!');
        setTimeout(() => onClose(), 600);
      } else {
        setErrorMessage(res.message || 'Google login failed.');
      }
    } catch {
      setErrorMessage('Google authentication error. Please try email login.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (accIndex: number) => {
    const acc = PRE_SEEDED_STUDENTS[accIndex];
    if (!acc) return;
    setMode('signin');
    setEmail(acc.user.email);
    setPassword(acc.passwordHash);
    setErrorMessage(null);
    setSuccessMessage(`Loaded ${acc.user.name}'s verified credentials!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        if (!email.trim()) {
          setErrorMessage('Please enter your email address.');
          setLoading(false);
          return;
        }
        if (!password.trim()) {
          setErrorMessage('Please enter your password.');
          setLoading(false);
          return;
        }

        const res = await loginWithEmail(email, password);
        if (res.success) {
          if (rememberMe) {
            setRememberedEmail(email.trim());
          }
          setSuccessMessage(res.message || 'Login successful!');
          setTimeout(() => onClose(), 700);
        } else {
          setErrorMessage(res.message || 'Invalid email or password.');
        }
      } else if (mode === 'signup') {
        if (!name.trim()) {
          setErrorMessage('Please enter your full name.');
          setLoading(false);
          return;
        }
        if (!email.trim() || !email.includes('@')) {
          setErrorMessage('Please enter a valid student email address.');
          setLoading(false);
          return;
        }
        if (password.length < 4) {
          setErrorMessage('Password must be at least 4 characters.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMessage('Passwords do not match. Please re-enter.');
          setLoading(false);
          return;
        }

        const res = await registerWithEmail({
          name,
          email,
          password,
          college: college || 'State Engineering College',
          branch,
          semester
        });

        if (res.success) {
          if (rememberMe) {
            setRememberedEmail(email.trim());
          }
          setSuccessMessage(res.message || 'Account created successfully!');
          setTimeout(() => onClose(), 800);
        } else {
          setErrorMessage(res.message || 'Registration failed.');
        }
      } else if (mode === 'forgot') {
        if (!email.trim() || !email.includes('@')) {
          setErrorMessage('Please enter your registered email address.');
          setLoading(false);
          return;
        }
        if (password.length < 4) {
          setErrorMessage('New password must be at least 4 characters.');
          setLoading(false);
          return;
        }

        const res = await resetPassword(email, password);
        if (res.success) {
          setSuccessMessage(res.message || 'Password reset successfully! You can now sign in.');
          setTimeout(() => setMode('signin'), 1200);
        } else {
          setErrorMessage(res.message || 'Could not reset password.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-sky-500/25">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {mode === 'signin' && 'Student Portal Sign In'}
            {mode === 'signup' && 'Create Free Student Account'}
            {mode === 'forgot' && 'Reset Student Password'}
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {mode === 'signin' &&
              'Access university notes, semester quiz leaderboards, and instant AI doubt solutions.'}
            {mode === 'signup' &&
              'Join 35,000+ engineering peers. Earn +120 Karma points instantly on sign-up!'}
            {mode === 'forgot' &&
              'Enter your registered student email and specify your new secure password.'}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In with Email
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Alert feedback */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span className="flex-1 leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="flex-1 font-semibold">{successMessage}</span>
          </div>
        )}

        {/* 1-Click Verified Student Accounts Pill Buttons */}
        {mode === 'signin' && (
          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>1-Click Test Student Accounts</span>
              </span>
              <span className="text-[10px] text-slate-400">PW: password123</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill(0)}
                className="px-2.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-left border border-slate-700 cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 group-hover:text-sky-300">Rahul Sharma</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400">NITK</span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">student@nitk.edu</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill(1)}
                className="px-2.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-left border border-slate-700 cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300">Priya Patel</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">IIT-B</span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate">topper@iitb.ac.in</span>
              </button>
            </div>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Student Full Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Narendra Meshram"
                  className="w-full bg-slate-950 text-xs sm:text-sm text-slate-100 placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-sky-500 focus:outline-none transition-colors"
                />
              </div>

              {/* College / University */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-400" />
                  <span>College / Institute Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. Pune Institute of Computer Technology (SPPU)"
                  className="w-full bg-slate-950 text-xs sm:text-sm text-slate-100 placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-sky-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Branch and Semester Selection */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Branch
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-slate-950 text-xs text-slate-200 px-3 py-2.5 rounded-xl border border-slate-800 focus:border-sky-500 focus:outline-none cursor-pointer"
                  >
                    {BRANCHES_DATA.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name.split(' ')[0]} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Current Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full bg-slate-950 text-xs text-slate-200 px-3 py-2.5 rounded-xl border border-slate-800 focus:border-sky-500 focus:outline-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>Student Email Address</span>
              </span>
              {mode === 'signin' && (
                <span className="text-[10px] text-slate-400 lowercase font-normal">
                  college or personal email
                </span>
              )}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu or your.email@gmail.com"
              className="w-full bg-slate-950 text-xs sm:text-sm text-slate-100 placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-sky-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Password with Eye Toggle */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>{mode === 'forgot' ? 'New Password' : 'Password'}</span>
              </label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[11px] text-sky-400 hover:text-sky-300 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'forgot' ? 'Enter your new password' : 'Enter your secret password'}
                className="w-full bg-slate-950 text-xs sm:text-sm text-slate-100 placeholder-slate-400 pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-800 focus:border-sky-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (for Signup) */}
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Confirm Password</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password to confirm"
                className="w-full bg-slate-950 text-xs sm:text-sm text-slate-100 placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-sky-500 focus:outline-none transition-colors"
              />
            </div>
          )}

          {/* Remember Me and Security notice */}
          {mode === 'signin' && (
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500"
                />
                <span className="text-[11px]">Remember my student email</span>
              </label>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Encrypted Session</span>
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-400 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'signin' && 'Sign In to Student Account'}
                  {mode === 'signup' && 'Create Account & Unlock All Notes (+120 pts)'}
                  {mode === 'forgot' && 'Update & Reset Password'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Google / Quick alternatives divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[11px] text-slate-400 uppercase font-semibold">
            Or quick sign-in
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Google One-Click Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google Student Account</span>
        </button>

        {/* Toggle signin / signup footer */}
        <div className="text-center pt-1 border-t border-slate-800/80">
          {mode === 'signin' ? (
            <p className="text-xs text-slate-400">
              New engineering student?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-sky-400 font-bold hover:underline cursor-pointer"
              >
                Create Account (Free)
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-sky-400 font-bold hover:underline cursor-pointer"
              >
                Sign In with Email & Password
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
