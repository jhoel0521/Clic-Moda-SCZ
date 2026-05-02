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
      className={`border-border bg-surface flex flex-col items-center justify-center rounded-3xl border border-dashed px-6 py-20 text-center ${className}`}
    >
      {icon && <div className="text-text-muted mb-5">{icon}</div>}
      <h3 className="text-text-primary mb-2 text-lg font-bold">{title}</h3>
      {description && <p className="text-text-muted mb-8 max-w-sm text-sm">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
