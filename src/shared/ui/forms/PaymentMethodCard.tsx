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
          ? 'border-brand bg-brand-subtle'
          : 'border-border bg-white hover:border-border-hover',
      ].join(' ')}
    >
      <span className="text-2xl mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold ${
            selected ? 'text-brand' : 'text-text-primary'
          }`}
        >
          {label}
        </p>
        {description && (
          <p className="mt-0.5 text-xs text-text-muted">{description}</p>
        )}
      </div>
      <div
        className={[
          'mt-1 h-4 w-4 shrink-0 rounded-full border-2 transition-colors',
          selected
            ? 'border-brand bg-brand'
            : 'border-border',
        ].join(' ')}
      />
    </button>
  );
}
