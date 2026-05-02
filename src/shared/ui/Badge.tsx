import type { OrderStatus } from '@src/core/constants/ORDER_STATUS';
import { ORDER_STATUS_LABELS } from '@src/core/constants/ORDER_STATUS';

type BadgeVariant = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  label?: string;
  children?: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  brand: 'bg-brand-subtle text-brand',
  success: 'bg-emerald-500/15 text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-400',
  danger: 'bg-red-500/15 text-danger',
  info: 'bg-sky-500/15 text-sky-400',
  neutral: 'bg-surface-raised text-text-secondary',
};

const dotClasses: Record<BadgeVariant, string> = {
  brand: 'bg-brand',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-danger',
  info: 'bg-sky-400',
  neutral: 'bg-text-muted',
};

export function Badge({
  label,
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClasses[variant]}`}
        />
      )}
      {label ?? children}
    </span>
  );
}

/** Mapa de estado de pedido a variante de badge */
const orderStatusVariantMap: Record<OrderStatus, BadgeVariant> = {
  PROCESADO: 'info',
  EN_PREPARACION: 'warning',
  LISTO_PARA_RECOGER: 'brand',
  ENVIANDO: 'brand',
  ENTREGADO: 'success',
};

/** Badge especializado para mostrar el estado de un pedido */
export function OrderStatusBadge({
  status,
  size = 'sm',
}: {
  status: OrderStatus;
  size?: BadgeSize;
}) {
  return (
    <Badge
      variant={orderStatusVariantMap[status]}
      size={size}
      dot
    >
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}
