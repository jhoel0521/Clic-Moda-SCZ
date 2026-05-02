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
        <label htmlFor={fieldId} className="text-text-primary block text-sm font-medium">
          {label}
        </label>
        <input
          ref={ref}
          id={fieldId}
          {...props}
          className={[
            'text-text-primary placeholder:text-text-muted w-full rounded-xl border bg-white px-4 py-3 text-sm transition-all focus:ring-2 focus:outline-none',
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
        {hint && !error && <p className="text-text-muted text-xs">{hint}</p>}
      </div>
    );
  }
);
FormField.displayName = 'FormField';
