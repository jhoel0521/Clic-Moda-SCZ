'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '@src/shared/ui/Modal';
import { Input } from '@src/shared/ui/Input';
import { Button } from '@src/shared/ui/Button';
import { MockProductService } from '@src/mocks/services/MockProductService';
import type { IProduct, Talla } from '@src/core/models';

const CATEGORIAS = ['vestidos', 'blusas', 'pantalones', 'conjuntos', 'chaquetas', 'faldas', 'accesorios'];
const TALLAS_DISPONIBLES: Talla[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const productSchema = z.object({
  name: z.string().min(2, { message: 'Nombre requerido' }),
  description: z.string().min(5, { message: 'Descripción requerida' }),
  price: z.coerce.number().positive({ message: 'Precio inválido' }),
  originalPrice: z.coerce.number().optional(),
  category: z.string().min(1, { message: 'Categoría requerida' }),
  stock: z.coerce.number().int().nonnegative({ message: 'Stock inválido' }),
  tipo_tela: z.string().optional(),
  estado: z.enum(['activo', 'inactivo']),
  colors: z.string().optional(),
});

type ProductFormInput = z.input<typeof productSchema>;
type ProductFormData = z.output<typeof productSchema>;

interface MedidaRow { size: string; medidas: string }
interface ImageRow { url: string; alt: string; isPrimary: boolean }

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: IProduct;
  onSaved: (product: IProduct) => void;
}

