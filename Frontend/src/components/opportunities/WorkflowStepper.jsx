import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Register / Sign In' },
  { id: 2, label: 'Create Job' },
  { id: 3, label: 'Review Fees' },
  { id: 4, label: 'Pay Securely' },
  { id: 5, label: 'Publish / Await Review' },
];

const WorkflowStepper = ({ currentStep = 2, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200/90 p-4 shadow-2xs ${className}`}>
      <div className="flex items-center justify-between overflow-x-auto gap-2 sm:gap-4 no-scrollbar py-1">
        {STEPS.map((step, idx) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-brand-pink text-white ring-4 ring-pink-100 shadow-xs'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : step.id}
                </div>
                <span
                  className={`text-xs font-medium whitespace-nowrap transition-colors ${
                    isCurrent
                      ? 'font-bold text-gray-900'
                      : isCompleted
                      ? 'text-emerald-700 font-semibold'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {idx < STEPS.length - 1 && (
                <div
                  className={`hidden md:block flex-1 h-0.5 min-w-[20px] transition-colors ${
                    isCompleted ? 'bg-emerald-400' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowStepper;
