import React, { forwardRef, useId } from 'react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  type = 'text',
  className = '',
  id,
  required,
  icon: Icon,
  rightElement,
  ...props
}, ref) => {
  const autoId = useId();
  const generatedId = id || (typeof label === 'string' ? `input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : autoId);

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
      <div className="relative rounded-xl">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={generatedId}
          type={type}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${generatedId}-error` : helperText ? `${generatedId}-helper` : undefined}
          className={`w-full ${Icon ? 'pl-10' : 'px-4'} ${rightElement ? 'pr-11' : ''} py-2.5 bg-white border rounded-xl text-sm text-brand-navy placeholder-gray-400 transition-all duration-150 focus-visible:outline-none focus:ring-2 ${
            error
              ? 'border-brand-error focus:border-brand-error focus:ring-brand-error/20 bg-red-50/10'
              : 'border-brand-border hover:border-gray-400 focus:border-black focus:ring-black/20'
          } ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
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

Input.displayName = 'Input';
export default Input;
