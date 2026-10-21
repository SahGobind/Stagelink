import React from 'react';
import { ArrowDown, Minus, ArrowUp, Flame } from 'lucide-react';

const PRIORITY_CONFIGS = {
  low: {
    label: 'Low',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: ArrowDown,
  },
  normal: {
    label: 'Normal',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: Minus,
  },
  high: {
    label: 'High',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: ArrowUp,
  },
  urgent: {
    label: 'Urgent',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: Flame,
  },
};

const SupportPriorityBadge = ({ priority = 'normal', size = 'sm', className = '' }) => {
  const norm = (priority || 'normal').toLowerCase();
  const cfg = PRIORITY_CONFIGS[norm] || PRIORITY_CONFIGS.normal;
  const Icon = cfg.icon;

  const sizeClasses =
    size === 'xs'
      ? 'px-2 py-0.5 text-[10px] gap-1'
      : size === 'md'
      ? 'px-3 py-1 text-xs gap-1.5'
      : 'px-2.5 py-0.5 text-[11px] gap-1';

  return (
    <span
      className={`inline-flex items-center font-bold rounded-md border ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClasses} ${className}`}
    >
      <Icon className={size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{cfg.label}</span>
    </span>
  );
};

export default SupportPriorityBadge;
