import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors duration-150';

  const variants = {
    default: 'bg-gray-100 text-black border border-gray-200',
    primary: 'bg-neutral-100 text-black border border-neutral-300',
    success: 'bg-green-50 text-brand-success border border-brand-success/20',
    warning: 'bg-amber-50 text-brand-warning border border-brand-warning/20',
    danger: 'bg-red-50 text-brand-error border border-brand-error/20',
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
    neutral: 'bg-black text-white',
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
