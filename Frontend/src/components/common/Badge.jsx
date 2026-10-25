import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full transition-all duration-150 shadow-2xs';

  const variants = {
    default: 'bg-slate-100 text-slate-800 border border-slate-200/90 shadow-inner-bevel',
    primary: 'bg-neutral-100 text-neutral-900 border border-neutral-300/80 shadow-inner-bevel',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-inner-bevel',
    warning: 'bg-amber-50 text-amber-900 border border-amber-200/80 shadow-inner-bevel',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200/80 shadow-inner-bevel',
    info: 'bg-sky-50 text-sky-800 border border-sky-200/80 shadow-inner-bevel',
    neutral: 'bg-neutral-900 text-white border border-neutral-800 shadow-sm',
    pink: 'bg-rose-50 text-brand-pink border border-rose-200/90 shadow-inner-bevel',
  };

  const dotColors = {
    default: 'bg-gray-400',
    primary: 'bg-black',
    success: 'bg-brand-success',
    warning: 'bg-brand-warning',
    danger: 'bg-brand-error',
    info: 'bg-sky-500',
    neutral: 'bg-white',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  return (
    <span className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.default}`} />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
