'use client';

import { useState } from 'react';
import { Tag, CheckCircle } from 'lucide-react';
import { MockCouponService } from '@src/mocks/services/MockCouponService';
import { Button } from '@src/shared/ui/Button';
import type { IAplicacionCupon } from '@src/core/models';

interface CouponInputProps {
  subtotal: number;
  onApply: (result: IAplicacionCupon) => void;
  appliedCoupon: IAplicacionCupon | null;
  onRemove: () => void;
}

export function CouponInput({ subtotal, onApply, appliedCoupon, onRemove }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    if (!code.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await MockCouponService.applyCoupon(code.trim(), subtotal);
      if (result.valid) {
        onApply(result);
        setCode('');
      } else {
        setError(result.errorMessage ?? 'Cupón inválido.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (appliedCoupon?.valid) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-green-700">
          <CheckCircle size={16} />
          <span>
            Cupón <strong>{appliedCoupon.codigo}</strong> aplicado — {appliedCoupon.porcentaje}% de descuento
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-green-600 font-medium hover:underline ml-2 shrink-0"
        >
          Quitar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Código de cupón"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            className="h-10 w-full rounded-xl border border-[var(--color-border)] bg-white pl-9 pr-3 text-sm uppercase text-[var(--color-text-primary)] placeholder:normal-case placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          />
        </div>
        <Button size="sm" variant="outline" isLoading={isLoading} onClick={handleApply} disabled={!code.trim()}>
          Aplicar
        </Button>
      </div>
      {error && <p className="text-xs text-[var(--color-danger)] font-medium">{error}</p>}
    </div>
  );
}
