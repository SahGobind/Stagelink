import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this section. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-red-100 shadow-subtle ${className}`} role="alert">
      <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mb-4 text-brand-error">
        <AlertTriangle className="w-8 h-8 stroke-[1.5]" />
      </div>
      <h4 className="text-lg font-bold font-serif text-brand-navy mb-1.5">{title}</h4>
      <p className="text-xs text-brand-text-secondary max-w-sm mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" size="sm" icon={RefreshCw}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
