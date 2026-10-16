import React from 'react';
import { Sparkles } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = Sparkles,
  title = 'No records found',
  description = 'There are no items to display at this moment.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-brand-border shadow-subtle ${className}`}>
      <div className="w-16 h-16 rounded-3xl bg-brand-pink-light flex items-center justify-center mb-4 text-brand-pink">
        <Icon className="w-8 h-8 stroke-[1.5]" />
      </div>
      <h4 className="text-lg font-bold font-serif text-brand-navy mb-1.5">{title}</h4>
      <p className="text-xs text-brand-text-secondary max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
