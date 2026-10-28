import React, { useState } from 'react';
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
  Award,
  ChevronDown,
  ChevronUp,
  Play,
  Briefcase,
  Sparkles,
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
  const [showDetailedPoints, setShowDetailedPoints] = useState(false);

  if (!application) return null;

  const candidate = application.candidate || {};
  const scoreData = application.match_score || {};
  const breakdowns = scoreData.breakdowns || [];

  // Criterion breakdown helpers
  const skillsBreakdown = breakdowns.find((b) => b.criterion_key === 'skills' || b.criterionKey === 'skills');
  const portfolioBreakdown = breakdowns.find((b) => b.criterion_key === 'portfolio' || b.criterionKey === 'portfolio');
  const expBreakdown = breakdowns.find((b) => b.criterion_key === 'experience' || b.criterionKey === 'experience');
  const langBreakdown = breakdowns.find((b) => b.criterion_key === 'language' || b.criterionKey === 'language');
  const availBreakdown = breakdowns.find((b) => b.criterion_key === 'availability' || b.criterionKey === 'availability');
  const locBreakdown = breakdowns.find((b) => b.criterion_key === 'location' || b.criterionKey === 'location');

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
          ? 'border-[#FA5A36] ring-2 ring-[#FA5A36]/20 bg-orange-50/10'
          : 'border-neutral-200 hover:border-neutral-300'
      }`}
    >
      {/* 1. Header: Selection + Candidate Info + Score Badge */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5 pb-3.5 border-b border-neutral-100">
        <div className="flex items-start gap-3">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(application.id)}
              aria-label={`Select ${candidate.fullName || application.candidateName}`}
              className="mt-1 w-4 h-4 rounded text-[#FA5A36] focus:ring-[#FA5A36] border-neutral-300 cursor-pointer"
            />
          )}

          <Avatar
            src={candidate.avatar || application.candidateAvatar}
            name={candidate.fullName || application.candidateName}
            size="lg"
          />

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold font-serif text-neutral-900 tracking-tight">
                {candidate.fullName || application.candidateName}
              </h3>

              {/* Primary Category Tag */}
              {(candidate.talentCategories || ['Actor']).slice(0, 2).map((cat, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200"
                >
                  {cat}
                </span>
              ))}

              <ApplicationStatusBadge status={application.status} />
            </div>

            <p className="text-xs text-neutral-500 line-clamp-1">
              {candidate.headline || application.candidateHeadline || 'Film & Dramatic Artist'}
            </p>

            {/* Quick Meta Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 pt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>{candidate.location || application.candidateLocation || 'Location unspecified'}</span>
              </span>
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>Applied {formatDate(application.appliedDate)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Match Score Badge */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1.5 shrink-0">
          <ScoreBadge
            score={scoreData.total_score}
            status={scoreData.status}
            confidence={scoreData.confidence_level}
            onClick={() => onViewScoreBreakdown && onViewScoreBreakdown(application)}
            size="md"
            showDetailsBtn={true}
          />
          {application.roleAppliedFor && (
            <span className="text-[11px] text-neutral-500">
              Role: <strong className="text-neutral-800">{application.roleAppliedFor}</strong>
            </span>
          )}
        </div>
      </div>

      {/* 2. Compact Key Highlights Row (Simple & User-Friendly) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3.5 text-xs">
        {/* Skills Snippet */}
        <div className="space-y-1.5 p-3 rounded-xl bg-neutral-50/80 border border-neutral-100">
          <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-[#FA5A36]" />
            <span>Key Skills</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {candidateSkills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-white border border-neutral-200 text-neutral-800"
              >
                {skill}
              </span>
            ))}
            {candidateSkills.length > 4 && (
              <span className="text-[10px] text-neutral-400 self-center">
                +{candidateSkills.length - 4} more
              </span>
            )}
            {candidateSkills.length === 0 && (
              <span className="text-[11px] text-neutral-400 italic">No skills listed</span>
            )}
          </div>
        </div>

        {/* Portfolio & Reels Preview */}
        <div className="space-y-1.5 p-3 rounded-xl bg-neutral-50/80 border border-neutral-100">
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Video className="w-3.5 h-3.5 text-[#FA5A36]" />
              <span>Media &amp; Portfolio</span>
            </span>
            <button
              type="button"
              onClick={() => onViewPortfolio && onViewPortfolio(application)}
              className="text-[10px] font-bold text-[#FA5A36] hover:underline cursor-pointer"
            >
              Open
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] pt-0.5">
            <span className={`inline-flex items-center gap-1 ${headshotCount > 0 ? 'text-neutral-800 font-medium' : 'text-neutral-400'}`}>
              <CheckCircle2 className={`w-3.5 h-3.5 ${headshotCount > 0 ? 'text-emerald-500' : 'text-neutral-300'}`} />
              {headshotCount} Photos
            </span>
            <span className={`inline-flex items-center gap-1 ${hasShowreel ? 'text-neutral-800 font-medium' : 'text-neutral-400'}`}>
              <CheckCircle2 className={`w-3.5 h-3.5 ${hasShowreel ? 'text-emerald-500' : 'text-neutral-300'}`} />
              Reel
            </span>
            <span className={`inline-flex items-center gap-1 ${hasResume ? 'text-neutral-800 font-medium' : 'text-neutral-400'}`}>
              <CheckCircle2 className={`w-3.5 h-3.5 ${hasResume ? 'text-emerald-500' : 'text-neutral-300'}`} />
              Resume
            </span>
          </div>
        </div>

        {/* Experience & Details */}
        <div className="space-y-1.5 p-3 rounded-xl bg-neutral-50/80 border border-neutral-100">
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-[#FA5A36]" />
              <span>Experience &amp; Languages</span>
            </span>
            <span className="font-bold text-neutral-900 font-mono text-[11px]">
              {candidate.yearsOfExperience || 2}+ Yrs
            </span>
          </div>
          <p className="text-[11px] text-neutral-600 truncate">
            {candidateLanguages.join(', ')} • {candidate.availabilityStatus || 'Available'}
          </p>
        </div>
      </div>

      {/* 3. Optional Detailed Scoring Points Dropdown */}
      <div className="pt-0.5 pb-2">
        <button
          type="button"
          onClick={() => setShowDetailedPoints(!showDetailedPoints)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
        >
          {showDetailedPoints ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-[#FA5A36]" />
              <span>Hide Detailed Scoring Points</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-[#FA5A36]" />
              <span>View Detailed Scoring Points Breakdown</span>
            </>
          )}
        </button>

        {showDetailedPoints && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 animate-in fade-in duration-150">
            <div className="space-y-0.5">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Skills</span>
              <span className="font-bold text-neutral-900">{Math.round(skillsBreakdown?.points_awarded || 0)} / 30 pts</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Portfolio</span>
              <span className="font-bold text-neutral-900">{Math.round(portfolioBreakdown?.points_awarded || 0)} / 25 pts</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Experience</span>
              <span className="font-bold text-neutral-900">{Math.round(expBreakdown?.points_awarded || 0)} / 15 pts</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Languages</span>
              <span className="font-bold text-neutral-900">{Math.round(langBreakdown?.points_awarded || 0)} / 10 pts</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Availability</span>
              <span className="font-bold text-neutral-900">{Math.round(availBreakdown?.points_awarded || 0)} / 10 pts</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Location</span>
              <span className="font-bold text-neutral-900">{Math.round(locBreakdown?.points_awarded || 0)} / 10 pts</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Action Buttons Bar */}
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
            <Video className="w-3.5 h-3.5 text-[#FA5A36]" />
            <span>View Portfolio</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FA5A36] hover:bg-[#E64825] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer active:scale-[0.98]"
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
