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
      <span
        className={
          variant === 'inline'
            ? 'ml-2 rounded-lg bg-black/20 px-3 py-1.5 font-mono font-bold tracking-widest text-white'
            : 'border-border bg-surface-raised text-text-muted inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold'
        }
      >
        Finalizada
      </span>
    );
  }

  // Lógica para mostrar los bloques solo si son necesarios
  const timeUnits = [];
  if (time.Years > 0) timeUnits.push({ value: time.Years, label: 'a' });
  if (time.Years > 0 || time.Months > 0) timeUnits.push({ value: time.Months, label: 'mes' });
  if (time.Years > 0 || time.Months > 0 || time.Days > 0)
    timeUnits.push({ value: time.Days, label: 'd' });

  // Horas, minutos y segundos siempre se muestran
  timeUnits.push({ value: time.h, label: 'h' });
  timeUnits.push({ value: time.m, label: 'm' });
  timeUnits.push({ value: time.s, label: 's' });

  // Renderizado para la variante "inline"
  if (variant === 'inline') {
    const inlinePrefix = [
      time.Years > 0 ? `${time.Years}a` : null,
      time.Years > 0 || time.Months > 0 ? `${time.Months}m` : null,
      time.Years > 0 || time.Months > 0 || time.Days > 0 ? `${time.Days}d` : null,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span className="ml-2 rounded-lg bg-black/20 px-3 py-1.5 font-mono font-bold tracking-widest text-white">
        {inlinePrefix && `${inlinePrefix} - `}
        {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
      </span>
    );
  }

  // Renderizado para la variante "default"
  return (
    <div className="border-brand bg-brand-subtle inline-flex items-center gap-1 rounded-full border px-4 py-1.5">
      {timeUnits.map(({ value, label }, i) => (
        <span key={label} className="flex items-baseline gap-0.5">
          {i > 0 && <span className="text-brand mx-0.5 font-bold">:</span>}
          <span className="text-brand font-mono text-lg font-bold">{pad(value)}</span>
          <span className="text-brand text-[10px] font-semibold uppercase opacity-70">{label}</span>
        </span>
      ))}
    </div>
  );
}
