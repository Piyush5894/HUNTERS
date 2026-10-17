import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Sparkles,
  Search,
  Filter,
  Layers,
  Copy,
  Check,
  Bot,
  HelpCircle,
  Lightbulb,
  Zap,
  AlertTriangle,
  Bookmark,
  Share2,
  Brain,
  Download,
  PlusCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { ShortNote, SectionType } from '../types';
import { SEED_SHORT_NOTES } from '../data/seedShortNotes';
import { BRANCHES_DATA } from '../data/branchesData';
import { generateShortNotesFromAI } from '../services/aiDoubtService';

interface ShortNotesSectionProps {
  onNavigate: (section: SectionType) => void;
  onOpenAIDoubt: (context?: {
    subject?: string;
    branch?: string;
    noteTitle?: string;
    noteSnippet?: string;
    initialQuestion?: string;
  }) => void;
  onStartQuizWithSubject?: (subject: string, branch: string) => void;
  isFullWidth?: boolean;
}

export const ShortNotesSection: React.FC<ShortNotesSectionProps> = ({
  onNavigate,
  onOpenAIDoubt,
  onStartQuizWithSubject,
  isFullWidth
}) => {
  const [shortNotesList, setShortNotesList] = useState<ShortNote[]>(() => {
    try {
      const saved = localStorage.getItem('enginotes_custom_short_notes');
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...parsed, ...SEED_SHORT_NOTES];
      }
    } catch {
      // ignore
    }
    return SEED_SHORT_NOTES;
  });

  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // AI Generator Modal state
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [genSubject, setGenSubject] = useState('Operating Systems');
  const [genBranch, setGenBranch] = useState('CSE');
  const [genTopic, setGenTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Filtered notes
  const filteredNotes = useMemo(() => {
    return shortNotesList.filter((note) => {
      const matchBranch = selectedBranch === 'ALL' || note.branch === selectedBranch;
      const matchSem = selectedSemester === 'ALL' || note.semester === selectedSemester;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        note.title.toLowerCase().includes(q) ||
        note.subject.toLowerCase().includes(q) ||
        note.unit.toLowerCase().includes(q) ||
        note.quickSummary.toLowerCase().includes(q) ||
        note.tags.some((t) => t.toLowerCase().includes(q));

      return matchBranch && matchSem && matchSearch;
    });
  }, [shortNotesList, selectedBranch, selectedSemester, searchQuery]);

  const handleCopyNote = (note: ShortNote) => {
    const text = `📌 ${note.title} (${note.subject} - ${note.branch} Sem ${note.semester})
${note.unit}

KEY CONCEPTS:
${note.keyConcepts.map((k) => `• ${k}`).join('\n')}

${note.formulas && note.formulas.length > 0 ? `GOVERNING FORMULAS:\n${note.formulas.map((f) => `• ${f}`).join('\n')}\n` : ''}
${note.examPitfalls && note.examPitfalls.length > 0 ? `EXAM TRAPS & PITFALLS:\n${note.examPitfalls.map((p) => `⚠️ ${p}`).join('\n')}\n` : ''}
${note.mnemonic ? `MEMORY TRICK: 💡 ${note.mnemonic}\n` : ''}
EXECUTIVE RECAP:
${note.quickSummary}

Shared via EngiNotes Study Hub`;

    navigator.clipboard?.writeText(text);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateCustomNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTopic.trim() || isGenerating) return;

    setIsGenerating(true);
    setGenError(null);

    try {
      const res = await generateShortNotesFromAI(genSubject, genBranch, genTopic);
      if (res && res.title) {
        const newNote: ShortNote = {
          id: `custom-sn-${Date.now()}`,
          title: res.title,
          subject: genSubject,
          branch: genBranch,
          semester: 4,
          unit: res.unit || 'AI Generated Exam Cheat Sheet',
          keyConcepts: res.keyConcepts || ['High yield engineering principles'],
          formulas: res.formulas || [],
          examPitfalls: res.examPitfalls || [],
          mnemonic: res.mnemonic || '',
          quickSummary: res.quickSummary || res.title,
          tags: ['AI Generated', genSubject, genBranch]
        };

        const updated = [newNote, ...shortNotesList];
        setShortNotesList(updated);
        try {
          const customOnly = updated.filter((n) => n.id.startsWith('custom-sn-'));
          localStorage.setItem('enginotes_custom_short_notes', JSON.stringify(customOnly));
        } catch {
          // ignore storage error
        }

        setShowGeneratorModal(false);
        setGenTopic('');
      } else {
        throw new Error('Could not generate cheat sheet. Please try rephrasing.');
      }
    } catch (err: any) {
      setGenError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`min-h-[85vh] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 space-y-8 transition-all duration-200 ${isFullWidth ? 'max-w-none' : 'max-w-[1600px] 2xl:max-w-[1720px]'}`}>
      {/* Hero Header */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-extrabold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Rapid Revision & Formula Sheets</span>
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              • High-Yield Exam Cram Sheets
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Short Notes & <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">Formulas Hub</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Quick, exam-proven cheat sheets crafted for university midterms, end-sems, and technical vivas. Master governing formulas, mnemonics, and avoid common student traps.
          </p>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button
              onClick={() => setShowGeneratorModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Generate AI Short Notes</span>
            </button>

            <button
              onClick={() => onNavigate('quiz')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 hover:text-sky-300 border border-slate-700/80 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <Brain className="w-4 h-4" />
              <span>Test Knowledge in MCQ Quiz</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts, formulas (e.g. Master Theorem, KCL, Bernoulli, Laplace, Paging)..."
              className="w-full bg-slate-950 text-sm text-slate-200 placeholder-slate-500 pl-10 pr-4 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-sky-500 font-sans"
            />
          </div>

          {/* Branch & Semester Dropdowns */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Branch:</span>
            </div>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-slate-950 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="ALL">All Branches</option>
              {BRANCHES_DATA.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.code} - {b.name}
                </option>
              ))}
            </select>

            <select
              value={selectedSemester}
              onChange={(e) =>
                setSelectedSemester(
                  e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                )
              }
              className="bg-slate-950 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="ALL">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider shrink-0 mr-1">
            Popular Topics:
          </span>
          {[
            'All',
            'Deadlock',
            'Paging',
            'Master Theorem',
            'Dijkstra',
            'Normalization',
            'KCL',
            'Carnot',
            'Beam Bending',
            'Laplace'
          ].map((tag) => {
            const isActive =
              tag === 'All'
                ? !searchQuery
                : searchQuery.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag === 'All' ? '' : tag)}
                className={`px-3 py-1 rounded-full font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  isActive
                    ? 'bg-sky-500 text-white border-sky-400'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Short Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">
            No short notes match your current filter
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search query, or use our AI to generate an instant short note on any engineering topic.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedBranch('ALL');
              setSelectedSemester('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
          {filteredNotes.map((note) => {
            const isCopied = copiedId === note.id;

            return (
              <div
                key={note.id}
                className="bg-slate-900 border border-slate-800/90 hover:border-slate-700 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5 transition-all duration-200 group"
              >
                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
                        {note.branch} • Sem {note.semester}
                      </span>
                      <span className="text-xs font-semibold text-slate-300 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700/60">
                        {note.subject}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyNote(note)}
                      title="Copy complete short note"
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 transition-colors cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Cheat Sheet</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title & Unit */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-sky-300 transition-colors">
                      {note.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">
                      {note.unit}
                    </p>
                  </div>

                  {/* Key Concepts */}
                  <div className="space-y-1.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/70">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      Core Exam Concepts:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-200 leading-relaxed">
                      {note.keyConcepts.map((kc, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-sky-400 font-bold">•</span>
                          <span>{kc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Formulas Section */}
                  {note.formulas && note.formulas.length > 0 && (
                    <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        Governing Equations & Formulas:
                      </span>
                      <div className="space-y-1 font-mono text-xs text-indigo-200 font-semibold">
                        {note.formulas.map((form, i) => (
                          <div
                            key={i}
                            className="p-1.5 bg-slate-950/60 rounded-lg border border-indigo-500/20"
                          >
                            {form}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Exam Pitfalls & Traps */}
                  {note.examPitfalls && note.examPitfalls.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Common Exam Pitfalls & Traps:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {note.examPitfalls.map((ep, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-rose-400 font-bold shrink-0">✕</span>
                            <span>{ep}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Mnemonic / Memory Trick */}
                  {note.mnemonic && (
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-200 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <strong className="text-purple-300">Memory Trick:</strong>{' '}
                        <span>{note.mnemonic}</span>
                      </div>
                    </div>
                  )}

                  {/* Executive Recap */}
                  <p className="text-xs text-slate-400 italic bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    "{note.quickSummary}"
                  </p>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 flex-wrap text-xs">
                  <button
                    onClick={() =>
                      onOpenAIDoubt({
                        subject: note.subject,
                        branch: note.branch,
                        noteTitle: note.title,
                        noteSnippet: `Topic: ${note.title}\nSubject: ${note.subject}\nUnit: ${note.unit}\n\nSummary:\n${note.quickSummary}\n\nFormulas:\n${note.formulas?.join('\n') || ''}`,
                        initialQuestion: `Can you explain the detailed derivation and university numericals for ${note.title}?`
                      })
                    }
                    className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-bold transition-colors cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Ask AI to Expand</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onStartQuizWithSubject) {
                        onStartQuizWithSubject(note.subject, note.branch);
                      } else {
                        onNavigate('quiz');
                      }
                    }}
                    className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-bold transition-colors cursor-pointer"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>Take MCQ Quiz on this</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Generate Short Notes Modal */}
      {showGeneratorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowGeneratorModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  Generate AI Short Notes
                </h3>
                <p className="text-xs text-slate-400">
                  Instant, high-yield cheat sheet customized for your semester exam
                </p>
              </div>
            </div>

            <form onSubmit={handleGenerateCustomNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Engineering Branch:
                </label>
                <select
                  value={genBranch}
                  onChange={(e) => setGenBranch(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-sky-500"
                >
                  {BRANCHES_DATA.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Subject Name:
                </label>
                <input
                  type="text"
                  value={genSubject}
                  onChange={(e) => setGenSubject(e.target.value)}
                  placeholder="e.g. Operating Systems, Thermodynamics, Strength of Materials..."
                  className="w-full bg-slate-950 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Topic / Unit to Summarize:
                </label>
                <input
                  type="text"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="e.g. CPU Scheduling & Gantt Charts, Carnot Engine, Hooke's Law, Maxwell Equations..."
                  className="w-full bg-slate-950 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              {genError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {genError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowGeneratorModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || !genTopic.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-sky-500/20"
                >
                  {isGenerating ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating Cheat Sheet...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Cheat Sheet</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
