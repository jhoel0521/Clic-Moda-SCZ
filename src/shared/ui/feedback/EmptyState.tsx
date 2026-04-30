interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-20 text-center ${className}`}
    >
      {icon && <div className="mb-5 text-[var(--color-text-muted)]">{icon}</div>}
      <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--color-text-muted)] max-w-sm mb-8">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
