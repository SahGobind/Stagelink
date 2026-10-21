import React from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

const ApplicationTimeline = ({ currentStatus = 'submitted' }) => {
  if (currentStatus === 'withdrawn') {
    return (
      <div className="bg-white rounded-2xl border border-gray-150 p-5 flex items-center gap-3 text-neutral-600">
        <XCircle className="w-5 h-5 text-neutral-400" />
        <div>
          <span className="font-bold text-xs text-neutral-900 block">Application Withdrawn</span>
          <span className="text-[11px] text-neutral-500">You withdrew this submission. It is no longer under consideration.</span>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'submitted', label: 'Submitted' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'shortlisted', label: 'Shortlisted' },
    { key: 'audition_requested', label: 'Audition Requested' },
    { key: 'decision', label: currentStatus === 'rejected' ? 'Rejected' : 'Selected' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'submitted':
      case 'applied':
        return 0;
      case 'under_review':
        return 1;
      case 'shortlisted':
        return 2;
      case 'audition_requested':
      case 'interview':
        return 3;
      case 'selected':
      case 'accepted':
      case 'rejected':
      case 'not_selected':
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider mb-6">
        Application Progress
      </h3>
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-2">
        {steps.map((step, idx) => {
          const isPassed = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div
              key={step.key}
              className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 flex-1 relative z-10"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  isCurrent
                    ? 'bg-brand-pink text-white ring-4 ring-pink-100'
                    : isPassed
                    ? 'bg-brand-pink text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-3.5 h-3.5" />}
              </div>
              <span
                className={`text-xs font-medium ${
                  isCurrent
                    ? 'text-brand-pink font-bold'
                    : isPassed
                    ? 'text-brand-navy'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationTimeline;
