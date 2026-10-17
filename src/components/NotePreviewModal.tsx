import React, { useState } from 'react';
import {
  X,
  Download,
  Bookmark,
  ThumbsUp,
  CheckCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Sparkles,
  BookOpen,
  Share2,
  Code2,
  Cpu,
  Layers,
  Printer,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Building2,
  Bot,
  Send,
  HelpCircle,
  Copy,
  Check,
  Brain,
  Zap
} from 'lucide-react';
import { Note } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../context/NotesContext';
import { INITIAL_NOTES } from '../data/seedNotes';
import { downloadNotePDF, printNoteToPDF } from '../utils/pdfGenerator';
import { askAIDoubt, DoubtType } from '../services/aiDoubtService';

interface NotePreviewModalProps {
  note: Note | null;
  onClose: () => void;
  onOpenAIDoubt?: (context: {
    subject?: string;
    branch?: string;
    noteTitle?: string;
    noteSnippet?: string;
    initialQuestion?: string;
  }) => void;
  onNavigateToQuiz?: (subject: string, branch: string) => void;
  onNavigateToShortNotes?: (subject: string, branch: string) => void;
}

export const NotePreviewModal: React.FC<NotePreviewModalProps> = ({
  note,
  onClose,
  onOpenAIDoubt,
  onNavigateToQuiz,
  onNavigateToShortNotes
}) => {
  const { user, isBookmarkSaved, toggleUserBookmark } = useAuth();
  const { toggleUpvote, recordDownload, deleteNote } = useNotes();

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<'reader' | 'summary' | 'verification' | 'ai-doubt'>('reader');
  const [readingLayout, setReadingLayout] = useState<'continuous' | 'single'>('continuous');
  const [viewerMode, setViewerMode] = useState<'structured' | 'original'>(
    note?.fileDataUrl ? 'original' : 'structured'
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'done'>('idle');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // In-reader AI tutor state
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiMode, setAiMode] = useState<DoubtType>('concept');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnswers, setAiAnswers] = useState<Array<{ q: string; a: string; time: string; mode: string }>>([]);
  const [copiedAnswerIdx, setCopiedAnswerIdx] = useState<number | null>(null);

  if (!note) return null;

  const canDeleteNote =
    note.isUserUploaded === true ||
    !INITIAL_NOTES.some((inNote) => inNote.id === note.id) ||
    (user && (user.uploadedNoteIds.includes(note.id) || note.author.id === user.id));

  const handleDeleteThisNote = () => {
    deleteNote(note.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const isSaved = isBookmarkSaved(note.id);
  const isUpvoted = user?.upvotedNoteIds.includes(note.id) || false;

  const pages =
    note.previewPages && note.previewPages.length > 0
      ? note.previewPages
      : [
          {
            pageNumber: 1,
            title: `${note.title} - Main Notes`,
            content: note.description || 'Full lecture notes and university solved papers.',
            keyPoints: [
              'Complete unit coverage and conceptual derivations',
              'Past year university exam questions',
              'Tips for scoring maximum marks in numerical problems'
            ]
          }
        ];

  const handleAskInReaderAI = async (customQ?: string) => {
    const q = (customQ || aiQuestion).trim();
    if (!q || aiLoading) return;

    setAiLoading(true);
    const newEntry = {
      q,
      a: '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: aiMode
    };

    setAiAnswers((prev) => [...prev, newEntry]);
    setAiQuestion('');

    try {
      const pageSnippets = pages
        .slice(0, 3)
        .map((p) => `Page ${p.pageNumber}: ${p.title}\n${p.content}\n${p.formula || ''}`)
        .join('\n---\n');

      const ans = await askAIDoubt({
        question: q,
        doubtType: aiMode,
        branch: note.branch,
        subject: note.subject,
        semester: note.semester,
        contextNoteTitle: note.title,
        contextSnippet: pageSnippets,
      });

      setAiAnswers((prev) =>
        prev.map((item, idx) => (idx === prev.length - 1 ? { ...item, a: ans } : item))
      );
    } catch (err: any) {
      setAiAnswers((prev) =>
        prev.map((item, idx) =>
          idx === prev.length - 1
            ? { ...item, a: `⚠️ Error solving doubt: ${err.message || 'Please check your connection and GEMINI_API_KEY.'}` }
            : item
        )
      );
    } finally {
      setAiLoading(false);
    }
  };

  const currentPage = pages[currentPageIndex] || pages[0];

  const handleDownload = async () => {
    setDownloadState('downloading');
    setDownloadNotice('Generating PDF file directly in your browser...');
    recordDownload(note.id);
    const res = await downloadNotePDF(note);
    if (res.success) {
      setDownloadState('done');
      setDownloadNotice('✓ PDF download started successfully! Check your browser downloads.');
      setTimeout(() => {
        setDownloadState('idle');
        setDownloadNotice(null);
      }, 5000);
    } else {
      setDownloadState('idle');
      setDownloadNotice('Download blocked by iframe. Click "Print / Save as PDF" below.');
    }
  };

  const handlePrint = () => {
    recordDownload(note.id);
    printNoteToPDF(note);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Top Header Bar */}
        <div className="p-4 sm:px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {note.branch} • Sem {note.semester}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {note.category}
              </span>
              {note.isVerified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  Verified Document
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 truncate mt-1">
              {note.title}
            </h2>
          </div>

          {/* Action buttons on header */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (onOpenAIDoubt) {
                  onOpenAIDoubt({
                    subject: note.subject,
                    branch: note.branch,
                    noteTitle: note.title,
                    noteSnippet: `Subject: ${note.subject}\nBranch: ${note.branch}\nDescription: ${note.description}`,
                    initialQuestion: `Can you explain the main concepts and university exam questions for ${note.title}?`
                  });
                } else {
                  setActiveTab('ai-doubt');
                }
              }}
              title="Ask AI Engineering Doubt Solver"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/40 hover:to-indigo-600/40 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Bot className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Ask AI Tutor</span>
            </button>

            {onNavigateToQuiz && (
              <button
                onClick={() => onNavigateToQuiz(note.subject, note.branch)}
                title="Practice Semester MCQs for this Subject"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-950/70 hover:bg-sky-900/80 text-sky-300 hover:text-white border border-sky-500/40 text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Brain className="w-4 h-4 text-sky-400" />
                <span className="hidden md:inline">Take Quiz</span>
              </button>
            )}

            {onNavigateToShortNotes && (
              <button
                onClick={() => onNavigateToShortNotes(note.subject, note.branch)}
                title="View Formula Sheet & Short Notes"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-950/50 hover:bg-amber-900/70 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">Short Notes</span>
              </button>
            )}

            <button
              onClick={handleShare}
              title="Copy Note Link"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => toggleUserBookmark(note.id)}
              title={isSaved ? 'Remove bookmark' : 'Bookmark note'}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={handlePrint}
              title="Print or Save as PDF (Works offline in all browsers)"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={downloadState === 'downloading'}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-all cursor-pointer ${
                downloadState === 'done'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : downloadState === 'downloading'
                  ? 'bg-sky-600 opacity-80 cursor-wait'
                  : 'bg-sky-500 hover:bg-sky-400'
              }`}
            >
              {downloadState === 'downloading' ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Preparing PDF...</span>
                </>
              ) : downloadState === 'done' ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            {canDeleteNote && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete this uploaded note"
                className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition-colors cursor-pointer"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Download notification banner if active */}
        {downloadNotice && (
          <div className="bg-sky-950/90 border-b border-sky-800/60 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-sky-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{downloadNotice}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="underline font-semibold hover:text-white cursor-pointer"
              >
                Printer / Save as PDF
              </button>
              <button
                onClick={() => setDownloadNotice(null)}
                className="text-sky-400 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Sub-bar: Navigation Tabs & Zoom controls */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4 text-xs shrink-0 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('reader')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                activeTab === 'reader'
                  ? 'bg-slate-800 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Document Reader ({pages.length} Pages)
            </button>

            <button
              onClick={() => setActiveTab('ai-doubt')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ai-doubt'
                  ? 'bg-purple-950/70 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/20'
                  : 'text-slate-400 hover:text-purple-300'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Doubt Solver</span>
            </button>

            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'summary'
                  ? 'bg-slate-800 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Exam Summary & Formulas</span>
            </button>

            <button
              onClick={() => setActiveTab('verification')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'verification'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Syllabus Verification</span>
            </button>
          </div>

          {activeTab === 'reader' && (
            <div className="hidden sm:flex items-center gap-3 text-slate-400">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                <button
                  onClick={() => setReadingLayout('continuous')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                    readingLayout === 'continuous'
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All {pages.length} Pages
                </button>
                <button
                  onClick={() => setReadingLayout('single')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                    readingLayout === 'single'
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Single Page
                </button>
              </div>

              <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setZoomLevel(Math.max(80, zoomLevel - 15))}
                  className="p-1 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono px-1">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(Math.min(140, zoomLevel + 15))}
                  className="p-1 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {readingLayout === 'single' && (
                <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                  <button
                    disabled={currentPageIndex === 0}
                    onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                    className="p-1 disabled:opacity-30 hover:text-white cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-semibold px-1">
                    {currentPageIndex + 1} / {pages.length}
                  </span>
                  <button
                    disabled={currentPageIndex === pages.length - 1}
                    onClick={() =>
                      setCurrentPageIndex((prev) => Math.min(pages.length - 1, prev + 1))
                    }
                    className="p-1 disabled:opacity-30 hover:text-white cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/70">
          {copiedLink && (
            <div className="mb-4 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold text-center animate-in fade-in">
              Link copied to clipboard! You can share this study material with classmates.
            </div>
          )}

          {/* READER TAB */}
          {activeTab === 'reader' && (
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Quick Jump Bar across all pages */}
              {pages.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                  <span className="text-[11px] text-slate-400 font-bold shrink-0 mr-1">
                    Jump to Module:
                  </span>
                  {pages.map((p, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => {
                        setCurrentPageIndex(pIdx);
                        const el = document.getElementById(`doc-page-${pIdx}`);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                        currentPageIndex === pIdx
                          ? 'bg-sky-500 text-white border-sky-400'
                          : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800'
                      }`}
                    >
                      P.{p.pageNumber || pIdx + 1}: {p.title.split(':')[0]}
                    </button>
                  ))}
                </div>
              )}

              {note.fileDataUrl && (
                <div className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs">
                  <span className="text-slate-300 font-semibold pl-2">
                    Original Document Attached: <strong className="text-sky-400">{note.fileName}</strong>
                  </span>
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setViewerMode('original')}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                        viewerMode === 'original'
                          ? 'bg-sky-500 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Original PDF
                    </button>
                    <button
                      onClick={() => setViewerMode('structured')}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                        viewerMode === 'structured'
                          ? 'bg-sky-500 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All Notes View
                    </button>
                  </div>
                </div>
              )}

              {viewerMode === 'original' && note.fileDataUrl ? (
                <div className="w-full h-[620px] rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
                  <iframe
                    src={note.fileDataUrl}
                    className="w-full h-full rounded-3xl"
                    title={note.title}
                  />
                </div>
              ) : readingLayout === 'continuous' ? (
                /* Continuous All Pages View: Shows EVERY SINGLE PAGE */
                <div
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                  className="space-y-6 transition-transform"
                >
                  {pages.map((p, idx) => (
                    <div
                      key={idx}
                      id={`doc-page-${idx}`}
                      className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6"
                    >
                      {/* Page Header */}
                      <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs text-slate-400">
                        <span className="font-mono uppercase tracking-wider text-sky-400 font-bold">
                          {note.subject} • Module {idx + 1}
                        </span>
                        <span className="font-bold text-slate-300">
                          Page {p.pageNumber || idx + 1} of {pages.length}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                        {p.title}
                      </h3>

                      {/* Content */}
                      <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-normal space-y-4">
                        {p.content}
                      </div>

                      {/* Formula */}
                      {p.formula && (
                        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 space-y-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                            Governing Formula / Theorem:
                          </span>
                          <div className="font-mono text-sm sm:text-base font-semibold text-sky-200">
                            {p.formula}
                          </div>
                        </div>
                      )}

                      {/* Code Snippet */}
                      {p.codeSnippet && (
                        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 overflow-x-auto">
                          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 pb-2 border-b border-slate-800">
                            <Code2 className="w-3.5 h-3.5 text-sky-400" />
                            <span>Code Implementation</span>
                          </div>
                          <pre className="text-xs text-emerald-300 font-mono leading-relaxed">
                            {p.codeSnippet}
                          </pre>
                        </div>
                      )}

                      {/* Key Points */}
                      {p.keyPoints && p.keyPoints.length > 0 && (
                        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            High-Yield Exam Takeaways:
                          </span>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            {p.keyPoints.map((pt, pIdx) => (
                              <li key={pIdx} className="flex items-start gap-2">
                                <span className="text-amber-400 mt-0.5">•</span>
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
                        <span>EngiNotes Academic Repository • {note.branch}</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              if (onOpenAIDoubt) {
                                onOpenAIDoubt({
                                  subject: note.subject,
                                  branch: note.branch,
                                  noteTitle: `${note.title} (Page ${idx + 1}: ${p.title})`,
                                  noteSnippet: `Topic: ${p.title}\n\nContent:\n${p.content}${p.formula ? `\nFormula: ${p.formula}` : ''}${p.codeSnippet ? `\nCode: ${p.codeSnippet}` : ''}`,
                                  initialQuestion: `Explain the key concepts and formulas in "${p.title}" with a practical engineering example.`
                                });
                              } else {
                                setActiveTab('ai-doubt');
                                setAiQuestion(`Can you explain the concepts on Page ${idx + 1} (${p.title})?`);
                              }
                            }}
                            className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                          >
                            <Bot className="w-3.5 h-3.5" />
                            <span>Ask AI about Page {idx + 1}</span>
                          </button>
                          <span>Page {idx + 1} of {pages.length}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Single Page View */
                <div
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 transition-transform"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs text-slate-400">
                    <span className="font-mono uppercase tracking-wider text-sky-400 font-bold">
                      {note.subject} • Module {currentPageIndex + 1}
                    </span>
                    <span>
                      Page {currentPage.pageNumber || currentPageIndex + 1} of {pages.length}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                    {currentPage.title}
                  </h3>

                  <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-normal space-y-4">
                    {currentPage.content}
                  </div>

                  {currentPage.formula && (
                    <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                        Governing Formula:
                      </span>
                      <div className="font-mono text-sm sm:text-base font-semibold text-sky-200">
                        {currentPage.formula}
                      </div>
                    </div>
                  )}

                  {currentPage.codeSnippet && (
                    <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 overflow-x-auto">
                      <pre className="text-xs text-emerald-300 font-mono leading-relaxed">
                        {currentPage.codeSnippet}
                      </pre>
                    </div>
                  )}

                  {currentPage.keyPoints && currentPage.keyPoints.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        High-Yield Exam Takeaways:
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {currentPage.keyPoints.map((pt, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2">
                            <span className="text-amber-400">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
                    <span>EngiNotes Academic Repository • {note.branch}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (onOpenAIDoubt) {
                            onOpenAIDoubt({
                              subject: note.subject,
                              branch: note.branch,
                              noteTitle: `${note.title} (Page ${currentPageIndex + 1}: ${currentPage.title})`,
                              noteSnippet: `Topic: ${currentPage.title}\n\nContent:\n${currentPage.content}${currentPage.formula ? `\nFormula: ${currentPage.formula}` : ''}${currentPage.codeSnippet ? `\nCode: ${currentPage.codeSnippet}` : ''}`,
                              initialQuestion: `Explain the key concepts and formulas in "${currentPage.title}" with a practical engineering example.`
                            });
                          } else {
                            setActiveTab('ai-doubt');
                            setAiQuestion(`Can you explain the concepts on Page ${currentPageIndex + 1} (${currentPage.title})?`);
                          }
                        }}
                        className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Ask AI about Page {currentPageIndex + 1}</span>
                      </button>
                      <span>Page {currentPageIndex + 1} of {pages.length}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile pagination controls */}
              <div className="flex sm:hidden items-center justify-between p-3 bg-slate-900 rounded-2xl border border-slate-800 text-xs">
                <button
                  disabled={currentPageIndex === 0}
                  onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 disabled:opacity-40 font-semibold"
                >
                  Previous
                </button>
                <span>
                  Page {currentPageIndex + 1} of {pages.length}
                </span>
                <button
                  disabled={currentPageIndex === pages.length - 1}
                  onClick={() =>
                    setCurrentPageIndex((prev) => Math.min(pages.length - 1, prev + 1))
                  }
                  className="px-3 py-1.5 rounded-lg bg-slate-800 disabled:opacity-40 font-semibold"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* SUMMARY TAB */}
          {activeTab === 'summary' && (
            <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Exam Preparation Highlights</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Synthesized review of the high-probability exam concepts covered in this set.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Document Overview
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {note.description}
                </p>
              </div>

              {/* Units covered */}
              {note.syllabusUnitsCovered && note.syllabusUnitsCovered.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Syllabus Units Covered
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {note.syllabusUnitsCovered.map((u, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{u}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Download prompt */}
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-100">
                    Save the entire {note.pages}-page document
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    File size: {note.fileSize} • Clean PDF format
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer"
                >
                  Download Now
                </button>
              </div>
            </div>
          )}

          {/* ACADEMIC VERIFICATION & SYLLABUS TAB */}
          {activeTab === 'verification' && (
            <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Academic Integrity & Syllabus Verification
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Official curriculum alignment and quality assurance details.
                  </p>
                </div>
              </div>

              {/* Source attribution card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Institutional Source & Department
                </span>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{note.author.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{note.author.college}</p>
                    <span className="inline-block mt-1 text-[11px] font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                      {note.author.role || 'Verified Coursepack'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quality Checklist */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Verification Standards Met
                </span>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <strong className="text-slate-200">Curriculum Aligned:</strong>{' '}
                      <span className="text-slate-400">
                        Matches {note.syllabusPattern || 'AICTE & University Model Syllabus'} for {note.branch} Semester {note.semester}.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <strong className="text-slate-200">Mathematical & Theoretical Rigor:</strong>{' '}
                      <span className="text-slate-400">
                        Contains step-by-step derivations, standard notation, and solved problems.
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <strong className="text-slate-200">Open Educational Access:</strong>{' '}
                      <span className="text-slate-400">
                        Free for non-commercial student learning, exam preparation, and classroom revision.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-lg font-bold text-white">{note.pages}</div>
                  <span className="text-[10px] text-slate-400">Document Pages</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-lg font-bold text-sky-400">{note.downloads}</div>
                  <span className="text-[10px] text-slate-400">Student Accesses</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-lg font-bold text-emerald-400">{note.upvotes}</div>
                  <span className="text-[10px] text-slate-400">Helpful Endorsements</span>
                </div>
              </div>
            </div>
          )}

          {/* AI DOUBT SOLVER TAB */}
          {activeTab === 'ai-doubt' && (
            <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-150">
              {/* Top Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-sky-900/30 border border-purple-500/30 shadow-xl flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <span>EngiBot AI Tutor</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Context: {note.title}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Ask any question about this study material, derivations, code, or exam questions.
                    </p>
                  </div>
                </div>

                {onOpenAIDoubt && (
                  <button
                    onClick={() => {
                      onOpenAIDoubt({
                        subject: note.subject,
                        branch: note.branch,
                        noteTitle: note.title,
                        noteSnippet: `Document: ${note.title}\nSubject: ${note.subject}\nBranch: ${note.branch}\nDescription: ${note.description}`,
                        initialQuestion: aiQuestion || `Explain the core engineering concepts in ${note.title}.`
                      });
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Open Fullscreen Doubt Solver</span>
                  </button>
                )}
              </div>

              {/* Mode Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider shrink-0 mr-1">
                  Resolution Mode:
                </span>
                {(
                  [
                    { id: 'concept', label: '💡 Concept' },
                    { id: 'numerical', label: '📐 Derivation' },
                    { id: 'exam', label: '📝 Exam 10-Marker' },
                    { id: 'code', label: '💻 Code / Algo' },
                    { id: 'quick', label: '⚡ Flash Revision' }
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setAiMode(m.id)}
                    className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                      aiMode === m.id
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Suggested Questions for this note */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                  Quick Doubts from this Note:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    `Explain the fundamental principle behind ${note.subject} in this note`,
                    `Provide a step-by-step mathematical derivation of the key formula`,
                    `What are the most frequent 10-mark exam questions from this unit?`,
                    `Explain common exam pitfalls and student mistakes in this topic`
                  ].map((sq, i) => (
                    <button
                      key={i}
                      disabled={aiLoading}
                      onClick={() => handleAskInReaderAI(sq)}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 text-left text-xs text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-between gap-2 disabled:opacity-50"
                    >
                      <span className="line-clamp-2">{sq}</span>
                      <span className="text-purple-400 text-sm font-bold shrink-0">→</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Doubt Answer Cards */}
              <div className="space-y-4 pt-2">
                {aiAnswers.length === 0 && !aiLoading && (
                  <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                    <Bot className="w-8 h-8 text-purple-400/60 mx-auto" />
                    <p className="text-sm font-semibold text-slate-300">
                      No doubts asked yet on this document.
                    </p>
                    <p className="text-xs text-slate-500">
                      Click any suggested doubt question above or type your doubt below.
                    </p>
                  </div>
                )}

                {aiAnswers.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg"
                  >
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800 text-xs">
                      <span className="font-bold text-purple-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        Q: {item.q}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">{item.time}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-semibold">
                          {item.mode}
                        </span>
                      </div>
                    </div>

                    {item.a ? (
                      <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-normal">
                        {item.a}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-purple-400 py-3">
                        <Bot className="w-4 h-4 animate-spin" />
                        <span>EngiBot is analyzing the note and generating the answer...</span>
                      </div>
                    )}

                    {item.a && (
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end text-xs">
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(item.a);
                            setCopiedAnswerIdx(idx);
                            setTimeout(() => setCopiedAnswerIdx(null), 2000);
                          }}
                          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedAnswerIdx === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Solution</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {aiLoading && (
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3 animate-pulse">
                    <Bot className="w-5 h-5 text-purple-400 animate-spin" />
                    <span className="text-xs text-purple-300 font-semibold">
                      EngiBot is generating your solution...
                    </span>
                  </div>
                )}
              </div>

              {/* Input for in-modal AI */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAskInReaderAI();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder={`Ask a doubt about ${note.title}...`}
                    className="flex-1 bg-slate-950 text-xs sm:text-sm text-slate-200 placeholder-slate-500 px-3.5 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={!aiQuestion.trim() || aiLoading}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs disabled:opacity-40 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ask</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar: Author info & Upvote */}
        <div className="p-4 sm:px-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4 shrink-0 text-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-sky-400 flex items-center justify-center font-bold shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-200 truncate">{note.author.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{note.author.college}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleUpvote(note.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                isUpvoted
                  ? 'bg-sky-500/20 border-sky-500/40 text-sky-400 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-sky-400' : ''}`} />
              <span>{note.upvotes} Upvotes</span>
            </button>
          </div>
        </div>

        {/* Modal: Confirm Delete Note */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 border border-rose-700/60 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-white">
                Delete This Note?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to delete <strong>"{note.title}"</strong>?
                The document and files will be permanently erased.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteThisNote}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/30 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Note</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
