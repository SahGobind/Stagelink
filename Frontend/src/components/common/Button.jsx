import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.985] active:translate-y-0.5 relative overflow-hidden';

  const variants = {
    primary: 'bg-neutral-950 hover:bg-black text-white shadow-3d-button hover:shadow-3d-card-hover border border-neutral-800/90 hover:border-neutral-700 focus-visible:ring-black',
    pink: 'bg-brand-pink hover:bg-brand-pink-hover text-white shadow-3d-button-pink hover:shadow-3d-pink border border-rose-400/40 focus-visible:ring-brand-pink',
    secondary: 'bg-white hover:bg-neutral-50/90 text-neutral-900 border border-neutral-200/90 shadow-3d-subtle hover:border-neutral-300 hover:shadow-md focus-visible:ring-neutral-900',
    outline: 'border border-neutral-900/90 text-neutral-900 hover:bg-neutral-900 hover:text-white shadow-xs hover:shadow-sm focus-visible:ring-black',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md border border-red-500/40 focus-visible:ring-red-600',
    ghost: 'text-neutral-700 hover:text-black hover:bg-neutral-100/80 focus-visible:ring-neutral-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-semibold gap-1.5',
    md: 'px-4 py-2.5 text-sm font-semibold gap-2',
    lg: 'px-6 py-3.5 text-base font-bold gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
};

export default Button;
