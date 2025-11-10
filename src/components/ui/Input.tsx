// Input component
// Reusable text input with consistent styling

import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Input component
 * Pure presentational component with Tailwind styling
 */
export function Input({ label, error, helperText, className = '', id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  const baseStyles =
    'block w-full rounded-lg border px-4 py-2 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const stateStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <input id={inputId} className={`${baseStyles} ${stateStyles} ${className}`} {...props} />

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}
