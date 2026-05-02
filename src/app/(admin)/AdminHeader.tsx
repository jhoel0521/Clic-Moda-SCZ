'use client';

import { useAuthStore } from '@src/core/store/useAuthStore';

interface AdminHeaderProps {
  title: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="border-border bg-surface flex h-16 shrink-0 items-center justify-between border-b px-6">
      <h1 className="text-text-primary text-lg font-bold">{title}</h1>
      {user && (
        <div className="flex items-center gap-3">
          <span className="text-text-muted hidden text-sm sm:block">{user.email}</span>
          <div className="bg-brand-subtle flex h-8 w-8 items-center justify-center rounded-full">
            <span className="text-brand text-sm font-bold">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
