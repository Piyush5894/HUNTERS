import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { NotesProvider, useNotes } from './context/NotesContext';
import { Navbar } from './components/Navbar';
import { HomeSection } from './components/HomeSection';
import { BrowseNotesSection } from './components/BrowseNotesSection';
import { BranchesSection } from './components/BranchesSection';
import { UploadNotesSection } from './components/UploadNotesSection';
import { MyAccountSection } from './components/MyAccountSection';
import { ShortNotesSection } from './components/ShortNotesSection';
import { QuizSection } from './components/QuizSection';
import { NotePreviewModal } from './components/NotePreviewModal';
import { AuthModal } from './components/AuthModal';
import { GitHubExportModal } from './components/GitHubExportModal';
import { AIDoubtSolverModal } from './components/AIDoubtSolverModal';
import { AIFloatingTrigger } from './components/AIFloatingTrigger';
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';
import { Note, SectionType } from './types';

function AppContent() {
  const { notes } = useNotes();
  const [currentSection, setCurrentSection] = useState<SectionType>('login');
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [previewNote, setPreviewNote] = useState<Note | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState<boolean>(() => {
    try {
      return localStorage.getItem('enginotes_fullwidth') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleFullWidth = () => {
    setIsFullWidth((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('enginotes_fullwidth', String(next));
      } catch {}
      return next;
    });
  };

  const handleOpenAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setCurrentSection('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quiz context state
  const [quizContext, setQuizContext] = useState<{ subject?: string; branch?: string }>({});

  // AI Doubt Solver Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalContext, setAiModalContext] = useState<{
    subject?: string;
    branch?: string;
    noteTitle?: string;
    noteSnippet?: string;
    initialQuestion?: string;
  }>({});

  const handleOpenAIDoubt = (context?: {
    subject?: string;
    branch?: string;
    noteTitle?: string;
    noteSnippet?: string;
    initialQuestion?: string;
  }) => {
    if (context) {
      setAiModalContext(context);
    }
    setAiModalOpen(true);
  };

  const handleStartQuizWithSubject = (subject: string, branch: string) => {
    setQuizContext({ subject, branch });
    setCurrentSection('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigation handlers
  const handleNavigate = (section: SectionType) => {
    setCurrentSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSubject = (subject: string) => {
    setSubjectFilter(subject);
    setCurrentSection('browse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBranchAndSem = (branchCode: string, sem?: number) => {
    setCurrentSection('browse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Top sticky Navbar */}
      <Navbar
        currentSection={currentSection}
        onNavigate={handleNavigate}
        onOpenAuthModal={() => handleOpenAuthModal('signin')}
        onOpenGitHubModal={() => setGithubModalOpen(true)}
        onOpenAIDoubt={() => handleOpenAIDoubt()}
        isFullWidth={isFullWidth}
        onToggleFullWidth={handleToggleFullWidth}
      />

      {/* Main Content Area based on 5 Sections */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {currentSection === 'home' && (
          <HomeSection
            notes={notes}
            onNavigate={handleNavigate}
            onSelectSubject={handleSelectSubject}
            onPreviewNote={(note) => setPreviewNote(note)}
            onOpenAIDoubt={handleOpenAIDoubt}
            onOpenAuthModal={handleOpenAuthModal}
            isFullWidth={isFullWidth}
          />
        )}

        {currentSection === 'browse' && (
          <BrowseNotesSection
            notes={notes}
            initialSubjectFilter={subjectFilter}
            onPreviewNote={(note) => setPreviewNote(note)}
            onNavigate={handleNavigate}
            isFullWidth={isFullWidth}
          />
        )}

        {currentSection === 'short-notes' && (
          <ShortNotesSection
            onNavigate={handleNavigate}
            onOpenAIDoubt={handleOpenAIDoubt}
            onStartQuizWithSubject={handleStartQuizWithSubject}
            isFullWidth={isFullWidth}
          />
        )}

        {currentSection === 'quiz' && (
          <QuizSection
            onNavigate={handleNavigate}
            onOpenAIDoubt={handleOpenAIDoubt}
            initialSubject={quizContext.subject}
            initialBranch={quizContext.branch}
            isFullWidth={isFullWidth}
          />
        )}

        {currentSection === 'branches' && (
          <BranchesSection
            onSelectBranchAndSem={handleSelectBranchAndSem}
            onSelectSubject={handleSelectSubject}
            onNavigate={handleNavigate}
            onPreviewNote={(note) => setPreviewNote(note)}
            isFullWidth={isFullWidth}
          />
        )}

        {currentSection === 'upload' && (
          <UploadNotesSection
            onNavigate={handleNavigate}
            onPreviewNote={(note) => setPreviewNote(note)}
            onOpenAuthModal={() => handleOpenAuthModal('signin')}
            isFullWidth={isFullWidth}
          />
        )}

        {currentSection === 'account' && (
          <MyAccountSection
            onNavigate={handleNavigate}
            onPreviewNote={(note) => setPreviewNote(note)}
            onOpenAuthModal={() => handleOpenAuthModal('signin')}
            isFullWidth={isFullWidth}
          />
        )}

        {currentSection === 'login' && (
          <LoginPage
            onNavigate={handleNavigate}
            initialMode={authModalMode === 'signup' ? 'signup' : 'signin'}
            isFullWidth={isFullWidth}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onSelectSubject={handleSelectSubject}
        isFullWidth={isFullWidth}
      />

      {/* Interactive Note Preview Reader Modal */}
      <NotePreviewModal
        note={previewNote}
        onClose={() => setPreviewNote(null)}
        onOpenAIDoubt={handleOpenAIDoubt}
        onNavigateToQuiz={(subject, branch) => {
          setPreviewNote(null);
          handleStartQuizWithSubject(subject, branch);
        }}
        onNavigateToShortNotes={(subject, _branch) => {
          setPreviewNote(null);
          setCurrentSection('short-notes');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Firebase Google Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* GitHub Repository Upload Guide Modal */}
      <GitHubExportModal
        isOpen={githubModalOpen}
        onClose={() => setGithubModalOpen(false)}
      />

      {/* Floating 24/7 AI Doubt Helper Button */}
      <AIFloatingTrigger
        onClick={() => handleOpenAIDoubt()}
        activeSubject={subjectFilter}
      />

      {/* AI Engineering Doubt Solver Modal / Drawer */}
      <AIDoubtSolverModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        initialSubject={aiModalContext.subject || subjectFilter}
        initialBranch={aiModalContext.branch}
        initialNoteTitle={aiModalContext.noteTitle}
        initialNoteSnippet={aiModalContext.noteSnippet}
        initialQuestion={aiModalContext.initialQuestion}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotesProvider>
        <AppContent />
      </NotesProvider>
    </AuthProvider>
  );
}
