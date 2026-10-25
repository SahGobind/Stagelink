import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';
import ApplicationStatusBadge from './ApplicationStatusBadge';
import { formatDate } from '../../utils/formatters';

const ApplicationCard = ({ application }) => {
  if (!application) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-3d-card hover:shadow-3d-card-hover hover:-translate-y-1 specular-top transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <ApplicationStatusBadge status={application.status} />
            <span className="text-xs text-slate-400 flex items-center font-medium">
              <Calendar className="w-3 h-3 mr-1" />
              Applied {formatDate(application.appliedDate)}
            </span>
          </div>
          <h3 className="text-base font-bold text-brand-navy font-serif tracking-tight">
            {application.opportunityTitle}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Role: <span className="text-brand-pink font-semibold">{application.roleAppliedFor}</span> • {application.productionCompany}
          </p>
          {application.notes && (
            <p className="text-xs text-slate-500 italic pt-1">
              Note: {application.notes}
            </p>
          )}
        </div>

        <Link
          to={`/candidate/applications/${application.id}`}
          className="inline-flex items-center text-xs font-semibold text-slate-800 hover:text-black px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl shadow-2xs hover:shadow-xs active:translate-y-0.5 transition-all self-start sm:self-center"
        >
          <span>View Details</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default ApplicationCard;
