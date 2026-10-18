import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  Info,
  Calendar,
  MapPin,
  Languages,
  Award,
  Video,
  FileText,
  User,
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Avatar from '../common/Avatar';

const CRITERION_ICONS = {
  skills: Award,
  portfolio: Video,
  experience: Calendar,
  language: Languages,
  availability: Calendar,
  location: MapPin,
};

const ScoreBreakdownModal = ({
  isOpen,
  onClose,
  application,
  onRecalculate,
}) => {
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalcSuccess, setRecalcSuccess] = useState(false);

  if (!application) return null;

  const candidate = application.candidate || {};
  const scoreData = application.match_score || {};
  const breakdowns = scoreData.breakdowns || [];
  const totalScore = typeof scoreData.total_score === 'number' ? Math.round(scoreData.total_score) : 0;
  const isInsufficient = scoreData.status === 'insufficient_data';

  const handleTriggerRecalculate = async () => {
    if (!onRecalculate) return;
    setIsRecalculating(true);
    setRecalcSuccess(false);
    try {
      await onRecalculate(application.id);
      setRecalcSuccess(true);
      setTimeout(() => setRecalcSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transparent Role Match Assessment"
      size="xl"
    >
      <div className="space-y-6 text-xs text-left max-h-[82vh] overflow-y-auto pr-1">
        {/* Candidate & Role Header Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <Avatar
              src={candidate.avatar || application.candidateAvatar}
              name={candidate.fullName || application.candidateName}
              size="lg"
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-serif text-white tracking-tight">
                  {candidate.fullName || application.candidateName}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
                  {candidate.experienceLevel || `${candidate.yearsOfExperience || 2}+ Yrs Experience`}
                </span>
              </div>
              <p className="text-[11px] text-neutral-300">
                Applying for: <strong className="text-brand-pink font-semibold">{application.roleAppliedFor}</strong> in {application.opportunityTitle || 'Casting Opportunity'}
              </p>
              <p className="text-[10px] text-neutral-400">
                Location: {candidate.location || 'Not specified'} • Availability: {candidate.availabilityStatus || 'Available'}
              </p>
            </div>
          </div>

          {/* Overall Match Score Badge */}
          <div className="flex flex-col items-end shrink-0 self-stretch sm:self-center justify-center p-3 rounded-xl bg-neutral-800/80 border border-neutral-700 text-right min-w-[140px]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Overall Role Match
            </span>
            {isInsufficient ? (
              <span className="text-xs font-bold text-amber-400 mt-1">Not enough info</span>
            ) : (
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-bold font-mono text-white">{totalScore}</span>
                <span className="text-xs text-neutral-400">/ 100</span>
              </div>
            )}
            <span className="text-[9px] text-neutral-400 mt-0.5">
              Confidence: <strong className="capitalize text-neutral-200">{scoreData.confidence_level || 'High'}</strong>
            </span>
          </div>
        </div>

        {/* Calculation Summary Callout */}
        {scoreData.calculation_summary && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[11px] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-brand-pink shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900">Scoring Engine Breakdown Summary:</span>
              <p className="text-slate-600 font-mono text-[10.5px] leading-relaxed">
                {scoreData.calculation_summary}
              </p>
            </div>
          </div>
        )}

        {/* Criteria Breakdown Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Transparent Evaluation Breakdown (6 Criteria)
            </h3>
            <span className="text-[10px] text-neutral-400">
              Evaluated specifically against requirements for "{application.roleAppliedFor}"
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {breakdowns.map((b, idx) => {
              const IconComp = CRITERION_ICONS[b.criterion_key] || Award;
              const points = Math.round((b.points_awarded || 0) * 10) / 10;
              const max = b.max_points || 10;
              const pct = Math.min(100, Math.round((points / max) * 100));

              return (
                <div
                  key={b.criterion_key || idx}
                  className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 transition-all space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-pink-50 text-brand-pink flex items-center justify-center shrink-0 border border-pink-100">
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 text-xs">
                          {b.criterion_name}
                        </h4>
                        <span className="text-[10px] text-neutral-400">
                          Weight: {max} points maximum
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="w-24 bg-neutral-100 h-2 rounded-full overflow-hidden border border-neutral-200">
                        <div
                          className="bg-neutral-800 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-neutral-900 text-xs min-w-[50px] text-right">
                        {points} <span className="text-neutral-400 font-normal">/ {max}</span>
                      </span>
                    </div>
                  </div>

                  {/* Evidence Used */}
                  <div className="p-2.5 rounded-lg bg-neutral-50/80 border border-neutral-150 space-y-1">
                    <div className="flex items-start gap-1.5 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-neutral-700">
                        <strong className="text-neutral-900 font-semibold">Evidence analyzed: </strong>
                        {b.evidence_used || 'Evaluated against candidate profile information.'}
                      </span>
                    </div>

                    {/* Missing data or uncertainty */}
                    {b.missing_or_uncertainty && (
                      <div className="flex items-start gap-1.5 text-[11px] pt-1 border-t border-neutral-200/60">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-amber-800">
                          <strong className="font-semibold text-amber-900">Information gap: </strong>
                          {b.missing_or_uncertainty}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Missing Fields and Improvement Suggestions */}
        {scoreData.improvement_suggestions && scoreData.improvement_suggestions.length > 0 && (
          <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 space-y-2">
            <h4 className="font-bold text-sky-950 text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Recommended Profile Enhancements for Stronger Match Assessment</span>
            </h4>
            <p className="text-[11px] text-sky-800">
              The following fields would clarify candidate suitability without penalizing for unprovided data:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-sky-900 font-medium pl-1">
              {scoreData.improvement_suggestions.map((sug, i) => (
                <li key={i}>{sug}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Ethical AI & Fairness Guarantee Statement */}
        <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-1.5 text-[10.5px] text-neutral-600">
          <div className="flex items-center gap-1.5 font-bold text-neutral-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Fairness & Transparency Policy</span>
          </div>
          <p>
            StageLink evaluates candidates solely on role requirements: skills, verified work samples, credits, dialogue languages, shooting availability, and travel feasibility.
            Protected attributes (race, ethnicity, religion, disability, gender, age, appearance, or paid membership tiers) are <strong>strictly excluded</strong> from algorithmic scoring.
            Candidates are never automatically rejected by score. Casting directors inspect evidence and make independent audition decisions.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-200">
          <span className="text-[10px] text-neutral-400">
            Calculated: {scoreData.calculated_at ? new Date(scoreData.calculated_at).toLocaleString() : 'Recent'}
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleTriggerRecalculate}
              disabled={isRecalculating}
              className="text-xs space-x-1.5 flex-1 sm:flex-initial"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin text-brand-pink' : ''}`} />
              <span>{isRecalculating ? 'Recalculating...' : 'Recalculate Score'}</span>
            </Button>
            <Button
              onClick={onClose}
              className="text-xs bg-brand-navy hover:bg-neutral-800 text-white flex-1 sm:flex-initial"
            >
              Close Breakdown
            </Button>
          </div>
        </div>

        {recalcSuccess && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-center font-bold text-[11px] animate-in fade-in">
            Score updated successfully based on latest role and candidate profile data.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ScoreBreakdownModal;
