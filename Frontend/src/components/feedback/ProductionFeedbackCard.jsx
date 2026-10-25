import React from 'react';
import { Star, Building2, CheckCircle2, Award, Quote } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const ProductionFeedbackCard = ({ feedback, className = '' }) => {
  if (!feedback) return null;

  const {
    production_company = 'Production Studio',
    opportunity_title = 'Casting Call',
    role_title = 'Character Role',
    rating = 4.8,
    breakdown = {},
    feedback: feedbackText = '',
    reviewer_name = 'Casting Director',
    reviewer_role = 'Lead Studio Reviewer',
    given_at = new Date().toISOString(),
  } = feedback;

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-3d-card specular-top text-left space-y-4 ${className}`}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold font-serif text-black">{production_company}</h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-200">
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                <span>Verified Studio Review</span>
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Audition for: <span className="font-semibold text-neutral-800">{role_title}</span> • {opportunity_title}
            </p>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-sm font-bold font-serif text-amber-900">
            {Number(rating).toFixed(1)}
          </span>
          <span className="text-[10px] text-amber-700 font-semibold">/ 5.0</span>
        </div>
      </div>

      {/* Category Breakdown Badges */}
      {breakdown && Object.keys(breakdown).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {breakdown.acting && (
            <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 text-left">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">Acting Depth</span>
              <span className="text-xs font-bold text-black mt-0.5 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                {Number(breakdown.acting).toFixed(1)} / 5
              </span>
            </div>
          )}
          {breakdown.screen_presence && (
            <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 text-left">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">Screen Presence</span>
              <span className="text-xs font-bold text-black mt-0.5 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                {Number(breakdown.screen_presence).toFixed(1)} / 5
              </span>
            </div>
          )}
          {breakdown.vocal_quality && (
            <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 text-left">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">Vocal Delivery</span>
              <span className="text-xs font-bold text-black mt-0.5 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                {Number(breakdown.vocal_quality).toFixed(1)} / 5
              </span>
            </div>
          )}
          {breakdown.professionalism && (
            <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 text-left">
              <span className="text-[10px] uppercase font-bold text-neutral-500 block">Preparedness</span>
              <span className="text-xs font-bold text-black mt-0.5 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                {Number(breakdown.professionalism).toFixed(1)} / 5
              </span>
            </div>
          )}
        </div>
      )}

      {/* Constructive Feedback Quote */}
      <div className="relative bg-neutral-50/70 p-4 rounded-xl border border-neutral-200/80">
        <Quote className="w-6 h-6 text-neutral-300 absolute top-2 right-3 pointer-events-none" />
        <p className="text-xs text-neutral-700 leading-relaxed font-sans pr-6">
          &ldquo;{feedbackText}&rdquo;
        </p>
      </div>

      {/* Reviewer Footer */}
      <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
        <div>
          <span className="font-semibold text-neutral-800">{reviewer_name}</span>
          <span className="mx-1">•</span>
          <span>{reviewer_role}</span>
        </div>
        <span>{formatDate(given_at)}</span>
      </div>
    </div>
  );
};

export default ProductionFeedbackCard;
