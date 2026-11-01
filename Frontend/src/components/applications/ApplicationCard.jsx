import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  ChevronRight,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import ApplicationStatusBadge from './ApplicationStatusBadge';
import { formatDate } from '../../utils/formatters';

const ApplicationCard = ({ application }) => {
  if (!application) return null;

  const studioName = application.productionCompany || 'Production Studio';
  const studioInitial = (studioName.trim()[0] || 'S').toUpperCase();
  const status = (application.status || 'submitted').toLowerCase();

  // Next-step / status helper guide for user friendliness
  const getStatusGuide = () => {
    switch (status) {
      case 'audition_requested':
      case 'interview':
        return {
          text: 'Audition Callback Scheduled • Check Preparation Notes',
          className: 'bg-pink-50 text-brand-pink border-pink-200',
          icon: Sparkles,
        };
      case 'shortlisted':
        return {
          text: 'Shortlisted by Casting Director • Under Final Consideration',
          className: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: Clock,
        };
      case 'selected':
      case 'accepted':
        return {
          text: 'Congratulations! Role Offered by Production',
          className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: CheckCircle2,
        };
      case 'rejected':
      case 'not_selected':
        return {
          text: 'Casting Completed for this Role',
          className: 'bg-gray-50 text-gray-600 border-gray-200',
          icon: AlertCircle,
        };
      case 'withdrawn':
        return {
          text: 'Application Withdrawn by Candidate',
          className: 'bg-neutral-50 text-neutral-500 border-neutral-200',
          icon: Clock,
        };
      case 'under_review':
        return {
          text: 'Showreel & Portfolio Currently Being Evaluated',
          className: 'bg-blue-50 text-blue-800 border-blue-200',
          icon: Clock,
        };
      default:
        return {
          text: 'Audition Packet Received by Studio',
          className: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: Clock,
        };
    }
  };

  const guide = getStatusGuide();
  const GuideIcon = guide.icon;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-3d-card hover:shadow-3d-card-hover hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Studio Avatar & Info */}
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
            {studioInitial}
          </div>

          <div className="space-y-1.5 min-w-0">
            {/* Status badge + applied date */}
            <div className="flex items-center gap-2 flex-wrap">
              <ApplicationStatusBadge status={application.status} />
              <span className="text-xs text-slate-400 flex items-center font-medium">
                <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                Applied {formatDate(application.appliedDate)}
              </span>
              {application.location && (
                <span className="text-xs text-slate-400 flex items-center font-medium">
                  <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                  {application.location}
                </span>
              )}
            </div>

            {/* Opportunity Title */}
            <h3 className="text-base sm:text-lg font-bold text-brand-navy font-serif tracking-tight truncate">
              {application.opportunityTitle}
            </h3>

            {/* Role & Company */}
            <p className="text-xs text-slate-600 font-medium">
              Role:{' '}
              <span className="text-brand-pink font-semibold">
                {application.roleAppliedFor}
              </span>{' '}
              • <strong className="text-slate-800">{studioName}</strong>
            </p>

            {/* Casting Director / Callback Note */}
            {application.notes && (
              <p className="text-xs text-slate-500 italic pt-0.5 line-clamp-2">
                &ldquo;{application.notes}&rdquo;
              </p>
            )}

            {/* Status Guide Banner */}
            <div className="pt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${guide.className}`}
              >
                <GuideIcon className="w-3 h-3 shrink-0" />
                <span>{guide.text}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <Link
            to={`/candidate/applications/${application.id}`}
            className="inline-flex items-center text-xs font-bold text-slate-800 hover:text-white px-4 py-2.5 bg-slate-50 hover:bg-slate-900 border border-slate-200 hover:border-slate-900 rounded-xl shadow-2xs hover:shadow-xs active:translate-y-0.5 transition-all"
          >
            <span>View Application &amp; Timeline</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;
