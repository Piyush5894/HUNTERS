import React, { useState } from 'react';
import {
  User as UserIcon,
  Bookmark,
  Upload,
  Download,
  Award,
  Settings,
  LogOut,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Trash2,
  Eye,
  CheckCircle,
  Edit3,
  AlertTriangle,
  FileText,
  RotateCcw,
  X
} from 'lucide-react';
import { Note, SectionType } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../context/NotesContext';
import { INITIAL_NOTES } from '../data/seedNotes';
import { NoteCard } from './NoteCard';

interface MyAccountSectionProps {
  onNavigate: (section: SectionType) => void;
  onPreviewNote: (note: Note) => void;
  onOpenAuthModal: () => void;
  isFullWidth?: boolean;
}

export const MyAccountSection: React.FC<MyAccountSectionProps> = ({
  onNavigate,
  onPreviewNote,
  onOpenAuthModal,
  isFullWidth
}) => {
  const { user, isAuthenticated, logout, loginDemoStudent, loginDemoTopper, updateProfile } = useAuth();
  const { notes, deleteNote, deleteAllUploadedNotes, restoreDefaultNotes } = useNotes();

  const [activeTab, setActiveTab] = useState<'saved' | 'uploads' | 'history' | 'settings'>('saved');

  // Deletion modal & feedback states
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Edit profile states
  const [editName, setEditName] = useState(user?.name || '');
  const [editCollege, setEditCollege] = useState(user?.college || '');
  const [editBranch, setEditBranch] = useState(user?.branch || 'CSE');
  const [editSemester, setEditSemester] = useState<number>(user?.semester || 3);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Filter user's saved notes
  const savedNotes = notes.filter((n) => user?.savedNoteIds.includes(n.id));

  // Filter user's uploaded notes (includes any uploaded custom note across sessions)
  const myUploadedNotes = notes.filter(
    (n) =>
      n.isUserUploaded === true ||
      !INITIAL_NOTES.some((inNote) => inNote.id === n.id) ||
      (user && (n.author.id === user.id || user.uploadedNoteIds.includes(n.id)))
  );

  // Filter user's downloaded notes
  const downloadedNotes = notes.filter((n) => user?.downloadedNoteIds.includes(n.id));

  const handleConfirmDeleteSingle = () => {
    if (!noteToDelete) return;
    const title = noteToDelete.title;
    deleteNote(noteToDelete.id);
    setNoteToDelete(null);
    setFeedbackToast(`"${title}" deleted successfully.`);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleConfirmDeleteAll = () => {
    const count = myUploadedNotes.length;
    deleteAllUploadedNotes();
    setShowDeleteAllModal(false);
    setFeedbackToast(`All ${count} uploaded file(s) and documents were deleted.`);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleConfirmReset = () => {
    restoreDefaultNotes();
    setShowResetModal(false);
    setFeedbackToast('Library reset to original standard notes.');
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: editName,
      college: editCollege,
      branch: editBranch,
      semester: editSemester
    });
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  // If not logged in
  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-8">
        <div className="w-20 h-20 rounded-3xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto shadow-xl">
          <GraduationCap className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-3xl font-extrabold text-white">
            Access Your Student Dashboard
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            Log in to manage your bookmarks, track your downloaded notes, upload semester study guides, and earn reputation points.
          </p>
        </div>

        <div className="max-w-md mx-auto p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <button
            onClick={onOpenAuthModal}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Sign In / Create Account</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-400 uppercase font-semibold">
              Or Try One-Click Demo
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => loginDemoStudent('nitk')}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer text-left"
            >
              <span className="block font-bold text-sky-400">Student Portal</span>
              <span className="text-[10px] text-slate-400">NITK CSE (Sem 4)</span>
            </button>
            <button
              onClick={loginDemoTopper}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer text-left"
            >
              <span className="block font-bold text-amber-400">Academic Contributor</span>
              <span className="text-[10px] text-slate-400">IIT Bombay (1250 pts)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* User Profile Card Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-sky-500/50 shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white border-2 border-sky-500/50 shadow-lg">
                  <GraduationCap className="w-8 h-8" />
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-sky-500 text-white shadow">
                <CheckCircle className="w-3.5 h-3.5" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  {user.name}
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 capitalize">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
              <p className="text-xs font-medium text-slate-300 mt-1">
                {user.college} • <span className="text-sky-400">{user.branch} (Sem {user.semester})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => onNavigate('upload')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New Note</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700 transition-colors text-xs font-semibold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* User Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Reputation
            </span>
            <div className="text-xl font-extrabold text-white mt-1">
              {user.reputationPoints} <span className="text-xs text-slate-400 font-normal">pts</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-sky-400" />
              Saved Notes
            </span>
            <div className="text-xl font-extrabold text-white mt-1">
              {user.savedNoteIds.length}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              My Uploads
            </span>
            <div className="text-xl font-extrabold text-white mt-1">
              {myUploadedNotes.length}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Downloads
            </span>
            <div className="text-xl font-extrabold text-white mt-1">
              {user.downloadedNoteIds.length}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'saved'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved Notes ({savedNotes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('uploads')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'uploads'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>My Uploads ({myUploadedNotes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'history'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Downloaded ({downloadedNotes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Profile Settings</span>
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {/* Saved Notes Tab */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            {savedNotes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onPreview={onPreviewNote}
                    variant="grid"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-slate-800 p-8 max-w-md mx-auto">
                <Bookmark className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-200">No saved notes yet</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Click the bookmark icon on any note card to save it for quick revision before exams.
                </p>
                <button
                  onClick={() => onNavigate('browse')}
                  className="mt-4 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Browse Notes
                </button>
              </div>
            )}
          </div>
        )}

        {/* My Uploads Tab */}
        {activeTab === 'uploads' && (
          <div className="space-y-4">
            {/* Header with stats and Delete All Files button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-sky-400" />
                  <span>My Uploaded Notes ({myUploadedNotes.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  All study materials and PDF files you have contributed.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('upload')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload More</span>
                </button>

                {myUploadedNotes.length > 0 && (
                  <button
                    onClick={() => setShowDeleteAllModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 text-xs font-bold transition-all cursor-pointer"
                    title="Permanently delete all your uploaded files"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete All Files ({myUploadedNotes.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Notification Toast if present */}
            {feedbackToast && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{feedbackToast}</span>
                </div>
                <button
                  onClick={() => setFeedbackToast(null)}
                  className="text-emerald-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {myUploadedNotes.length > 0 ? (
              <div className="space-y-3">
                {myUploadedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400">
                          {note.branch} • Sem {note.semester}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {note.category}
                        </span>
                        {note.fileName && (
                          <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded flex items-center gap-1 border border-slate-700/50">
                            <FileText className="w-3 h-3 text-sky-400" />
                            <span className="truncate max-w-[180px]">{note.fileName}</span>
                            <span>({note.fileSize || 'PDF'})</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-slate-100">
                        {note.title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Subject: <span className="text-slate-300 font-medium">{note.subject}</span> • {note.downloads} downloads • {note.upvotes} upvotes
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onPreviewNote(note)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-400" />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => setNoteToDelete(note)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 transition-colors text-xs font-semibold cursor-pointer"
                        title="Delete this note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-slate-800 p-8 max-w-md mx-auto">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-200">No uploaded files in library</h3>
                <p className="text-xs text-slate-400 mt-1">
                  You haven't uploaded any notes yet or all files have been deleted.
                </p>
                <button
                  onClick={() => onNavigate('upload')}
                  className="mt-4 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Upload Your First Note
                </button>
              </div>
            )}
          </div>
        )}

        {/* Downloaded History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {downloadedNotes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {downloadedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onPreview={onPreviewNote}
                    variant="grid"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-slate-800 p-8 max-w-md mx-auto">
                <Download className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-200">No download history</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Notes you download will appear here for fast re-access.
                </p>
                <button
                  onClick={() => onNavigate('browse')}
                  className="mt-4 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Explore Notes
                </button>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-xl bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-400" />
                <span>Update Academic Profile</span>
              </h3>
              {isSavedNotice && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  Profile updated!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 text-sm text-slate-100 px-4 py-2.5 rounded-xl border border-slate-800 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  College / University
                </label>
                <input
                  type="text"
                  value={editCollege}
                  onChange={(e) => setEditCollege(e.target.value)}
                  className="w-full bg-slate-950 text-sm text-slate-100 px-4 py-2.5 rounded-xl border border-slate-800 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Branch
                  </label>
                  <select
                    value={editBranch}
                    onChange={(e) => setEditBranch(e.target.value)}
                    className="w-full bg-slate-950 text-xs text-slate-200 px-3 py-2.5 rounded-xl border border-slate-800 focus:border-sky-500 focus:outline-none cursor-pointer"
                  >
                    {['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT', 'CHEM', 'AERO'].map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Current Semester
                  </label>
                  <select
                    value={editSemester}
                    onChange={(e) => setEditSemester(Number(e.target.value))}
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

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-colors shadow-md cursor-pointer"
              >
                Save Profile Changes
              </button>
            </form>

            {/* Data & Storage Management Card */}
            <div className="pt-6 border-t border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Data & Storage Management</span>
              </h4>
              <p className="text-xs text-slate-400">
                Manage your locally stored study notes, uploaded PDFs, and library cache.
              </p>

              <div className="space-y-3 pt-1">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">
                      Delete All Uploaded Files
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Permanently wipes all {myUploadedNotes.length} uploaded files and attachments from device storage.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteAllModal(true)}
                    disabled={myUploadedNotes.length === 0}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                  >
                    Delete All ({myUploadedNotes.length})
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">
                      Reset Library to Standard Notes
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Restores all standard engineering seed notes to default and resets deleted records.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowResetModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Reset Library
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Single Note Delete Confirmation */}
      {noteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-extrabold text-white">
              Delete This Note?
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong>"{noteToDelete.title}"</strong>?
              {noteToDelete.fileName && (
                <span className="block mt-1 text-slate-400">
                  Attached file: <em>{noteToDelete.fileName}</em>
                </span>
              )}
              This file will be permanently removed from your library.
            </p>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setNoteToDelete(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteSingle}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/30 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Note</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete All Uploaded Files Confirmation */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-rose-700/50 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-extrabold text-white">
              Delete All Uploaded Files?
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete all <strong className="text-rose-400">{myUploadedNotes.length} uploaded files</strong>?
              All attached documents, PDFs, and notes will be permanently erased from your storage. This action cannot be undone.
            </p>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Keep Files
              </button>
              <button
                onClick={handleConfirmDeleteAll}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/30 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete All</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reset Library Confirmation */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center mx-auto">
              <RotateCcw className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-extrabold text-white">
              Reset Notes Library?
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will restore all standard engineering seed notes to default and reset deleted records.
            </p>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Reset Library
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
