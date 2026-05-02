import { Loader2 } from 'lucide-react';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface SpinnerProps {
  size?: SpinnerSize;
  label?: string;
  className?: string;
}

const sizeMap: Record<SpinnerSize, number> = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 32,
  xl: 48,
};

export function Spinner({ size = 'md', label, className = '' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label ?? 'Cargando…'}
      className={`inline-flex flex-col items-center gap-3 ${className}`}
    >
      <Loader2 size={sizeMap[size]} className="text-brand animate-spin" aria-hidden="true" />
      {label && <span className="text-text-muted text-sm">{label}</span>}
    </div>
  );
}

/** Spinner de pantalla completa para carga de páginas */
export function PageSpinner({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner size="xl" label={label} />
    </div>
  );
}
