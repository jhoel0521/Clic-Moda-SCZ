import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MockProductService } from '@src/mocks/services/MockProductService';
import { ROUTES } from '@src/routes';

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await MockProductService.getProductBySlug(slug);

  if (!product) {
    return { title: 'Producto no encontrado — Clic Moda SCZ' };
  }

  return {
    title: `${product.name} — Clic Moda SCZ`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await MockProductService.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];
  const gallery = product.images.slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-14">
      <div className="mb-10 text-center">
        <Link href={ROUTES.CATALOG} className="text-sm font-medium text-[var(--color-brand)] hover:underline">
          ← Volver al catálogo
        </Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
        <section className="space-y-4">
          <div className="overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)]">
            <div className="relative aspect-[4/5] bg-[var(--color-surface-raised)]">
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.alt}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
              ) : null}
            </div>
          </div>

          {gallery.length > 1 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {gallery.map((image, index) => (
                <div key={image.id} className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="160px"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-8 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-md)]">
          <div className="space-y-4 text-center lg:text-left">
            <div className="inline-flex rounded-full bg-[var(--color-brand-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)]">
              {product.category}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text-primary)]">
              {product.name}
            </h1>
            <p className="text-base leading-7 text-[var(--color-text-secondary)]">
              {product.description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Precio', value: `Bs. ${product.price}` },
              { label: 'Stock', value: `${product.stock} unidades` },
              { label: 'Tela', value: product.tipo_tela ?? 'No especificada' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-[var(--color-border)] bg-white p-4 text-center shadow-[var(--shadow-sm)]">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{item.label}</p>
                <p className="mt-2 text-lg font-bold text-[var(--color-text-primary)]">{item.value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Tallas disponibles</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <span key={size} className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--color-text-secondary)]">
                  {size}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Medidas dinámicas</p>
            <div className="space-y-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 text-sm text-[var(--color-text-secondary)]">
              {Object.entries(product.medidas_dinamicas).map(([size, medidas]) => (
                <div key={size} className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
                  <span className="font-semibold text-[var(--color-text-primary)]">{size}</span>
                  <span className="text-right">{String(medidas)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <button type="button" className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--gradient-brand)] px-6 font-semibold text-white shadow-[var(--shadow-brand)] transition-transform hover:-translate-y-0.5">
              Añadir al carrito
            </button>
            <button type="button" className="inline-flex h-12 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-6 font-semibold text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]">
              Consultar por WhatsApp
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}