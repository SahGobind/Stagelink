import React from 'react';
import { Star, CheckCircle2, User, Building2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const CompanyReviewCard = ({ review, className = '' }) => {
  if (!review) return null;

  const {
    candidate_name = 'Candidate Performer',
    candidate_avatar = '',
    rating = 5.0,
    feedback = '',
    categories = {},
    opportunity_title = '',
    created_at = new Date().toISOString(),
  } = review;

  return (
    <div className={`bg-white rounded-2xl border border-neutral-200 p-4 shadow-2xs text-left space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {candidate_avatar ? (
            <img
              src={candidate_avatar}
              alt={candidate_name}
              className="w-9 h-9 rounded-full object-cover border border-neutral-200"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <h5 className="text-xs font-bold text-black">{candidate_name}</h5>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-50" />
            </div>
            {opportunity_title && (
              <p className="text-[10px] text-neutral-500 truncate max-w-xs">
                Auditioned for: {opportunity_title}
              </p>
            )}
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 shrink-0">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold font-serif text-amber-900">{Number(rating).toFixed(1)}</span>
        </div>
      </div>

      {/* Feedback text */}
      <p className="text-xs text-neutral-700 leading-relaxed font-sans">
        &ldquo;{feedback}&rdquo;
      </p>

      {/* Category Pills & Date */}
      <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1 border-t border-neutral-100">
        <div className="flex items-center gap-2 flex-wrap">
          {categories.casting_experience && (
            <span>Audition: {categories.casting_experience}/5</span>
          )}
          {categories.communication && (
            <span>• Communication: {categories.communication}/5</span>
          )}
          {categories.professionalism && (
            <span>• Professionalism: {categories.professionalism}/5</span>
          )}
        </div>
        <span>{formatDate(created_at)}</span>
      </div>
    </div>
  );
};

export default CompanyReviewCard;
