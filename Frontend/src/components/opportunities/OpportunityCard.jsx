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
    <div className="bg-white rounded-2xl border border-brand-border overflow-hidden hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group h-full">
      <div>
        {/* Card Image Banner with Badges & Save Control */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
          {!imgFailed ? (
            <img
              src={imgSrc}
              alt=""
              onError={handleImageError}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                isClosed ? 'grayscale-[40%]' : ''
              }`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-black p-4 flex flex-col justify-end relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink/15 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 space-y-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block truncate">
                  {opportunity.productionCompany || 'StageLink Studio'}
                </span>
                <p className="text-white font-bold text-xs font-serif line-clamp-1">
                  {opportunity.title}
                </p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Badges: Project Category + Type + Status */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center max-w-[80%]">
            <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm text-black text-[11px] font-bold rounded-full shadow-xs">
              {opportunity.productionCategory || opportunity.category || 'Film & TV'}
            </span>
            {(opportunity.productionType || opportunity.type) && (
              <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium rounded-full">
                {opportunity.productionType || opportunity.type}
              </span>
            )}
            {isClosed && (
              <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-full backdrop-blur-sm uppercase tracking-wide">
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
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 flex items-center justify-center text-white transition-all transform active:scale-90"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isSaved ? 'fill-brand-pink text-brand-pink' : 'text-white'
              }`}
            />
          </button>
        </div>

        {/* Card Body Details */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Production Company + Verified Badge */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <Building2 className="w-3.5 h-3.5 text-brand-navy/60 shrink-0" />
              <span className="font-semibold text-brand-navy truncate">
                {opportunity.productionCompany || 'Certified Production House'}
              </span>
            </div>
            {isVerifiedCompany && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold shrink-0"
                title="Verified Production Company"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Verified</span>
              </span>
            )}
          </div>

          {/* Casting Title */}
          <h3 className="text-base font-bold text-black font-sans tracking-tight group-hover:text-brand-pink transition-colors line-clamp-1">
            {opportunity.title}
          </h3>

          {/* Talent Required Tags */}
          <div className="flex flex-wrap gap-1">
            {talentList.slice(0, 3).map((talent, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-pink-50 text-brand-pink border border-pink-100 text-[10px] font-semibold"
              >
                {talent}
              </span>
            ))}
            {talentList.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-medium">
                +{talentList.length - 3} more
              </span>
            )}
          </div>

          {/* Metadata Grid: Location, Shoot Date, Deadline, Openings */}
          <div className="space-y-1.5 text-xs text-brand-text-secondary pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center text-gray-600 truncate">
                <MapPin className="w-3.5 h-3.5 text-black mr-1 shrink-0" />
                <span className="truncate">{opportunity.location || 'Pan-India / Flexible'}</span>
              </span>
              <span className="flex items-center gap-1 text-gray-500 font-mono text-[10px] shrink-0">
                <Users className="w-3 h-3 text-gray-400" />
                <span>
                  {opportunity.artistsNeeded
                    ? `${opportunity.artistsNeeded} Opening${opportunity.artistsNeeded > 1 ? 's' : ''}`
                    : 'Multiple Roles'}
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-gray-500 pt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span>Shoot: {opportunity.shootDate || 'Flexible / TBD'}</span>
              </span>
              <span className="flex items-center gap-1 text-amber-700 font-medium">
                <Clock className="w-3 h-3 text-amber-600" />
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
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 text-[11px]">
            <span className="inline-flex items-center gap-1 font-bold text-neutral-900 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md truncate">
              <Banknote className="w-3.5 h-3.5 text-black shrink-0" />
              <span className="truncate">{compensationDisplay}</span>
            </span>

            <span className="text-[10px] text-gray-400 shrink-0">
              {opportunity.compensationType || 'Paid Role'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons: View Details & Apply Now */}
      <div className="p-4 sm:p-5 pt-0 grid grid-cols-2 gap-2">
        <Link
          to={`/opportunities/${opportunity.id}`}
          className="inline-flex items-center justify-center py-2.5 px-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 text-xs font-bold rounded-xl shadow-2xs transition-colors duration-200 text-center"
        >
          View Details
        </Link>
        <Link
          to={`/opportunities/${opportunity.id}?apply=true`}
          className={`inline-flex items-center justify-center py-2.5 px-3 text-xs font-bold rounded-xl shadow-xs transition-colors duration-200 text-center ${
            isClosed
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none'
              : 'bg-brand-pink hover:bg-rose-700 text-white'
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
