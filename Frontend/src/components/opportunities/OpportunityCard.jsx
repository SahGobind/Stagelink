import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Building2, Calendar, Banknote } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const OpportunityCard = ({ opportunity }) => {
  const { isOpportunitySaved, toggleSaveOpportunity } = useApp();
  const isSaved = isOpportunitySaved(opportunity?.id);

  if (!opportunity) return null;

  const isClosed = opportunity.status === 'closed' || opportunity.status === 'expired';

  return (
    <div className="bg-white rounded-2xl border border-brand-border overflow-hidden hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group h-full">
      <div>
        {/* Card Image Banner with Badges & Save Control */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
          <img
            src={opportunity.image}
            alt={opportunity.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              isClosed ? 'grayscale-[40%]' : ''
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

          {/* Badges: Project Type + Status */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
            <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm text-black text-[11px] font-bold rounded-full shadow-xs">
              {opportunity.category || opportunity.type}
            </span>
            {isClosed && (
              <span className="px-2 py-0.5 bg-gray-900/90 text-white text-[10px] font-bold rounded-full backdrop-blur-sm uppercase tracking-wide">
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
                isSaved ? 'fill-black text-black' : 'text-white'
              }`}
            />
          </button>
        </div>

        {/* Card Body Details */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Production Company */}
          <div className="flex items-center gap-1.5 text-xs text-brand-text-secondary">
            <Building2 className="w-3.5 h-3.5 text-brand-navy/60 shrink-0" />
            <span className="font-semibold text-brand-navy truncate">
              {opportunity.productionCompany}
            </span>
          </div>

          {/* Role Title */}
          <h3 className="text-base font-bold text-black font-sans tracking-tight group-hover:text-neutral-700 transition-colors line-clamp-1">
            {opportunity.title}
          </h3>

          {/* Location & Requirements Summary */}
          <div className="space-y-1.5 text-xs text-brand-text-secondary">
            <div className="flex items-center text-brand-text-secondary">
              <MapPin className="w-3.5 h-3.5 text-black mr-1.5 shrink-0" />
              <span className="truncate">{opportunity.location}</span>
            </div>

            {/* Requirements Summary */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-2 text-[11px] text-brand-navy/80 leading-snug line-clamp-2">
              <span className="font-bold text-brand-navy mr-1">Req:</span>
              {opportunity.requirementsSummary ||
                `${opportunity.ageRange ? 'Age: ' + opportunity.ageRange + ' • ' : ''}${opportunity.experience || ''}`}
            </div>
          </div>

          {/* Compensation ONLY when provided + Posted Date */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100 text-[11px]">
            {opportunity.compensation ? (
              <span className="inline-flex items-center gap-1 font-bold text-neutral-900 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-md truncate">
                <Banknote className="w-3 h-3 text-black shrink-0" />
                <span className="truncate">{opportunity.compensation}</span>
              </span>
            ) : (
              <span className="text-gray-400 text-[10px] italic">Compensation unlisted</span>
            )}

            <div className="flex items-center gap-1 text-[10px] text-gray-400 shrink-0 ml-auto">
              <Calendar className="w-3 h-3" />
              <span>{opportunity.postedTime || 'Recently'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Button Action */}
      <div className="p-4 sm:p-5 pt-0">
        <Link
          to={`/opportunities/${opportunity.id}`}
          className="w-full inline-flex items-center justify-center py-2.5 px-4 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors duration-200 text-center"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default OpportunityCard;
