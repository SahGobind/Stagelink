import React, { forwardRef, useId } from 'react';

const Textarea = forwardRef(({
  label,
  error,
  helperText,
  rows = 4,
  className = '',
  id,
  required,
  ...props
}, ref) => {
  const autoId = useId();
  const generatedId = id || (typeof label === 'string' ? `textarea-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : autoId);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={generatedId}
          className="block text-xs font-semibold uppercase tracking-wider text-brand-navy"
        >
          {label} {required && <span className="text-brand-error">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={generatedId}
        rows={rows}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${generatedId}-error` : helperText ? `${generatedId}-helper` : undefined}
        className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-brand-navy placeholder-gray-400 transition-all duration-150 focus-visible:outline-none focus:ring-2 resize-y ${
          error
            ? 'border-brand-error focus:border-brand-error focus:ring-brand-error/20 bg-red-50/10'
            : 'border-brand-border hover:border-gray-400 focus:border-black focus:ring-black/20'
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={`${generatedId}-error`} className="text-xs text-brand-error font-medium flex items-center gap-1">
          <span>•</span> {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${generatedId}-helper`} className="text-xs text-brand-text-secondary">
          {helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
