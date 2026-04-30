'use client';

import { useState } from 'react';
import { ShoppingCart, MessageCircle, Minus, Plus } from 'lucide-react';
import { useCartStore } from '@src/core/store/useCartStore';
import { toast } from '@src/core/store/useToastStore';
import { Button } from '@src/shared/ui/Button';
import type { IProduct, Talla } from '@src/core/models';

const WA_NUMBER = '59177000001';

interface AddToCartPanelProps {
  product: IProduct;
}

export function AddToCartPanel({ product }: AddToCartPanelProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedSize, setSelectedSize] = useState<Talla | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];
  const canAdd = selectedSize !== null && selectedColor !== null;

  function handleAddToCart() {
    if (!canAdd) return;
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: primaryImage?.url ?? '',
      price: product.price,
      quantity: qty,
      selectedSize: selectedSize!,
      selectedColor: selectedColor!,
    });
    toast.success(`¡${product.name} agregado al carrito!`);
  }

  const waMsg = encodeURIComponent(
    `Hola! Me interesa "${product.name}"${selectedSize ? `, talla ${selectedSize}` : ''}${selectedColor ? `, color ${selectedColor}` : ''}. ¿Está disponible?`,
  );

  return (
    <div className="space-y-6">
      {/* Precio */}
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-bold text-[var(--color-text-primary)]">Bs. {product.price}</span>
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="text-xl line-through text-[var(--color-text-muted)]">Bs. {product.originalPrice}</span>
        )}
        {product.isFlashSale && (
          <span className="rounded-full bg-[var(--gradient-brand)] px-2 py-0.5 text-xs font-bold text-white">FLASH</span>
        )}
      </div>

      {/* Tallas */}
      <div>
        <p className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
          Talla {selectedSize && <span className="text-[var(--color-brand)]">— {selectedSize}</span>}
        </p>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={[
                'rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all duration-150',
                selectedSize === size
                  ? 'border-[var(--color-brand)] bg-[var(--color-brand-subtle)] text-[var(--color-brand)]'
                  : 'border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]',
              ].join(' ')}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colores */}
      {product.colors.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
            Color {selectedColor && <span className="text-[var(--color-brand)]">— {selectedColor}</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={[
                  'rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all duration-150',
                  selectedColor === color
                    ? 'border-[var(--color-brand)] bg-[var(--color-brand-subtle)] text-[var(--color-brand)]'
                    : 'border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]',
                ].join(' ')}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cantidad */}
      <div>
        <p className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Cantidad</p>
        <div className="inline-flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white p-1">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-bold text-[var(--color-text-primary)]">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        <span className="ml-3 text-xs text-[var(--color-text-muted)]">{product.stock} disponibles</span>
      </div>

      {!canAdd && (
        <p className="text-xs text-[var(--color-warning)] font-medium">
          Selecciona talla y color para continuar
        </p>
      )}

      {/* Acciones */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canAdd}
          onClick={handleAddToCart}
          leftIcon={<ShoppingCart size={18} />}
        >
          Añadir al carrito
        </Button>
        <a
          href={`https://wa.me/${WA_NUMBER}?text=${waMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[var(--color-border)] bg-white px-5 text-sm font-semibold text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
        >
          <MessageCircle size={18} />
          Consultar por WhatsApp
        </a>
      </div>
    </div>
  );
}
