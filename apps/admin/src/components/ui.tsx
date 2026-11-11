import {
  useId,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';
import type { IconName } from '../lib/icons';
import Icon from './Icon';

// Piezas de interfaz compartidas. Móvil primero: objetivos táctiles de 48 px, texto de 16 px (Safari no
// hace zoom al enfocar), esquinas amplias y foco visible global.
const BUTTON_STYLES = {
  primary: 'bg-action text-on-action shadow-brand hover:bg-action-hover active:scale-[0.98]',
  secondary: 'border border-border bg-surface text-text hover:bg-hover active:bg-hover',
  danger: 'bg-danger text-on-action hover:opacity-90 active:scale-[0.98]',
  ghost: 'text-action hover:bg-tint',
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof BUTTON_STYLES;
  icon?: IconName;
  block?: boolean;
};

const BUTTON_BASE =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none';

export function Button({ variant = 'primary', icon, block, className = '', children, ...props }: ButtonProps) {
  const style = `${BUTTON_BASE} ${BUTTON_STYLES[variant]} ${block ? 'w-full' : ''} ${className}`;
  return (
    <button type="button" {...props} className={style}>
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconName;
  label: string;
  tone?: 'default' | 'danger';
};

// Botón de solo ícono de 48 px: el nombre accesible va en `label`.
export function IconButton({ icon, label, tone = 'default', className = '', ...props }: IconButtonProps) {
  const color = tone === 'danger' ? 'text-danger hover:bg-red-50' : 'text-text hover:bg-hover';
  const style = `inline-flex size-12 items-center justify-center rounded-xl transition disabled:opacity-40 ${color} ${className}`;
  return (
    <button type="button" aria-label={label} title={label} {...props} className={style}>
      <Icon name={icon} />
    </button>
  );
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

const INPUT_BASE = 'min-h-12 w-full rounded-xl border bg-surface px-4 text-base';
const inputClass = (error: string | null | undefined, extra: string): string =>
  `${INPUT_BASE} ${error ? 'border-danger' : 'border-border'} ${extra}`;

// Campo con etiqueta, ayuda y error asociados al input para lectores de pantalla.
export function Field({ label, error, hint, className = '', ...props }: FieldProps) {
  const id = useId();
  const described = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ');
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
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
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
        className={inputClass(error, 'select-field')}
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

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`border-line bg-surface shadow-card rounded-2xl border ${className}`}>{children}</div>;
}

const BADGES = {
  success: 'bg-green-50 text-success',
  warning: 'bg-amber-50 text-warning',
  neutral: 'bg-hover text-muted',
  brand: 'bg-tint text-action',
} as const;

export function Badge({ tone = 'neutral', children }: { tone?: keyof typeof BADGES; children: ReactNode }) {
  const style = `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${BADGES[tone]}`;
  return <span className={style}>{children}</span>;
}

export function ErrorBanner({ children }: { children: ReactNode }) {
  const style = 'flex items-start gap-3 rounded-2xl border border-danger bg-surface p-4 font-medium text-danger';
  return (
    <div role="alert" className={style}>
      <Icon name="alert" className="mt-0.5 size-5 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

interface EmptyProps {
  title: string;
  icon?: IconName;
  children?: ReactNode;
}

export function EmptyState({ title, icon = 'inbox', children }: EmptyProps) {
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <span className="bg-tint text-action flex size-14 items-center justify-center rounded-full">
        <Icon name={icon} className="size-7" />
      </span>
      <p className="text-lg font-semibold">{title}</p>
      {children}
    </Card>
  );
}

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string; // nombre accesible, p. ej. "Producto activo"
  disabled?: boolean;
}

// Interruptor de encendido/apagado: habilita o deshabilita un registro con un toque. El área táctil es de 48×64 px.
export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  const track = checked ? 'bg-success' : 'bg-border';
  const knob = checked ? 'translate-x-7' : 'translate-x-1';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex h-12 w-16 shrink-0 items-center justify-center disabled:opacity-50"
    >
      <span className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${track}`}>
        <span className={`inline-block size-6 rounded-full bg-white shadow transition-transform ${knob}`} />
      </span>
    </button>
  );
}
