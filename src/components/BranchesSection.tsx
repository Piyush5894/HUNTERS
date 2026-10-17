import React, { useState } from 'react';
import {
  BookOpen,
  ArrowRight,
  Layers,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Upload,
  CheckCircle2,
  FileText,
  Search,
  Eye
} from 'lucide-react';
import { BRANCHES_DATA } from '../data/branchesData';
import { Note, SectionType } from '../types';
import { BranchIcon } from './BranchIcon';
import { useNotes } from '../context/NotesContext';
import { getOrCreateNoteForSubject } from '../utils/subjectNotesGenerator';

interface BranchesSectionProps {
  onSelectBranchAndSem: (branchCode: string, sem?: number) => void;
  onSelectSubject: (subject: string) => void;
  onNavigate: (section: SectionType) => void;
  onPreviewNote?: (note: Note) => void;
  isFullWidth?: boolean;
}

export const BranchesSection: React.FC<BranchesSectionProps> = ({
  onSelectBranchAndSem,
  onSelectSubject,
  onNavigate,
  onPreviewNote,
  isFullWidth
}) => {
  const { notes, setSelectedBranch, setSelectedSemester, setSearchQuery } = useNotes();
  const [activeBranchCode, setActiveBranchCode] = useState<string>('CSE');
  const [activeSemester, setActiveSemester] = useState<number>(1);
  const [expandedSubjectCode, setExpandedSubjectCode] = useState<string | null>(null);
  const [semesterSearch, setSemesterSearch] = useState<string>('');

  const selectedBranch =
    BRANCHES_DATA.find((b) => b.code === activeBranchCode) || BRANCHES_DATA[0];

  const currentSemesterData =
    selectedBranch.semesters.find((s) => s.semester === activeSemester) ||
    selectedBranch.semesters[0];

  const handleSubjectRead = (subject: { name: string; semester: number }) => {
    if (onPreviewNote) {
      const generated = getOrCreateNoteForSubject(subject.name, selectedBranch.code, notes, subject.semester);
      onPreviewNote(generated);
    } else {
      setSelectedBranch(activeBranchCode);
      setSelectedSemester(activeSemester);
      setSearchQuery(subject.name);
      onSelectSubject(subject.name);
      onNavigate('browse');
    }
  };

  const handleSubjectBrowse = (subjectName: string) => {
    setSelectedBranch(activeBranchCode);
    setSelectedSemester(activeSemester);
    setSearchQuery(subjectName);
    onSelectSubject(subjectName);
    onNavigate('browse');
  };

  const handleExploreBranchNotes = () => {
    setSelectedBranch(activeBranchCode);
    setSelectedSemester(activeSemester);
    onNavigate('browse');
  };

  const displayedSubjects = currentSemesterData
    ? currentSemesterData.subjects.filter(
        (s) =>
          !semesterSearch.trim() ||
          s.name.toLowerCase().includes(semesterSearch.toLowerCase()) ||
          s.code.toLowerCase().includes(semesterSearch.toLowerCase()) ||
          s.description.toLowerCase().includes(semesterSearch.toLowerCase())
      )
    : [];

  return (
    <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 space-y-8 transition-all duration-200 ${isFullWidth ? 'max-w-none' : 'max-w-[1600px] 2xl:max-w-[1720px]'}`}>
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 mb-1">
          <GraduationCap className="w-4 h-4" />
          <span>Engineering Branches & Syllabi</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          All Engineering Branches & Subject Directory
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Complete 1st to 8th semester syllabi, core engineering courses, credit breakdowns, and verified coursepacks for every branch.
        </p>
      </div>

      {/* Branch Selector Tabs (Top 4 requested first, then rest) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
          <span>Please Select Your Branch:</span>
          <span>9 Engineering Streams Available</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {BRANCHES_DATA.map((branch, idx) => {
            const isActive = branch.code === activeBranchCode;
            const isTop4 = idx < 4;

            return (
              <button
                key={branch.code}
                onClick={() => {
                  setActiveBranchCode(branch.code);
                  const exists = branch.semesters.some((s) => s.semester === activeSemester);
                  if (!exists && branch.semesters.length > 0) {
                    setActiveSemester(branch.semesters[0].semester);
                  }
                }}
                className={`p-3 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-slate-900 border-sky-400 shadow-lg shadow-sky-950/40 ring-1 ring-sky-500'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    <BranchIcon name={branch.iconName} className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1">
                    {isTop4 && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        #{idx + 1}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {branch.code}
                    </span>
                  </div>
                </div>
                <div>
                  <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {branch.name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {branch.semesters.reduce((acc, s) => acc + s.subjects.length, 0)} subjects (Sem 1-8)
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Branch Hero & Stats Details */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Department of {selectedBranch.code}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                4-Year B.Tech / B.E AICTE Model Curriculum
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {selectedBranch.name}
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              {selectedBranch.shortDesc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleExploreBranchNotes}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse All {selectedBranch.code} Notes</span>
            </button>
            <button
              onClick={() => onNavigate('upload')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Notes</span>
            </button>
          </div>
        </div>

        {/* Semester Selector Bar */}
        <div className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Select Semester</span>
            </h3>
            <span className="text-xs text-slate-400">
              Showing courses for <strong>Semester {activeSemester}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {selectedBranch.semesters.map((semGroup) => {
              const isCurrent = activeSemester === semGroup.semester;
              return (
                <button
                  key={semGroup.semester}
                  onClick={() => setActiveSemester(semGroup.semester)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                    isCurrent
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                      : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span>Semester {semGroup.semester}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isCurrent ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {semGroup.subjects.length} subjects
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Semester Subjects Grid & Syllabus Units */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>Curriculum for Semester {activeSemester}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {currentSemesterData ? currentSemesterData.subjects.length : 0} Core Subjects
            </span>
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={semesterSearch}
              onChange={(e) => setSemesterSearch(e.target.value)}
              placeholder="Filter subjects..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 pl-8 pr-3 py-2 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {displayedSubjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 2xl:gap-6">
            {displayedSubjects.map((subj) => {
              const isExpanded = expandedSubjectCode === subj.code;
              return (
                <div
                  key={subj.code}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                          {subj.code}
                        </span>
                        <span className="text-xs text-slate-400">
                          {subj.credits} Credits
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-100">
                        {subj.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleSubjectRead({ name: subj.name, semester: activeSemester })}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Read Notes</span>
                      </button>

                      <button
                        onClick={() => handleSubjectBrowse(subj.name)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors cursor-pointer"
                        title="Browse related notes"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {subj.description}
                  </p>

                  {/* Units Accordion Toggle */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() =>
                        setExpandedSubjectCode(isExpanded ? null : subj.code)
                      }
                      className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 font-medium py-1 cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-sky-400" />
                        <span>Syllabus Units ({subj.units.length} Modules)</span>
                      </span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isExpanded ? 'rotate-90 text-sky-400' : ''
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-sky-500/40 py-1">
                        {subj.units.map((unit, uIdx) => (
                          <div
                            key={uIdx}
                            className="text-xs text-slate-300 flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                            <span>{unit}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
            No subjects found for Semester {activeSemester} matching your search filter.
          </div>
        )}
      </div>

      {/* Curriculum Guidelines */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <h3 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Engineering Exam Revision Guidelines</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <strong className="text-slate-200 block mb-1">
              • High-Yield Question Strategy:
            </strong>
            Focus on standard derivations in Unit 1 and Unit 2. Review handwritten formula sheets before solving past 5-year university exam question papers.
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <strong className="text-slate-200 block mb-1">
              • Complete 8-Semester Syllabi Aligned:
            </strong>
            All subjects are aligned with AICTE and State Technical University frameworks, ensuring comprehensive preparation from First Year to Final Year Capstone.
          </div>
        </div>
      </div>
    </div>
  );
};
