import React, { forwardRef, useId } from 'react';
import { Check } from 'lucide-react';

const Checkbox = forwardRef(({
  label,
  error,
  helperText,
  id,
  className = '',
  checked,
  onChange,
  disabled,
  ...props
}, ref) => {
  const autoId = useId();
  const generatedId = id || (typeof label === 'string' ? `checkbox-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : autoId);

  const isControlled = checked !== undefined;
  const inputProps = isControlled ? { checked } : {};

  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex items-center h-5">
        <input
          ref={ref}
          id={generatedId}
          type="checkbox"
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
          {...inputProps}
          {...props}
        />
        <label
          htmlFor={generatedId}
          className={`w-4 h-4 rounded-md border flex items-center justify-center cursor-pointer transition-all duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-black peer-focus-visible:ring-offset-2 peer-checked:bg-black peer-checked:border-black peer-checked:[&>svg]:opacity-100 bg-white border-brand-border hover:border-gray-400 ${
            isControlled && checked ? 'bg-black border-black [&>svg]:opacity-100' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Check className={`w-3 h-3 stroke-[3] text-white transition-opacity ${isControlled && checked ? 'opacity-100' : 'opacity-0'}`} />
        </label>
      </div>
      {label && (
        <div className="ml-2.5 text-sm">
          <label htmlFor={generatedId} className={`font-medium text-brand-navy cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {label}
          </label>
          {error && <p className="mt-0.5 text-xs text-brand-error font-medium">{error}</p>}
          {!error && helperText && <p className="mt-0.5 text-xs text-brand-text-secondary">{helperText}</p>}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
export default Checkbox;
