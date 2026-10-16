import React from 'react';
import { Sparkles, HelpCircle, AlertCircle } from 'lucide-react';

/**
 * ScoreBadge — Accessible, neutral, non-judgmental match score indicator.
 * Displays score out of 100 or "Not enough information" state.
 * Strictly adheres to requirement: "Use neutral, accessible colors for score indicators. Do not label candidates as inherently good or bad."
 */
const ScoreBadge = ({ score, status, confidence, onClick, size = 'md', showDetailsBtn = true }) => {
  const isInsufficient = status === 'insufficient_data' || score === null || score === undefined;
  const numScore = typeof score === 'number' ? Math.round(score) : 0;

  if (isInsufficient) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-300 text-[11px] font-medium"
        title="Not enough information on profile to calculate a reliable match score"
      >
        <HelpCircle className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <span>Not enough info</span>
        {showDetailsBtn && onClick && (
          <button
            type="button"
            onClick={onClick}
            className="ml-1 text-[10px] text-brand-pink underline hover:text-rose-700 font-semibold cursor-pointer"
          >
            Review
          </button>
        )}
      </div>
    );
  }

  // Neutral, accessible styling: subtle slate/navy tones with clean contrast
  return (
    <div className="inline-flex items-center gap-2">
      <div
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={(e) => onClick && (e.key === 'Enter' || e.key === ' ') && onClick()}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
          onClick ? 'cursor-pointer hover:shadow-xs hover:border-neutral-400' : ''
        } ${
          size === 'sm'
            ? 'text-[11px] py-0.5 px-2'
            : size === 'lg'
            ? 'text-sm py-1.5 px-4 font-bold'
            : 'text-xs py-1 px-3'
        } bg-slate-900 text-white border-slate-700`}
        title={`Match Score: ${numScore}/100 based on role requirements. Click for complete transparent breakdown.`}
      >
        <Sparkles className="w-3 h-3 text-pink-400 shrink-0" />
        <span className="font-mono font-bold tracking-tight">{numScore}</span>
        <span className="text-[10px] text-slate-300 font-normal">/ 100 Match</span>
      </div>

      {showDetailsBtn && onClick && (
        <button
          type="button"
          onClick={onClick}
          className="text-[11px] font-semibold text-neutral-500 hover:text-brand-pink transition-colors underline cursor-pointer"
        >
          Breakdown
        </button>
      )}
    </div>
  );
};

export default ScoreBadge;
