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
        'flex w-full items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-150',
        selected
          ? 'border-brand bg-brand-subtle'
          : 'border-border hover:border-border-hover bg-white',
      ].join(' ')}
    >
      <span className="mt-0.5 shrink-0 text-2xl">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${selected ? 'text-brand' : 'text-text-primary'}`}>
          {label}
        </p>
        {description && <p className="text-text-muted mt-0.5 text-xs">{description}</p>}
      </div>
      <div
        className={[
          'mt-1 h-4 w-4 shrink-0 rounded-full border-2 transition-colors',
          selected ? 'border-brand bg-brand' : 'border-border',
        ].join(' ')}
      />
    </button>
  );
}
