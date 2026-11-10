import {
  useId,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';

// Piezas de interfaz compartidas. Objetivos táctiles de 44 px (min-h-11) y foco visible global.
const BUTTON_STYLES = {
  primary: 'bg-action text-on-action hover:bg-action-hover',
  secondary: 'border border-border bg-surface text-text hover:bg-line',
  danger: 'bg-danger text-on-action hover:opacity-90',
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof BUTTON_STYLES;
};

const BUTTON_BASE =
  'min-h-11 rounded-lg px-4 font-semibold disabled:cursor-not-allowed disabled:opacity-60';

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const style = `${BUTTON_BASE} ${BUTTON_STYLES[variant]} ${className}`;
  return <button type="button" {...props} className={style} />;
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  hint?: string;
}

function FieldMessage({ id, text, alert }: { id: string; text?: string | null; alert?: boolean }) {
  if (!text) return null;
  const color = alert ? 'font-medium text-danger' : 'text-muted';
  return (
    <p id={id} role={alert ? 'alert' : undefined} className={`text-sm ${color}`}>
      {text}
    </p>
  );
}

const inputClass = (error: string | null | undefined, extra: string): string =>
  `min-h-11 rounded-lg border bg-surface px-3 ${error ? 'border-danger' : 'border-border'} ${extra}`;

// Campo con etiqueta, ayuda y error asociados al input para lectores de pantalla.
export function Field({ label, error, hint, className = '', ...props }: FieldProps) {
  const id = useId();
  const described = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ');
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={described || undefined}
        {...props}
        className={inputClass(error, className)}
      />
      <FieldMessage id={`${id}-hint`} text={hint} />
      <FieldMessage id={`${id}-error`} text={error} alert />
    </div>
  );
}

export function ErrorBanner({ children }: { children: ReactNode }) {
  const style = 'rounded-lg border border-danger bg-surface p-3 font-medium text-danger';
  return (
    <p role="alert" className={style}>
      {children}
    </p>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="border-border bg-surface rounded-lg border border-dashed p-8 text-center">
      <p className="text-lg font-semibold">{title}</p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string | null;
  options: { value: string; label: string }[];
  placeholder?: string;
}

// Lista desplegable con etiqueta y error asociados, igual que Field.
export function SelectField({ label, error, options, placeholder, ...props }: SelectFieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-medium">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
        className={inputClass(error, '')}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldMessage id={`${id}-error`} text={error} alert />
    </div>
  );
}
