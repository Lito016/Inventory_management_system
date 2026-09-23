import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-error-600 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-sm border px-3 py-2 text-sm text-gray-800
              placeholder:text-gray-400 transition-colors
              focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500
              disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
              ${error ? 'border-error-500' : 'border-gray-300'}
              ${prefix ? 'pl-7' : ''}
              ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-error-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
