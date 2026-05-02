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
    `Hola! Me interesa "${product.name}"${selectedSize ? `, talla ${selectedSize}` : ''}${selectedColor ? `, color ${selectedColor}` : ''}. ¿Está disponible?`
  );

  return (
    <div className="space-y-6">
      {/* Precio */}
      <div className="flex items-baseline gap-3">
        <span className="text-text-primary text-4xl font-bold">Bs. {product.price}</span>
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="text-text-muted text-xl line-through">Bs. {product.originalPrice}</span>
        )}
        {product.isFlashSale && (
          <span className="bg-gradient-brand rounded-full px-2 py-0.5 text-xs font-bold text-white">
            FLASH
          </span>
        )}
      </div>

      {/* Tallas */}
      <div>
        <p className="text-text-primary mb-3 text-sm font-semibold">
          Talla {selectedSize && <span className="text-brand">— {selectedSize}</span>}
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
                  ? 'border-brand bg-brand-subtle text-brand'
                  : 'border-border text-text-secondary hover:border-border-hover bg-white',
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
          <p className="text-text-primary mb-3 text-sm font-semibold">
            Color {selectedColor && <span className="text-brand">— {selectedColor}</span>}
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
                    ? 'border-brand bg-brand-subtle text-brand'
                    : 'border-border text-text-secondary hover:border-border-hover bg-white',
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
        <p className="text-text-primary mb-3 text-sm font-semibold">Cantidad</p>
        <div className="border-border inline-flex items-center gap-3 rounded-xl border bg-white p-1">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="text-text-secondary hover:bg-surface-hover flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          >
            <Minus size={16} />
          </button>
          <span className="text-text-primary w-8 text-center font-bold">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            className="text-text-secondary hover:bg-surface-hover flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        <span className="text-text-muted ml-3 text-xs">{product.stock} disponibles</span>
      </div>

      {!canAdd && (
        <p className="text-warning text-xs font-medium">Selecciona talla y color para continuar</p>
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
          className="border-border text-text-secondary hover:border-border-hover hover:text-text-primary inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 bg-white px-5 text-sm font-semibold transition-colors"
        >
          <MessageCircle size={18} />
          Consultar por WhatsApp
        </a>
      </div>
    </div>
  );
}
