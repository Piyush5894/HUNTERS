import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User as UserIcon,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Code2,
  FileCheck,
  Zap,
  Volume2,
  VolumeX,
  ChevronDown,
  Layers,
  ArrowRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { BRANCHES_DATA } from '../data/branchesData';
import { useAuth } from '../context/AuthContext';
import {
  DoubtType,
  ChatMessage,
  askAIDoubt,
  getSuggestedQuestions
} from '../services/aiDoubtService';

interface AIDoubtSolverModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubject?: string;
  initialBranch?: string;
  initialNoteTitle?: string;
  initialNoteSnippet?: string;
  initialQuestion?: string;
}

const DOUBT_MODES: {
  id: DoubtType;
  label: string;
  icon: React.ReactNode;
  desc: string;
  color: string;
}[] = [
  {
    id: 'concept',
    label: 'Concept',
    icon: <Lightbulb className="w-3.5 h-3.5" />,
    desc: 'Intuitive analogies & fundamental theory',
    color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30'
  },
  {
    id: 'numerical',
    label: 'Derivation & Math',
    icon: <Layers className="w-3.5 h-3.5" />,
    desc: 'Step-by-step proofs, formulas & steps',
    color: 'from-sky-500/20 to-blue-500/20 text-sky-400 border-sky-500/30'
  },
  {
    id: 'code',
    label: 'Code & Algo',
    icon: <Code2 className="w-3.5 h-3.5" />,
    desc: 'C++, Python, Java & complexity analysis',
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'exam',
    label: '10-Mark Exam Answer',
    icon: <FileCheck className="w-3.5 h-3.5" />,
    desc: 'Structured university exam model solution',
    color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30'
  },
  {
    id: 'quick',
    label: 'Quick Revision',
    icon: <Zap className="w-3.5 h-3.5" />,
    desc: 'Bullet summary, key formulas & pitfalls',
    color: 'from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30'
  }
];

// Helper to render markdown content with code blocks & copy buttons
const MarkdownMessage: React.FC<{ content: string }> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard?.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split by code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_\-\+]*)\n([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let blockIndex = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Text before code block
    if (match.index > lastIndex) {
      const textChunk = content.substring(lastIndex, match.index);
      parts.push(
        <div key={`text-${lastIndex}`} className="space-y-2 leading-relaxed">
          {renderFormattedText(textChunk)}
        </div>
      );
    }

    const lang = match[1] || 'code';
    const code = match[2];
    const currentBlock = blockIndex;

    parts.push(
      <div
        key={`code-${match.index}`}
        className="my-3 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner font-mono text-xs"
      >
        <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">
            {lang}
          </span>
          <button
            onClick={() => handleCopyCode(code, currentBlock)}
            className="flex items-center gap-1 text-[11px] hover:text-white transition-colors cursor-pointer"
          >
            {copiedIndex === currentBlock ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-4 overflow-x-auto text-slate-200 leading-normal">
          <code>{code}</code>
        </pre>
      </div>
    );

    blockIndex++;
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const remaining = content.substring(lastIndex);
    parts.push(
      <div key={`text-${lastIndex}`} className="space-y-2 leading-relaxed">
        {renderFormattedText(remaining)}
      </div>
    );
  }

  return <div className="space-y-2 text-sm">{parts}</div>;
};

// Simple formatter for paragraphs, lists, bold text, inline code
function renderFormattedText(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={`br-${lineIdx}`} className="h-1.5" />);
      return;
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4
          key={`h4-${lineIdx}`}
          className="text-sm font-bold text-sky-300 mt-2 mb-1 flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          {renderInlineFormatting(trimmed.replace(/^###\s+/, ''))}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3
          key={`h3-${lineIdx}`}
          className="text-base font-extrabold text-white mt-3 mb-1 border-b border-slate-800 pb-1"
        >
          {renderInlineFormatting(trimmed.replace(/^##\s+/, ''))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h2 key={`h2-${lineIdx}`} className="text-lg font-black text-sky-400 mt-4 mb-2">
          {renderInlineFormatting(trimmed.replace(/^#\s+/, ''))}
        </h2>
      );
      return;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`quote-${lineIdx}`}
          className="pl-3 py-1 my-1 border-l-2 border-sky-500/60 bg-sky-500/5 text-slate-300 italic text-xs rounded-r-lg"
        >
          {renderInlineFormatting(trimmed.replace(/^>\s+/, ''))}
        </blockquote>
      );
      return;
    }

    // Numbered list item
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <div key={`num-${lineIdx}`} className="flex items-start gap-2 text-slate-200 pl-1">
          <span className="text-xs font-bold text-sky-400 shrink-0 w-4">
            {numMatch[1]}.
          </span>
          <div className="flex-1">{renderInlineFormatting(numMatch[2])}</div>
        </div>
      );
      return;
    }

    // Bullet list item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={`bullet-${lineIdx}`} className="flex items-start gap-2 text-slate-200 pl-1">
          <span className="text-sky-400 mt-1.5 text-[8px] shrink-0">●</span>
          <div className="flex-1">
            {renderInlineFormatting(trimmed.replace(/^[-*]\s+/, ''))}
          </div>
        </div>
      );
      return;
    }

    // Regular line
    elements.push(
      <p key={`p-${lineIdx}`} className="text-slate-200">
        {renderInlineFormatting(trimmed)}
      </p>
    );
  });

  return elements;
}

