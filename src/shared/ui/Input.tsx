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
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-text-primary select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-text-muted pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            type={inputType}
            className={[
              'w-full rounded-xl border bg-surface text-text-primary',
              'placeholder:text-text-muted text-sm h-10',
              'transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-danger focus:ring-danger'
                : 'border-border hover:border-border-hover',
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
              className="absolute right-3 text-text-muted hover:text-text-secondary transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}

          {!isPassword && rightIcon && (
            <span className="absolute right-3 text-text-muted pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p className="flex items-center gap-1.5 text-xs text-danger" role="alert">
            <AlertCircle size={12} className="shrink-0" />
            {error}
          </p>
        )}

        {!error && hint && (
          <p className="text-xs text-text-muted">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
