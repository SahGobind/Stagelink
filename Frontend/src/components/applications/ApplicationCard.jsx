import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';
import ApplicationStatusBadge from './ApplicationStatusBadge';
import { formatDate } from '../../utils/formatters';

const ApplicationCard = ({ application }) => {
  if (!application) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-card-hover transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <ApplicationStatusBadge status={application.status} />
            <span className="text-xs text-gray-400 flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              Applied {formatDate(application.appliedDate)}
            </span>
          </div>
          <h3 className="text-base font-bold text-brand-navy font-serif">
            {application.opportunityTitle}
          </h3>
          <p className="text-xs text-gray-500 font-medium">
            Role: <span className="text-brand-pink font-semibold">{application.roleAppliedFor}</span> • {application.productionCompany}
          </p>
          {application.notes && (
            <p className="text-xs text-gray-500 italic pt-1">
              Note: {application.notes}
            </p>
          )}
        </div>

        <Link
          to={`/candidate/applications/${application.id}`}
          className="inline-flex items-center text-xs font-semibold text-brand-navy hover:text-brand-pink px-4 py-2 bg-gray-50 hover:bg-brand-pink-light rounded-xl transition-colors self-start sm:self-center"
        >
          <span>View Details</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default ApplicationCard;
