import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '', message }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`} role="status" aria-live="polite">
      <div
        className={`${sizes[size] || sizes.md} rounded-full border-gray-200 border-t-brand-pink animate-spin`}
      />
      <span className="sr-only">Loading...</span>
      {message && <p className="mt-3 text-xs font-semibold text-brand-text-secondary tracking-wide uppercase">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
