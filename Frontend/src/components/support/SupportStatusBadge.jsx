import React from 'react';
import {
  Clock,
  RefreshCw,
  UserCheck,
  CheckCircle2,
  Ban,
  AlertCircle,
} from 'lucide-react';

const STATUS_CONFIGS = {
  open: {
    label: 'Open',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: Clock,
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: RefreshCw,
  },
  waiting_user: {
    label: 'Waiting for User',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: UserCheck,
  },
  resolved: {
    label: 'Resolved',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle2,
  },
  closed: {
    label: 'Closed',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: Ban,
  },
};

const SupportStatusBadge = ({ status = 'open', size = 'sm', className = '' }) => {
  const norm = (status || 'open').toLowerCase().replace(/\s+/g, '_');
  const cfg = STATUS_CONFIGS[norm] || {
    label: status,
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: AlertCircle,
  };

  const Icon = cfg.icon;

  const sizeClasses =
    size === 'xs'
      ? 'px-2 py-0.5 text-[10px] gap-1'
      : size === 'md'
      ? 'px-3 py-1 text-xs gap-1.5'
      : 'px-2.5 py-0.5 text-[11px] gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClasses} ${className}`}
    >
      <Icon className={size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{cfg.label}</span>
    </span>
  );
};

export default SupportStatusBadge;
