import React from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Calendar,
  Languages,
  MapPin,
  Clock,
  Video,
  FileText,
  AlertCircle,
  Eye,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Award,
} from 'lucide-react';
import Avatar from '../common/Avatar';
import ApplicationStatusBadge from '../applications/ApplicationStatusBadge';
import ScoreBadge from './ScoreBadge';
import { formatDate } from '../../utils/formatters';

const CandidateCard = ({
  application,
  isSelected,
  onToggleSelect,
  onViewScoreBreakdown,
  onViewPortfolio,
  onShortlist,
  onInviteAudition,
  onReject,
}) => {
  if (!application) return null;

  const candidate = application.candidate || {};
  const scoreData = application.match_score || {};
  const breakdowns = scoreData.breakdowns || [];

  // Criterion helpers
  const skillsBreakdown = breakdowns.find(b => b.criterion_key === 'skills' || b.criterionKey === 'skills');
  const portfolioBreakdown = breakdowns.find(b => b.criterion_key === 'portfolio' || b.criterionKey === 'portfolio');
  const expBreakdown = breakdowns.find(b => b.criterion_key === 'experience' || b.criterionKey === 'experience');
  const langBreakdown = breakdowns.find(b => b.criterion_key === 'language' || b.criterionKey === 'language');
  const availBreakdown = breakdowns.find(b => b.criterion_key === 'availability' || b.criterionKey === 'availability');
  const locBreakdown = breakdowns.find(b => b.criterion_key === 'location' || b.criterionKey === 'location');

  const candidateSkills = candidate.skills || [];
  const candidateLanguages = candidate.languages || ['Hindi', 'English'];
  const isShortlisted = application.is_shortlisted;

  const portfolio = candidate.portfolio || candidate.portfolio_data || {};
  const submitted = application.submittedMaterials || application.submitted_materials || {};
  const hasShowreel = Boolean(portfolio.actingReel || portfolio.acting_reel || submitted.videoAudition);
  const hasResume = Boolean(portfolio.resume || submitted.resume);
  const headshotCount = (portfolio.headshots || []).length + (submitted.headshot ? 1 : 0);

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-white shadow-2xs hover:shadow-md ${
        isSelected
          ? 'border-brand-pink ring-2 ring-brand-pink/20 bg-pink-50/10'
          : 'border-neutral-200 hover:border-neutral-300'
      }`}
    >
      {/* Top Header: Checkbox + Avatar + Name + Score Badge */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5 pb-3 border-b border-neutral-100">
        <div className="flex items-start gap-3">
          {/* Checkbox for Bulk Actions */}
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(application.id)}
              aria-label={`Select ${candidate.fullName || application.candidateName}`}
              className="mt-1 w-4 h-4 rounded text-brand-pink focus:ring-brand-pink border-neutral-300 cursor-pointer"
            />
          )}

          <Avatar
            src={candidate.avatar || application.candidateAvatar}
            name={candidate.fullName || application.candidateName}
            size="lg"
          />

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold font-serif text-neutral-900 tracking-tight">
                {candidate.fullName || application.candidateName}
              </h3>

              {/* Talent Category Badges */}
              {(candidate.talentCategories || ['Actor']).map((cat, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200"
                >
                  {cat}
                </span>
              ))}

              <ApplicationStatusBadge status={application.status} />
            </div>

            <p className="text-[11px] text-neutral-500 line-clamp-1">
              {candidate.headline || application.candidateHeadline || 'Film & Dramatic Artist'}
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-500 pt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>{candidate.location || application.candidateLocation || 'Location unspecified'}</span>
              </span>
              <span className="flex items-center gap-1 font-mono text-[10.5px]">
                <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>Applied: {formatDate(application.appliedDate)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Match Score Badge */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0">
          <ScoreBadge
            score={scoreData.total_score}
            status={scoreData.status}
            confidence={scoreData.confidence_level}
            onClick={() => onViewScoreBreakdown && onViewScoreBreakdown(application)}
            size="md"
            showDetailsBtn={true}
          />
          <span className="text-[10px] text-neutral-400 font-medium">
            Role: <strong className="text-neutral-700">{application.roleAppliedFor}</strong>
          </span>
        </div>
      </div>

      {/* Middle Grid: Key Criteria Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 py-3.5 text-xs text-neutral-600">
        {/* 1. Skills Match */}
        <div className="p-3 rounded-xl bg-neutral-50/70 border border-neutral-150 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[11px] uppercase tracking-wider text-neutral-800 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-brand-pink" />
              <span>Skills ({Math.round(skillsBreakdown?.points_awarded || 0)}/30 pts)</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {candidateSkills.slice(0, 5).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white border border-neutral-200 text-neutral-800 shadow-2xs"
              >
                {skill}
              </span>
            ))}
            {candidateSkills.length > 5 && (
              <span className="text-[10px] text-neutral-400 self-center">
                +{candidateSkills.length - 5} more
              </span>
            )}
            {candidateSkills.length === 0 && (
              <span className="text-[10px] text-neutral-400 italic">No skills listed</span>
            )}
          </div>
        </div>

        {/* 2. Experience & Credits */}
        <div className="p-3 rounded-xl bg-neutral-50/70 border border-neutral-150 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[11px] uppercase tracking-wider text-neutral-800 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-brand-pink" />
              <span>Experience ({Math.round(expBreakdown?.points_awarded || 0)}/15 pts)</span>
            </span>
            <span className="text-[10px] font-bold text-neutral-700">
              {candidate.yearsOfExperience || 2}+ Yrs
            </span>
          </div>
          <p className="text-[11px] text-neutral-600 line-clamp-2">
            {expBreakdown?.evidence_used || `${candidate.yearsOfExperience || 2} years active screen/theatre performer.`}
          </p>
        </div>

        {/* 3. Portfolio & Media Links */}
        <div className="p-3 rounded-xl bg-neutral-50/70 border border-neutral-150 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[11px] uppercase tracking-wider text-neutral-800 flex items-center gap-1">
              <Video className="w-3.5 h-3.5 text-brand-pink" />
              <span>Portfolio ({Math.round(portfolioBreakdown?.points_awarded || 0)}/25 pts)</span>
            </span>
            <button
              type="button"
              onClick={() => onViewPortfolio && onViewPortfolio(application)}
              className="text-[10px] font-bold text-brand-pink hover:underline cursor-pointer"
            >
              Open Media
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10.5px]">
            <span className={`inline-flex items-center gap-1 ${headshotCount > 0 ? 'text-neutral-800' : 'text-neutral-400'}`}>
              <CheckCircle2 className={`w-3 h-3 ${headshotCount > 0 ? 'text-emerald-500' : 'text-neutral-300'}`} />
              {headshotCount} Headshots
            </span>
            <span className={`inline-flex items-center gap-1 ${hasShowreel ? 'text-neutral-800' : 'text-neutral-400'}`}>
              <CheckCircle2 className={`w-3 h-3 ${hasShowreel ? 'text-emerald-500' : 'text-neutral-300'}`} />
              Showreel
            </span>
            <span className={`inline-flex items-center gap-1 ${hasResume ? 'text-neutral-800' : 'text-neutral-400'}`}>
              <CheckCircle2 className={`w-3 h-3 ${hasResume ? 'text-emerald-500' : 'text-neutral-300'}`} />
              Resume
            </span>
          </div>
        </div>

        {/* 4. Language Match */}
        <div className="p-3 rounded-xl bg-neutral-50/70 border border-neutral-150 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[11px] uppercase tracking-wider text-neutral-800 flex items-center gap-1">
              <Languages className="w-3.5 h-3.5 text-brand-pink" />
              <span>Languages ({Math.round(langBreakdown?.points_awarded || 0)}/10 pts)</span>
            </span>
          </div>
          <p className="text-[11px] text-neutral-700">
            {candidateLanguages.join(', ')}
          </p>
        </div>

        {/* 5. Availability Match */}
        <div className="p-3 rounded-xl bg-neutral-50/70 border border-neutral-150 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[11px] uppercase tracking-wider text-neutral-800 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-pink" />
              <span>Availability ({Math.round(availBreakdown?.points_awarded || 0)}/10 pts)</span>
            </span>
          </div>
          <p className="text-[11px] text-neutral-700">
            {candidate.availabilityStatus || candidate.availability || 'Available for Projects'}
          </p>
        </div>

        {/* 6. Location & Travel */}
        <div className="p-3 rounded-xl bg-neutral-50/70 border border-neutral-150 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[11px] uppercase tracking-wider text-neutral-800 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-pink" />
              <span>Travel ({Math.round(locBreakdown?.points_awarded || 0)}/10 pts)</span>
            </span>
          </div>
          <p className="text-[11px] text-neutral-700 line-clamp-1">
            {candidate.travelStatus || 'Open to travel internationally'}
          </p>
        </div>
      </div>

      {/* Missing Information Notice Banner (if any) */}
      {scoreData.missing_fields && scoreData.missing_fields.length > 0 && (
        <div className="mb-3.5 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold">Information Gaps: </span>
            <span className="text-amber-800">
              {scoreData.missing_fields.join(' • ')} (Candidate profile would benefit from detailing these areas).
            </span>
          </div>
        </div>
      )}

      {/* Recruiter Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-neutral-100">
        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            to={`/admin/candidates/${candidate.id || application.candidateId}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200 hover:border-neutral-400 bg-white text-neutral-800 text-xs font-semibold shadow-2xs hover:bg-neutral-50 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-neutral-500" />
            <span>View Profile</span>
          </Link>

          <button
            type="button"
            onClick={() => onViewPortfolio && onViewPortfolio(application)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200 hover:border-neutral-400 bg-white text-neutral-800 text-xs font-semibold shadow-2xs hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <Video className="w-3.5 h-3.5 text-brand-pink" />
            <span>View Portfolio</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Shortlist Action */}
          <button
            type="button"
            onClick={() => onShortlist && onShortlist(application.id, isShortlisted ? 'unshortlist' : 'shortlist')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isShortlisted
                ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                : 'bg-white border border-neutral-300 text-neutral-800 hover:border-amber-400'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-current text-amber-500' : 'text-neutral-400'}`} />
            <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
          </button>

          {/* Invite to Audition */}
          <button
            type="button"
            onClick={() => onInviteAudition && onInviteAudition(application)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-pink hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Invite to Audition</span>
          </button>

          {/* Reject */}
          <button
            type="button"
            onClick={() => onReject && onReject(application)}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
            title="Reject Candidate"
            aria-label={`Reject ${candidate.fullName || application.candidateName}`}
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;
