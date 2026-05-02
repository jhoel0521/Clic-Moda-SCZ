'use client';

import { useAuthStore } from '@src/core/store/useAuthStore';

interface AdminHeaderProps {
  title: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-bold text-text-primary">{title}</h1>
      {user && (
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-text-muted">{user.email}</span>
          <div className="h-8 w-8 rounded-full bg-brand-subtle flex items-center justify-center">
            <span className="text-sm font-bold text-brand">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