export function ProductForm({ isOpen, onClose, product, onSaved }: ProductFormProps) {
  const isEdit = Boolean(product);
  const [selectedSizes, setSelectedSizes] = useState<Talla[]>(product?.sizes ?? []);
  const [medidas, setMedidas] = useState<MedidaRow[]>(
    product ? Object.entries(product.medidas_dinamicas).map(([size, m]) => ({ size, medidas: String(m) })) : []
  );
  const [images, setImages] = useState<ImageRow[]>(
    product?.images.map((img) => ({ url: img.url, alt: img.alt, isPrimary: img.isPrimary ?? false })) ?? []
  );

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProductFormInput, unknown, ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      price: product?.price ?? 0,
      originalPrice: product?.originalPrice,
      category: product?.category ?? '',
      stock: product?.stock ?? 0,
      tipo_tela: product?.tipo_tela ?? '',
      estado: product?.estado ?? 'activo',
      colors: product?.colors.join(', ') ?? '',
    },
  });

  function toggleSize(size: Talla) {
    setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
  }

  async function onSubmit(data: ProductFormData) {
    const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const colors = data.colors ? data.colors.split(',').map((c) => c.trim()).filter(Boolean) : [];
    const medidas_dinamicas = Object.fromEntries(medidas.filter((m) => m.size).map((m) => [m.size, m.medidas]));
    const productImages = images.map((img, i) => ({ id: `img_${Date.now()}_${i}`, ...img }));

    const saved: IProduct = {
      id: product?.id ?? `prod_${Date.now()}`,
      slug: product?.slug ?? slug,
      name: data.name,
      description: data.description,
      price: data.price,
      originalPrice: data.originalPrice || undefined,
      category: data.category,
      stock: data.stock,
      tipo_tela: data.tipo_tela || undefined,
      estado: data.estado,
      sizes: selectedSizes,
      colors,
      medidas_dinamicas,
      images: productImages,
      tags: product?.tags ?? [],
      isFlashSale: product?.isFlashSale ?? false,
      flashSaleEndsAt: product?.flashSaleEndsAt,
      rating: product?.rating,
      reviewCount: product?.reviewCount,
      createdAt: product?.createdAt ?? new Date().toISOString(),
    };

    if (isEdit) {
      await MockProductService.updateProduct(saved);
    } else {
      await MockProductService.addProduct(saved);
    }
    onSaved(saved);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar producto' : 'Nuevo producto'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nombre" error={errors.name?.message} {...register('name')} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">Categoría</label>
            <select className="h-10 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]" {...register('category')}>
              <option value="">Seleccionar...</option>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.category.message}</p>}
          </div>
          <Input label="Precio (Bs.)" type="number" step="0.01" error={errors.price?.message} {...register('price')} />
          <Input label="Precio original (Bs., opcional)" type="number" step="0.01" {...register('originalPrice')} />
          <Input label="Stock" type="number" error={errors.stock?.message} {...register('stock')} />
          <Input label="Tipo de tela (opcional)" placeholder="Algodón, Poliéster..." {...register('tipo_tela')} />
          <Input label="Colores (separados por coma)" placeholder="Rosa, Negro, Blanco" {...register('colors')} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">Estado</label>
            <select className="h-10 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]" {...register('estado')}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">Descripción</label>
          <textarea rows={2} className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]" {...register('description')} />
          {errors.description && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.description.message}</p>}
        </div>

        {/* Tallas */}
        <div>
          <p className="mb-2 text-sm font-medium text-[var(--color-text-primary)]">Tallas disponibles</p>
          <div className="flex flex-wrap gap-2">
            {TALLAS_DISPONIBLES.map((size) => (
              <button key={size} type="button" onClick={() => toggleSize(size)}
                className={['rounded-lg border px-3 py-1.5 text-xs font-medium transition-all', selectedSizes.includes(size) ? 'border-[var(--color-brand)] bg-[var(--color-brand-subtle)] text-[var(--color-brand)]' : 'border-[var(--color-border)] bg-white text-[var(--color-text-secondary)]'].join(' ')}>
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Medidas dinámicas */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">Medidas por talla</p>
            <button type="button" onClick={() => setMedidas((m) => [...m, { size: '', medidas: '' }])}
              className="text-xs text-[var(--color-brand)] font-medium hover:underline flex items-center gap-1">
              <Plus size={12} /> Agregar fila
            </button>
          </div>
          <div className="space-y-2">
            {medidas.map((row, i) => (
              <div key={i} className="flex gap-2">
                <input placeholder="Talla (ej: S)" value={row.size} onChange={(e) => setMedidas((m) => m.map((r, j) => j === i ? { ...r, size: e.target.value } : r))}
                  className="w-24 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]" />
                <input placeholder="Medidas (ej: Largo: 90cm | Busto: 80cm)" value={row.medidas} onChange={(e) => setMedidas((m) => m.map((r, j) => j === i ? { ...r, medidas: e.target.value } : r))}
                  className="flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]" />
                <button type="button" onClick={() => setMedidas((m) => m.filter((_, j) => j !== i))}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Imágenes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">Imágenes (URLs)</p>
            <button type="button" onClick={() => setImages((imgs) => [...imgs, { url: '', alt: '', isPrimary: imgs.length === 0 }])}
              className="text-xs text-[var(--color-brand)] font-medium hover:underline flex items-center gap-1">
              <Plus size={12} /> Agregar
            </button>
          </div>
          <div className="space-y-2">
            {images.map((img, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input placeholder="URL de imagen" value={img.url} onChange={(e) => setImages((imgs) => imgs.map((r, j) => j === i ? { ...r, url: e.target.value } : r))}
                  className="flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]" />
                <input placeholder="Alt" value={img.alt} onChange={(e) => setImages((imgs) => imgs.map((r, j) => j === i ? { ...r, alt: e.target.value } : r))}
                  className="w-32 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]" />
                <label className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] shrink-0 cursor-pointer">
                  <input type="checkbox" checked={img.isPrimary} onChange={() => setImages((imgs) => imgs.map((r, j) => ({ ...r, isPrimary: j === i })))} />
                  Principal
                </label>
                <button type="button" onClick={() => setImages((imgs) => imgs.filter((_, j) => j !== i))}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
          {isEdit ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </form>
    </Modal>
  );
}
