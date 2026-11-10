'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Si true, agrega el toggle de mostrar/ocultar contraseña */
  isPassword?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      isPassword = false,
      type,
      id,
      className = '',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-text-primary text-sm font-medium select-none">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="text-text-muted pointer-events-none absolute left-3">{leftIcon}</span>
          )}

          <input
            ref={ref}
            id={id}
            type={inputType}
            className={[
              'bg-surface text-text-primary w-full rounded-xl border',
              'placeholder:text-text-muted h-10 text-sm',
              'transition-all duration-150',
              'focus:ring-brand focus:border-transparent focus:ring-2 focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error ? 'border-danger focus:ring-danger' : 'border-border hover:border-border-hover',
              leftIcon ? 'pl-10' : 'pl-4',
              isPassword || rightIcon ? 'pr-10' : 'pr-4',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-text-muted hover:text-text-secondary absolute right-3 transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}

          {!isPassword && rightIcon && (
            <span className="text-text-muted pointer-events-none absolute right-3">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p className="text-danger flex items-center gap-1.5 text-xs" role="alert">
            <AlertCircle size={12} className="shrink-0" />
            {error}
          </p>
        )}

        {!error && hint && <p className="text-text-muted text-xs">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
