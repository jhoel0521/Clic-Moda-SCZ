'use client';

import { useEffect, useState } from 'react';

interface FlashSaleTimerProps {
  endsAt: string;
  variant?: 'default' | 'inline';
}

function getTimeLeft(endsAt: string) {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  return {
    h: Math.floor(totalSeconds / 3600),
    m: Math.floor((totalSeconds % 3600) / 60),
    s: totalSeconds % 60,
    expired: diff === 0,
  };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function FlashSaleTimer({ endsAt, variant = 'default' }: FlashSaleTimerProps) {
  const [time, setTime] = useState(() => getTimeLeft(endsAt));

  useEffect(() => {
    if (time.expired) return;
    const id = setInterval(() => {
      const next = getTimeLeft(endsAt);
      setTime(next);
      if (next.expired) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt, time.expired]);

  if (time.expired) {
    return (
      <span className={variant === 'inline'
        ? 'font-mono bg-black/20 px-3 py-1.5 rounded-lg font-bold tracking-widest ml-2 text-white'
        : 'inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-1.5 text-sm font-semibold text-[var(--color-text-muted)]'
      }>
        Finalizada
      </span>
    );
  }

  if (variant === 'inline') {
    return (
      <span className="font-mono bg-black/20 px-3 py-1.5 rounded-lg font-bold tracking-widest ml-2 text-white">
        {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border-brand)] bg-[var(--color-brand-subtle)] px-4 py-1.5">
      {[
        { value: time.h, label: 'h' },
        { value: time.m, label: 'm' },
        { value: time.s, label: 's' },
      ].map(({ value, label }, i) => (
        <span key={label} className="flex items-baseline gap-0.5">
          {i > 0 && <span className="mx-0.5 font-bold text-[var(--color-brand)]">:</span>}
          <span className="font-mono text-lg font-bold text-[var(--color-brand)]">{pad(value)}</span>
          <span className="text-[10px] font-semibold uppercase text-[var(--color-brand)] opacity-70">{label}</span>
        </span>
      ))}
    </div>
  );
}
