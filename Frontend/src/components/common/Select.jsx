import React, { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
  label,
  options = [],
  error,
  helperText,
  placeholder = 'Select an option',
  className = '',
  id,
  required,
  ...props
}, ref) => {
  const autoId = useId();
  const generatedId = id || (typeof label === 'string' ? `select-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : autoId);

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
      <div className="relative">
        <select
          ref={ref}
          id={generatedId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${generatedId}-error` : helperText ? `${generatedId}-helper` : undefined}
          className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-brand-navy transition-all duration-150 appearance-none pr-10 focus-visible:outline-none focus:ring-2 cursor-pointer ${
            error
              ? 'border-brand-error focus:border-brand-error focus:ring-brand-error/20 bg-red-50/10'
              : 'border-brand-border hover:border-gray-400 focus:border-black focus:ring-black/20'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const value = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={value} value={value}>
                {optLabel}
              </option>
            );
          })}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
          <ChevronDown className="w-4 h-4" />
        </div>
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

Select.displayName = 'Select';
export default Select;
