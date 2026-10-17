import React from 'react';
import { Bot, Sparkles, MessageSquareQuote } from 'lucide-react';

interface AIFloatingTriggerProps {
  onClick: () => void;
  activeSubject?: string;
}

export const AIFloatingTrigger: React.FC<AIFloatingTriggerProps> = ({
  onClick,
  activeSubject
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 group">
      {/* Tooltip / Hint */}
      <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/95 border border-slate-700/80 text-xs text-slate-200 shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 pointer-events-none">
        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
        <span>
          Got an engineering doubt? <strong className="text-white">Ask EngiBot AI</strong>
        </span>
      </div>

      {/* Floating Button */}
      <button
        onClick={onClick}
        aria-label="Ask AI Doubt Helper"
        className="relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-2xl shadow-sky-500/40 hover:shadow-sky-500/60 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-white/20 select-none"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>
        <span className="hidden sm:inline">Ask AI Doubt Helper</span>
        <span className="sm:hidden">AI Helper</span>
      </button>
    </div>
  );
};
