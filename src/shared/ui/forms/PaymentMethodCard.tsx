interface PaymentMethodCardProps {
  value: string;
  label: string;
  description?: string;
  icon: string;
  selected: boolean;
  onChange: (value: string) => void;
}

export function PaymentMethodCard({
  value,
  label,
  description,
  icon,
  selected,
  onChange,
}: PaymentMethodCardProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      aria-pressed={selected}
      className={[
        'w-full flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-150',
        selected
          ? 'border-[var(--color-brand)] bg-[var(--color-brand-subtle)]'
          : 'border-[var(--color-border)] bg-white hover:border-[var(--color-border-hover)]',
      ].join(' ')}
    >
      <span className="text-2xl mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold ${
            selected ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-primary)]'
          }`}
        >
          {label}
        </p>
        {description && (
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{description}</p>
        )}
      </div>
      <div
        className={[
          'mt-1 h-4 w-4 shrink-0 rounded-full border-2 transition-colors',
          selected
            ? 'border-[var(--color-brand)] bg-[var(--color-brand)]'
            : 'border-[var(--color-border)]',
        ].join(' ')}
      />
    </button>
  );
}
