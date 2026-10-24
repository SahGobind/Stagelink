import React from 'react';
import {
  X,
  Building2,
  MapPin,
  Calendar,
  Users,
  Banknote,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Edit3,
} from 'lucide-react';
import Button from '../common/Button';
import { resolveOpportunityImage, getCategoryFallbackImage } from '../../utils/opportunityImageHelper';

const OpportunityPreviewModal = ({ isOpen, onClose, opportunity, onProceedToPayment }) => {
  if (!isOpen || !opportunity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
        {/* Header Banner */}
        <div className="px-6 py-4 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30 text-[11px] font-bold uppercase tracking-wider">
              Preview Mode
            </span>
            <span className="text-xs text-neutral-300">
              This is how performers will see your casting call.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors"
            aria-label="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Cover Poster Banner */}
          <div className="relative aspect-[21/9] max-h-48 w-full rounded-2xl overflow-hidden bg-neutral-900 shadow-xs border border-gray-100">
            <img
              src={resolveOpportunityImage(opportunity)}
              alt=""
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getCategoryFallbackImage(
                  opportunity.productionCategory || opportunity.category,
                  opportunity.productionType || opportunity.type
                );
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-white/95 text-black font-bold text-[10px] rounded-full shadow-xs">
                {opportunity.productionCategory || 'Film & TV'} — {opportunity.productionType || 'Feature Film'}
              </span>
            </div>
          </div>

          {/* Production House & Tags */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-brand-navy">
                <Building2 className="w-4 h-4 text-brand-pink" />
                {opportunity.productionCompany || 'Production Studio'}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified Studio
              </span>
              <span className="text-gray-400">•</span>
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium text-[11px]">
                {opportunity.productionCategory} — {opportunity.productionType}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy leading-tight">
              {opportunity.title || `${opportunity.productionCompany} — ${opportunity.productionType}`}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-pink" />
                {opportunity.location || 'Open / Unspecified'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-pink" />
                Shoot: {opportunity.shootDate || 'Flexible / TBD'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-pink" />
                Deadline: <strong className="text-brand-navy ml-1">{opportunity.deadline || 'Open'}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-brand-pink" />
                {opportunity.artistsNeeded || 1} Openings
              </span>
            </div>

            {/* Job Opening Period Window */}
            {(opportunity.jobOpeningRange || (opportunity.openingStartDate && opportunity.openingEndDate)) && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950 font-medium">
                <span className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Job Opening Window:
                </span>
                <span className="font-bold text-emerald-900">
                  {opportunity.openingStartDate && opportunity.openingEndDate
                    ? `${opportunity.openingStartDate} se lekar ${opportunity.openingEndDate} tak`
                    : opportunity.jobOpeningRange}
                </span>
              </div>
            )}
          </div>

          {/* Talent Needed Badges */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Talent Required:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(opportunity.talentNeeded || []).map((t, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-xl bg-pink-50 text-brand-pink border border-pink-200 text-xs font-semibold"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Compensation Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Remuneration &amp; Terms
                </p>
                <p className="text-base font-bold text-emerald-950">
                  {opportunity.compensation || '₹50,000 / Per Project'}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0">
              {opportunity.compensationType || 'Paid'}
            </span>
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider text-[11px]">
              Project Description
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
              {opportunity.description || 'No description provided.'}
            </p>
          </div>

          {/* Requirements & Criteria */}
          {opportunity.requirements && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider text-[11px]">
                Audition &amp; Role Requirements
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
                {opportunity.requirements}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Listing</span>
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="primary"
              onClick={onProceedToPayment}
              className="flex items-center gap-2 bg-black hover:bg-neutral-800 text-white"
            >
              <span>Publish Casting Call Now</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityPreviewModal;
