import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Heart,
  Building2,
  Calendar,
  Banknote,
  Users,
  Clock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Film,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { resolveOpportunityImage, getCategoryFallbackImage } from '../../utils/opportunityImageHelper';

const OpportunityCard = ({ opportunity, onApplyClick }) => {
  const { isOpportunitySaved, toggleSaveOpportunity } = useApp();
  const isSaved = isOpportunitySaved(opportunity?.id);

  const [imgSrc, setImgSrc] = useState(() => resolveOpportunityImage(opportunity));
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgSrc(resolveOpportunityImage(opportunity));
    setImgFailed(false);
  }, [opportunity?.image, opportunity?.id, opportunity?.productionCategory, opportunity?.category]);

  const handleImageError = () => {
    const fallback = getCategoryFallbackImage(
      opportunity?.productionCategory || opportunity?.category,
      opportunity?.productionType || opportunity?.type
    );
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    } else {
      setImgFailed(true);
    }
  };

  if (!opportunity) return null;

  const isClosed = opportunity.status === 'closed' || opportunity.status === 'expired';
  const isVerifiedCompany = Boolean(
    opportunity.isCompanyVerified ||
    opportunity.companyVerified ||
    opportunity.verifiedCompany ||
    opportunity.productionCompany?.toLowerCase().includes('apex') ||
    opportunity.productionCompany?.toLowerCase().includes('stagelink')
  );

  const talentList = Array.isArray(opportunity.talentNeeded)
    ? opportunity.talentNeeded
    : opportunity.talentNeeded
    ? [opportunity.talentNeeded]
    : ['Actors'];

  const compensationDisplay =
    opportunity.compensation && opportunity.compensation !== '0'
      ? `${opportunity.compensation}${
          opportunity.rateUnit || opportunity.compensationUnit ? ` / ${opportunity.rateUnit || opportunity.compensationUnit}` : ''
        }`
      : opportunity.compensationType || 'Negotiable';

  return (
    <div className="bg-[#18191C] rounded-3xl border border-neutral-800 hover:border-[#FA5A36]/40 shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group h-full relative overflow-hidden">
      <div>
        {/* Card Image Banner with Badges & Save Control */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-950">
          {!imgFailed ? (
            <img
              src={imgSrc}
              alt=""
              onError={handleImageError}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${
                isClosed ? 'grayscale-[40%]' : ''
              }`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-950 via-neutral-900 to-black p-4 flex flex-col justify-end relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FA5A36]/15 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 space-y-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block truncate">
                  {opportunity.productionCompany || 'StageLink Studio'}
                </span>
                <p className="text-white font-bold text-xs font-sans line-clamp-1">
                  {opportunity.title}
                </p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

          {/* Badges: Project Category + Type + Status */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center max-w-[80%]">
            <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-neutral-950 text-[11px] font-bold rounded-full shadow-xs border border-white/60">
              {opportunity.productionCategory || opportunity.category || 'Film & TV'}
            </span>
            {(opportunity.productionType || opportunity.type) && (
              <span className="px-2.5 py-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium rounded-full border border-white/10">
                {opportunity.productionType || opportunity.type}
              </span>
            )}
            {isClosed && (
              <span className="px-2.5 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-full backdrop-blur-md uppercase tracking-wide shadow-xs">
                Closed
              </span>
            )}
          </div>

          {/* Save/Unsave Control */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSaveOpportunity(opportunity.id);
            }}
            aria-label={isSaved ? 'Remove from saved' : 'Save opportunity'}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/75 border border-white/20 flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-90 shadow-sm cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isSaved ? 'fill-[#FA5A36] text-[#FA5A36] drop-shadow-xs' : 'text-white'
              }`}
            />
          </button>
        </div>

        {/* Card Body Details */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Production Company + Verified Badge */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="font-semibold text-neutral-200 truncate">
                {opportunity.productionCompany || 'Certified Production House'}
              </span>
            </div>
            {isVerifiedCompany && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 rounded-full text-[10px] font-bold shrink-0 shadow-2xs"
                title="Verified Production Company"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Verified</span>
              </span>
            )}
          </div>

          {/* Casting Title */}
          <h3 className="text-base font-bold text-white font-sans tracking-tight group-hover:text-[#FA5A36] transition-colors line-clamp-1">
            {opportunity.title}
          </h3>

          {/* Talent Required Tags */}
          <div className="flex flex-wrap gap-1">
            {talentList.slice(0, 3).map((talent, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-full bg-[#FA5A36]/10 text-[#FA5A36] border border-[#FA5A36]/30 text-[10px] font-bold shadow-2xs"
              >
                {talent}
              </span>
            ))}
            {talentList.length > 3 && (
              <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 text-[10px] font-semibold border border-neutral-700">
                +{talentList.length - 3} more
              </span>
            )}
          </div>

          {/* Metadata Grid: Location, Shoot Date, Deadline, Openings */}
          <div className="space-y-1.5 text-xs text-neutral-400 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center text-neutral-300 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#FA5A36] mr-1 shrink-0" />
                <span className="truncate">{opportunity.location || 'Pan-India / Flexible'}</span>
              </span>
              <span className="flex items-center gap-1 text-neutral-400 font-mono text-[10px] shrink-0">
                <Users className="w-3 h-3 text-neutral-400" />
                <span>
                  {opportunity.artistsNeeded
                    ? `${opportunity.artistsNeeded} Opening${opportunity.artistsNeeded > 1 ? 's' : ''}`
                    : 'Multiple Roles'}
                </span>
              </span>
            </div>

            {/* Job Opening Period Window */}
            {(opportunity.jobOpeningRange || (opportunity.openingStartDate && opportunity.openingEndDate)) && (
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-lg font-medium shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="truncate">
                  Opening: {opportunity.openingStartDate && opportunity.openingEndDate
                    ? `${opportunity.openingStartDate} – ${opportunity.openingEndDate}`
                    : opportunity.jobOpeningRange}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-neutral-400" />
                <span>Shoot: {opportunity.shootDate || 'Flexible / TBD'}</span>
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>
                  Due:{' '}
                  {opportunity.applicationDeadline ||
                    opportunity.deadline ||
                    opportunity.expiresDate ||
                    'Open'}
                </span>
              </span>
            </div>
          </div>

          {/* Compensation + Rate Unit */}
          <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-neutral-800 text-[11px]">
            <span className="inline-flex items-center gap-1 font-bold text-white bg-neutral-800/90 border border-neutral-700/80 px-2.5 py-0.5 rounded-lg truncate">
              <Banknote className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
              <span className="truncate">{compensationDisplay}</span>
            </span>

            <span className="text-[10px] text-neutral-400 font-medium shrink-0">
              {opportunity.compensationType || 'Paid Role'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons: View Details & Apply Now */}
      <div className="p-4 sm:p-5 pt-0 grid grid-cols-2 gap-2">
        <Link
          to={`/opportunities/${opportunity.id}`}
          className="inline-flex items-center justify-center py-2.5 px-3 bg-neutral-800/90 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold rounded-full shadow-2xs hover:shadow-subtle active:translate-y-0.5 transition-all text-center"
        >
          View Details
        </Link>
        <Link
          to={`/opportunities/${opportunity.id}?apply=true`}
          className={`inline-flex items-center justify-center py-2.5 px-3 text-xs font-bold rounded-full transition-all duration-200 text-center active:translate-y-0.5 ${
            isClosed
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed pointer-events-none'
              : 'bg-[#FA5A36] hover:bg-[#E64825] text-white shadow-md'
          }`}
        >
          <span>{isClosed ? 'Closed' : 'Apply Now'}</span>
          {!isClosed && <ArrowRight className="w-3 h-3 ml-1" />}
        </Link>
      </div>
    </div>
  );
};

export default OpportunityCard;
