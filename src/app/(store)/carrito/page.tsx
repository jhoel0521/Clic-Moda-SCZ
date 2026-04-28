import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@src/routes';

export const metadata: Metadata = {
  title: 'Carrito — Clic Moda SCZ',
  description: 'Revisá los productos que agregaste antes de continuar al checkout.',
};

export default function CartPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-16 text-center">
      <div className="max-w-2xl rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-12 shadow-[var(--shadow-md)]">
        <p className="mb-3 inline-flex rounded-full bg-[var(--color-brand-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)]">
          Carrito
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text-primary)]">
          Tu carrito está vacío
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[var(--color-text-secondary)]">
          Cuando agregues productos desde el catálogo, van a aparecer acá para revisar cantidades y avanzar al checkout.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href={ROUTES.CATALOG} className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--gradient-brand)] px-6 font-semibold text-white shadow-[var(--shadow-brand)] transition-transform hover:-translate-y-0.5">
            Ir al catálogo
          </Link>
          <Link href={ROUTES.HOME} className="inline-flex h-12 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-6 font-semibold text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}