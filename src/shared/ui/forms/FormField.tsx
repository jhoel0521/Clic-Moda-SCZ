import { forwardRef, type InputHTMLAttributes } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        <label htmlFor={fieldId} className="block text-sm font-medium text-text-primary">
          {label}
        </label>
        <input
          ref={ref}
          id={fieldId}
          {...props}
          className={[
            'w-full rounded-xl border bg-white px-4 py-3 text-sm text-text-primary placeholder:text-text-muted transition-all focus:outline-none focus:ring-2',
            error
              ? 'border-red-400 focus:ring-red-200'
              : 'border-border focus:ring-brand focus:border-brand',
            className,
          ].join(' ')}
        />
        {error && (
          <p role="alert" className="flex items-center gap-1 text-xs text-red-600">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-text-muted">{hint}</p>
        )}
      </div>
    );
  },
);
FormField.displayName = 'FormField';
