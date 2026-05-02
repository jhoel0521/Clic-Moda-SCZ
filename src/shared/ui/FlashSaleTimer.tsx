'use client';

import { useEffect, useState } from 'react';

interface FlashSaleTimerProps {
  endsAt: string;
  variant?: 'default' | 'inline';
}

function getTimeLeft(endsAt: string) {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);

  // Extraer unidades menores
  const s = totalSeconds % 60;
  const m = Math.floor(totalSeconds / 60) % 60;
  const h = Math.floor(totalSeconds / 3600) % 24;

  // Extraer unidades mayores
  const totalDays = Math.floor(totalSeconds / (3600 * 24));
  const Years = Math.floor(totalDays / 365);
  const remainingDaysAfterYears = totalDays % 365;
  const Months = Math.floor(remainingDaysAfterYears / 30); // Aproximación visual estándar
  const Days = remainingDaysAfterYears % 30;

  return { expired: diff === 0, Years, Months, Days, h, m, s };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function FlashSaleTimer({ endsAt, variant = 'default' }: FlashSaleTimerProps) {
  const [time, setTime] = useState(() => getTimeLeft(endsAt));

  useEffect(() => {
    if (time.expired) return;

    const id = setInterval(() => {
      const current = getTimeLeft(endsAt);
      setTime(current);
      if (current.expired) clearInterval(id);
    }, 1000);

    return () => clearInterval(id);
  }, [endsAt, time.expired]);

  if (time.expired) {
    return (
      <span className={variant === 'inline'
        ? 'font-mono bg-black/20 px-3 py-1.5 rounded-lg font-bold tracking-widest ml-2 text-white'
        : 'inline-flex items-center rounded-full border border-border bg-surface-raised px-4 py-1.5 text-sm font-semibold text-text-muted'
      }>
        Finalizada
      </span>
    );
  }

  // Lógica para mostrar los bloques solo si son necesarios
  const timeUnits = [];
  if (time.Years > 0) timeUnits.push({ value: time.Years, label: 'a' });
  if (time.Years > 0 || time.Months > 0) timeUnits.push({ value: time.Months, label: 'mes' });
  if (time.Years > 0 || time.Months > 0 || time.Days > 0) timeUnits.push({ value: time.Days, label: 'd' });

  // Horas, minutos y segundos siempre se muestran
  timeUnits.push({ value: time.h, label: 'h' });
  timeUnits.push({ value: time.m, label: 'm' });
  timeUnits.push({ value: time.s, label: 's' });

  // Renderizado para la variante "inline"
  if (variant === 'inline') {
    const inlinePrefix = [
      time.Years > 0 ? `${time.Years}a` : null,
      (time.Years > 0 || time.Months > 0) ? `${time.Months}m` : null,
      (time.Years > 0 || time.Months > 0 || time.Days > 0) ? `${time.Days}d` : null,
    ].filter(Boolean).join(' ');

    return (
      <span className="font-mono bg-black/20 px-3 py-1.5 rounded-lg font-bold tracking-widest ml-2 text-white">
        {inlinePrefix && `${inlinePrefix} - `}
        {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
      </span>
    );
  }

  // Renderizado para la variante "default"
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-brand bg-brand-subtle px-4 py-1.5">
      {timeUnits.map(({ value, label }, i) => (
        <span key={label} className="flex items-baseline gap-0.5">
          {i > 0 && <span className="mx-0.5 font-bold text-brand">:</span>}
          <span className="font-mono text-lg font-bold text-brand">{pad(value)}</span>
          <span className="text-[10px] font-semibold uppercase text-brand opacity-70">{label}</span>
        </span>
      ))}
    </div>
  );
}