// Inline formatting: **bold**, `code`, *italic*
function renderInlineFormatting(str: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|`.*?`|\*.*?\*)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIdx) {
      parts.push(str.substring(lastIdx, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`b-${match.index}`} className="font-bold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={`c-${match.index}`}
          className="px-1.5 py-0.5 rounded-md bg-slate-800 text-sky-300 font-mono text-[12px] border border-slate-700/60"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={`i-${match.index}`} className="italic text-slate-300">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIdx = match.index + token.length;
  }

  if (lastIdx < str.length) {
    parts.push(str.substring(lastIdx));
  }

  return parts;
}

export const AIDoubtSolverModal: React.FC<AIDoubtSolverModalProps> = ({
  isOpen,
  onClose,
  initialSubject,
  initialBranch,
  initialNoteTitle,
  initialNoteSnippet,
  initialQuestion
}) => {
  const { user } = useAuth();

  const [selectedBranch, setSelectedBranch] = useState<string>(
    initialBranch || 'CSE'
  );
  const [selectedSubject, setSelectedSubject] = useState<string>(
    initialSubject || 'Data Structures & Algorithms'
  );
  const [doubtType, setDoubtType] = useState<DoubtType>('concept');
  const [useContextNote, setUseContextNote] = useState<boolean>(
    Boolean(initialNoteTitle || initialNoteSnippet)
  );

  const [inputQuestion, setInputQuestion] = useState<string>(initialQuestion || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update when initial props change
  useEffect(() => {
    if (initialBranch) setSelectedBranch(initialBranch);
    if (initialSubject) setSelectedSubject(initialSubject);
    if (initialQuestion) setInputQuestion(initialQuestion);
    if (initialNoteTitle || initialNoteSnippet) setUseContextNote(true);
  }, [initialBranch, initialSubject, initialQuestion, initialNoteTitle, initialNoteSnippet]);

  // Load suggested questions when subject changes
  useEffect(() => {
    if (isOpen) {
      getSuggestedQuestions(selectedSubject, selectedBranch).then((qs) => {
        setSuggestedQuestions(qs);
      });
    }
  }, [isOpen, selectedSubject, selectedBranch]);

  // Welcome message if messages empty
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeText = initialNoteTitle
        ? `👋 **Hello! I'm EngiBot, your AI Engineering Doubt Solver.**\n\nI see you're studying **${initialNoteTitle}** (${selectedSubject}).\n\nAsk me any doubt! You can ask for a **step-by-step derivation**, an **intuitive physical concept analogy**, a **university exam model answer (10-marker)**, or **code implementation**.`
        : `👋 **Welcome to EngiBot — AI Engineering Doubt Solver.**\n\nWhat engineering concept or problem can I help you conquer today in **${selectedSubject}**?\n\nChoose your preferred resolution mode above (Conceptual, Derivation, Code, or Exam Format) and type your doubt below!`;

      setMessages([
        {
          id: 'welcome',
          role: 'model',
          content: welcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          doubtType: 'concept',
          contextNoteTitle: initialNoteTitle
        }
      ]);
    }
  }, [isOpen, initialNoteTitle, selectedSubject]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent, customQuestion?: string) => {
    if (e) e.preventDefault();
    const q = (customQuestion || inputQuestion).trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      doubtType,
      contextNoteTitle: useContextNote ? initialNoteTitle : undefined
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content
        }));

      const solution = await askAIDoubt({
        question: q,
        doubtType,
        branch: selectedBranch,
        subject: selectedSubject,
        contextNoteTitle: useContextNote ? initialNoteTitle : undefined,
        contextSnippet: useContextNote ? initialNoteSnippet : undefined,
        conversationHistory: historyPayload
      });

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: solution,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        doubtType,
        contextNoteTitle: useContextNote ? initialNoteTitle : undefined
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `⚠️ **Unable to complete doubt resolution:**\n\n${
          err.message || 'Server error occurred.'
        }\n\n*Tip: If you are testing in dev mode, make sure your GEMINI_API_KEY is configured in the environment.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        doubtType
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: `Chat cleared. Ask me any doubt about **${selectedSubject}**!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        doubtType: 'concept'
      }
    ]);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSpeech = (msgId: string, text: string) => {
    if (!window.speechSynthesis) return;

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown before speaking
    const cleanSpeech = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted for reading.')
      .replace(/[#*`>]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`bg-slate-900 border border-slate-700/80 rounded-3xl w-full flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${
          isExpanded
            ? 'h-[96vh] max-w-6xl'
            : 'h-[88vh] max-w-4xl'
        }`}
      >
        {/* Top Header */}
        <div className="px-4 py-3 sm:px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 shrink-0">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  EngiBot
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-400 border border-sky-500/30">
                    AI Doubt Solver
                  </span>
                </h3>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  • 24/7 University Engineering Tutor
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                <span className="text-sky-400 font-semibold">{selectedBranch}</span>
                <span>•</span>
                <span className="truncate max-w-[200px] sm:max-w-[320px] text-slate-300">
                  {selectedSubject}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Clear Chat */}
            <button
              onClick={handleClearChat}
              title="Clear conversation"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Expand / Minimize */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Restore size' : 'Expand window'}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs transition-colors cursor-pointer hidden md:flex"
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Close */}
            <button
              onClick={() => {
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                onClose();
              }}
              title="Close Doubt Solver"
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 text-xs transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Configuration Bar: Branch & Subject selection & Note Context Pill */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {/* Branch Selector */}
            <select
              value={selectedBranch}
              onChange={(e) => {
                const bCode = e.target.value;
                setSelectedBranch(bCode);
                const bData = BRANCHES_DATA.find((b) => b.code === bCode);
                if (bData && bData.popularSubjects.length > 0) {
                  setSelectedSubject(bData.popularSubjects[0]);
                }
              }}
              className="bg-slate-900 text-slate-200 px-2.5 py-1 rounded-xl border border-slate-800 focus:outline-none focus:border-sky-500 font-semibold cursor-pointer"
            >
              {BRANCHES_DATA.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.code} - {b.name}
                </option>
              ))}
            </select>

            {/* Subject Selector */}
            <input
              type="text"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              placeholder="Engineering Subject..."
              className="bg-slate-900 text-slate-200 px-2.5 py-1 rounded-xl border border-slate-800 focus:outline-none focus:border-sky-500 min-w-[160px] max-w-[240px]"
            />

            {/* Referenced Note Context Toggle */}
            {initialNoteTitle && (
              <button
                onClick={() => setUseContextNote(!useContextNote)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-colors cursor-pointer text-[11px] ${
                  useContextNote
                    ? 'bg-sky-500/15 border-sky-500/30 text-sky-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
                }`}
                title={
                  useContextNote
                    ? 'AI is using current note page content for context'
                    : 'Click to include current note page in AI context'
                }
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">
                  {initialNoteTitle}
                </span>
                <span className="text-[10px] font-bold">
                  {useContextNote ? '✓ ON' : 'OFF'}
                </span>
              </button>
            )}
          </div>

          <span className="text-[11px] text-slate-400 hidden lg:inline">
            Powered by Gemini 3.8 Flash Engine
          </span>
        </div>

        {/* Doubt Resolution Mode Selector */}
        <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 overflow-x-auto flex items-center gap-2 scrollbar-none shrink-0">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-400" />
            Mode:
          </span>
          {DOUBT_MODES.map((mode) => {
            const isSelected = doubtType === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setDoubtType(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected
                    ? `bg-gradient-to-r ${mode.color} shadow-sm shadow-sky-500/10`
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
                title={mode.desc}
              >
                {mode.icon}
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chat Message List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-gradient-to-b from-slate-900/40 via-slate-950 to-slate-950">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSpeaking = speakingMessageId === msg.id;
            const isCopied = copiedId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                } animate-in fade-in duration-150`}
              >
                {/* Avatar */}
                <div className="shrink-0 pt-0.5">
                  {isUser ? (
                    user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="User"
                        className="w-8 h-8 rounded-full object-cover border border-sky-500/40"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                        {user?.name ? user.name.charAt(0) : <UserIcon className="w-4 h-4" />}
                      </div>
                    )
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-purple-600 flex items-center justify-center text-white text-xs shadow-md shadow-sky-500/20">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Message Content Bubble */}
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 shadow-lg relative ${
                    isUser
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-none'
                  }`}
                >
                  {/* Top metadata info inside bubble */}
                  <div className="flex items-center justify-between gap-2 mb-2 pb-1 border-b border-white/10 text-[11px] opacity-80">
                    <span className="font-bold flex items-center gap-1.5">
                      {isUser ? 'You' : 'EngiBot AI Tutor'}
                      {msg.doubtType && !isUser && (
                        <span className="capitalize text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-semibold">
                          {msg.doubtType} mode
                        </span>
                      )}
                    </span>
                    <span className="text-[10px]">{msg.timestamp}</span>
                  </div>

                  {/* Body Text */}
                  {isUser ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  ) : (
                    <MarkdownMessage content={msg.content} />
                  )}

                  {/* Action buttons on bot responses */}
                  {!isUser && msg.id !== 'welcome' && (
                    <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-800 text-slate-400 text-xs">
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
                        title="Copy entire answer"
                      >
                        {isCopied ? (
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

                      {window.speechSynthesis && (
                        <button
                          onClick={() => handleToggleSpeech(msg.id, msg.content)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                            isSpeaking
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-950 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                          title={isSpeaking ? 'Stop speech' : 'Listen to explanation'}
                        >
                          {isSpeaking ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                              <span>Stop Audio</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Quick follow-up prompt chips */}
                      <div className="hidden sm:flex items-center gap-1.5 ml-auto text-[11px]">
                        <span className="text-slate-500">Follow-up:</span>
                        <button
                          onClick={() =>
                            handleSubmit(
                              undefined,
                              'Can you show a solved numerical example with real numbers for this?'
                            )
                          }
                          className="hover:text-sky-400 underline cursor-pointer"
                        >
                          + Numerical
                        </button>
                        <span>•</span>
                        <button
                          onClick={() =>
                            handleSubmit(
                              undefined,
                              'What are common student exam mistakes and pitfalls for this topic?'
                            )
                          }
                          className="hover:text-sky-400 underline cursor-pointer"
                        >
                          + Exam Traps
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 sm:gap-4 flex-row animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-purple-600 flex items-center justify-center text-white text-xs shadow-md shadow-sky-500/20 shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-900/90 border border-slate-800 text-slate-100 rounded-2xl rounded-tl-none p-4 shadow-lg space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                  <p className="text-xs font-semibold text-sky-400">
                    EngiBot is analyzing your engineering doubt...
                  </p>
                </div>
                <div className="h-2 w-48 bg-slate-800 rounded animate-pulse" />
                <div className="h-2 w-64 bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Doubt Prompts Chips */}
        {suggestedQuestions.length > 0 && (
          <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 overflow-x-auto flex items-center gap-2 scrollbar-none shrink-0">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-sky-400" />
              Suggested:
            </span>
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => handleSubmit(undefined, q)}
                className="text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-3 py-1 rounded-full border border-slate-800 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{q}</span>
                <ArrowRight className="w-3 h-3 text-sky-400 shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 shrink-0">
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={`Ask any doubt in ${selectedSubject} (e.g. Derive formula, Explain like I'm 5, Solve numerical, Write code)...`}
              className="w-full bg-slate-900 text-sm text-slate-200 placeholder-slate-500 pl-4 pr-24 py-2.5 rounded-2xl border border-slate-800 focus:outline-none focus:border-sky-500 resize-none font-sans"
            />
            <div className="absolute right-3 flex items-center gap-1.5">
              <button
                type="submit"
                disabled={!inputQuestion.trim() || isLoading}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-md shadow-sky-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Send doubt (Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span>Press <kbd className="px-1 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300">Shift + Enter</kbd> for newline</span>
            <span>Mode: <strong className="text-sky-400 capitalize">{doubtType}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
