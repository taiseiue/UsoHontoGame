import type React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

/**
 * Button component - Reusable button with variants
 * Pure presentational component (no logic)
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus-visible:ring-gray-600',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
    ghost: 'hover:bg-gray-100 hover:text-gray-900',
  };

  const sizeStyles = {
    sm: 'h-10 px-3 text-sm', // 40px - mobile-friendly minimum
    md: 'h-11 px-6 text-base', // 44px - WCAG touch target guideline
    lg: 'h-14 px-8 text-lg', // 56px - extra comfortable
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
