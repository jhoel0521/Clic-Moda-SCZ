'use client';

import { uid } from '@src/shared/utils/uid';
import { CATEGORIAS, TALLAS_CALZADO, TALLAS_ROPA } from '@src/core/constants/CATALOG';
import { imageFileToDataUrl } from '@src/shared/utils/imageFile';
import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '@src/shared/ui/Modal';
import { Input } from '@src/shared/ui/Input';
import { Button } from '@src/shared/ui/Button';
import { ProductService } from '@src/services/ProductService';
import { EtiquetaService } from '@src/services/EtiquetaService';
import type { IProduct, IEtiqueta, Talla } from '@src/core/models';

const TALLAS_DISPONIBLES: Talla[] = [...TALLAS_CALZADO, ...TALLAS_ROPA];

const productSchema = z.object({
  name: z.string().min(2, { message: 'Nombre requerido' }),
  description: z.string().min(5, { message: 'Descripción requerida' }),
  price: z.number().positive({ message: 'Precio inválido' }),
  originalPrice: z.number().optional(),
  category: z.string().min(1, { message: 'Categoría requerida' }),
  tipo_tela: z.string().optional(),
  estado: z.enum(['activo', 'inactivo']),
  colors: z.string().optional(),
});

type ProductFormInput = z.input<typeof productSchema>;
type ProductFormData = z.output<typeof productSchema>;

interface MedidaRow {
  size: string;
  medidas: string;
}
interface ImageRow {
  id?: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

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
    product
      ? Object.entries(product.medidas_dinamicas).map(([size, m]) => ({ size, medidas: String(m) }))
      : []
  );
  const [images, setImages] = useState<ImageRow[]>(
    product?.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      isPrimary: img.isPrimary ?? false,
    })) ?? []
  );
  const [selectedEtiquetaIds, setSelectedEtiquetaIds] = useState<string[]>(
    product?.etiquetaIds ?? []
  );
  const [allEtiquetas, setAllEtiquetas] = useState<IEtiqueta[]>([]);
  const [matrix, setMatrix] = useState<Record<string, Record<string, number>>>(
    product?.variantStock ?? {}
  );

  useEffect(() => {
    EtiquetaService.getAll().then(setAllEtiquetas);
  }, []);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput, unknown, ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      price: product?.price ?? 0,
      originalPrice: product?.originalPrice,
      category: product?.category ?? '',
      tipo_tela: product?.tipo_tela ?? '',
      estado: product?.estado ?? 'activo',
      colors: product?.colors.join(', ') ?? '',
    },
  });

  const colorsText = useWatch({ control, name: 'colors' }) ?? '';
  const colorNames = colorsText
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
  const stockColors = colorNames.length > 0 ? colorNames : ['Único'];

  function setCell(color: string, size: string, value: string) {
    const qty = Math.max(0, Number(value) || 0);
    setMatrix((m) => ({ ...m, [color]: { ...m[color], [size]: qty } }));
  }

  async function addPhoto(file: File | undefined) {
    if (!file) return;
    const url = await imageFileToDataUrl(file);
    setImages((imgs) => [...imgs, { url, alt: file.name, isPrimary: imgs.length === 0 }]);
  }

  function toggleSize(size: Talla) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }

  async function onSubmit(data: ProductFormData) {
    const slug = data.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const colors = data.colors
      ? data.colors
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean)
      : [];
    const medidas_dinamicas = Object.fromEntries(
      medidas.filter((m) => m.size).map((m) => [m.size, m.medidas])
    );

    // Stock por color y talla; `stock` guarda la suma por talla
    const finalColors = colors.length > 0 ? colors : ['Único'];
    const variantStock = Object.fromEntries(
      finalColors.map((color) => [
        color,
        Object.fromEntries(selectedSizes.map((size) => [size, matrix[color]?.[size] ?? 0])),
      ])
    );
    const stock = Object.fromEntries(
      selectedSizes.map((size) => [
        size,
        finalColors.reduce((sum, color) => sum + (variantStock[color][size] ?? 0), 0),
      ])
    );

    const productImages = images.map((img) => ({
      ...img,
      id: img.id ?? `img_${uid()}`,
    }));

    const saved: IProduct = {
      id: product?.id ?? `prod_${uid()}`,
      slug: product?.slug ?? slug,
      name: data.name,
      description: data.description,
      price: data.price,
      originalPrice: data.originalPrice || undefined,
      category: data.category,
      stock,
      variantStock,
      colorImage: product?.colorImage,
      tipo_tela: data.tipo_tela || undefined,
      estado: data.estado,
      sizes: selectedSizes,
      colors,
      medidas_dinamicas,
      images: productImages,
      etiquetaIds: selectedEtiquetaIds,
      tagNames: allEtiquetas.filter((e) => selectedEtiquetaIds.includes(e.id)).map((e) => e.nombre),
      isFlashSale: product?.isFlashSale ?? false,
      flashSaleEndsAt: product?.flashSaleEndsAt,
      rating: product?.rating,
      reviewCount: product?.reviewCount,
      createdAt: product?.createdAt ?? new Date().toISOString(),
    };

    if (isEdit) {
      await ProductService.updateProduct(saved);
    } else {
      await ProductService.addProduct(saved);
    }
    onSaved(saved);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar producto' : 'Nuevo producto'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nombre" error={errors.name?.message} {...register('name')} />
          <div>
            <label className="text-text-primary mb-1.5 block text-sm font-medium">Categoría</label>
            <select
              className="border-border text-text-primary focus:ring-brand h-10 w-full rounded-xl border bg-white px-3 text-sm focus:ring-2 focus:outline-none"
              {...register('category')}
            >
              <option value="">Seleccionar...</option>
              {CATEGORIAS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-danger mt-1 text-xs">{errors.category.message}</p>
            )}
          </div>
          <Input
            label="Precio (Bs.)"
            type="number"
            step="0.01"
            error={errors.price?.message}
            {...register('price', { valueAsNumber: true })}
          />
          <Input
            label="Precio original (Bs., opcional)"
            type="number"
            step="0.01"
            {...register('originalPrice', {
              setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
            })}
          />
          <Input
            label="Material (opcional)"
            placeholder="Cuero, gamuza, algodón..."
            {...register('tipo_tela')}
          />
          <Input
            label="Colores (separados por coma)"
            placeholder="Negro, Camel, Vino"
            {...register('colors')}
          />
          <div className="sm:col-span-2">
            <label className="text-text-primary mb-1.5 block text-sm font-medium">Etiquetas</label>
            {allEtiquetas.length === 0 ? (
              <p className="text-text-muted text-xs">
                No hay etiquetas. Crea etiquetas en Marketing → Etiquetas.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allEtiquetas.map((etiq) => (
                  <button
                    key={etiq.id}
                    type="button"
                    onClick={() =>
                      setSelectedEtiquetaIds((prev) =>
                        prev.includes(etiq.id)
                          ? prev.filter((id) => id !== etiq.id)
                          : [...prev, etiq.id]
                      )
                    }
                    className={[
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                      selectedEtiquetaIds.includes(etiq.id)
                        ? 'border-brand bg-brand-subtle text-brand'
                        : 'border-border text-text-secondary hover:border-brand/40 bg-white',
                    ].join(' ')}
                  >
                    {etiq.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="text-text-primary mb-1.5 block text-sm font-medium">Estado</label>
            <select
              className="border-border text-text-primary focus:ring-brand h-10 w-full rounded-xl border bg-white px-3 text-sm focus:ring-2 focus:outline-none"
              {...register('estado')}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-text-primary mb-1.5 block text-sm font-medium">Descripción</label>
          <textarea
            rows={2}
            className="border-border focus:ring-brand w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:ring-2 focus:outline-none"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-danger mt-1 text-xs">{errors.description.message}</p>
          )}
        </div>

        {/* Tallas */}
        <div>
          <p className="text-text-primary mb-2 text-sm font-medium">Tallas disponibles</p>
          <div className="flex flex-wrap gap-2">
            {TALLAS_DISPONIBLES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={[
                  'h-10 min-w-10 rounded-lg border px-2 text-sm font-medium transition-all',
                  selectedSizes.includes(size)
                    ? 'border-brand bg-brand-subtle text-brand'
                    : 'border-border text-text-secondary bg-white',
                ].join(' ')}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Stock por color y talla */}
        {selectedSizes.length > 0 && (
          <div>
            <p className="text-text-primary mb-2 text-sm font-medium">Stock por color y talla</p>
            <div className="overflow-x-auto">
              <table className="text-sm">
                <thead>
                  <tr>
                    <th className="pr-2 text-left font-medium" />
                    {selectedSizes.map((size) => (
                      <th key={size} className="px-1 pb-1 text-center font-medium">
                        {size}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stockColors.map((color) => (
                    <tr key={color}>
                      <td className="pr-2 whitespace-nowrap">{color}</td>
                      {selectedSizes.map((size) => (
                        <td key={size} className="p-0.5">
                          <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            aria-label={`Stock de ${color} talla ${size}`}
                            value={matrix[color]?.[size] ?? 0}
                            onChange={(e) => setCell(color, size, e.target.value)}
                            className="border-border w-14 rounded-lg border bg-white px-2 text-center"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Medidas dinámicas */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-text-primary text-sm font-medium">Medidas por talla</p>
            <button
              type="button"
              onClick={() => setMedidas((m) => [...m, { size: '', medidas: '' }])}
              className="text-brand flex items-center gap-1 text-xs font-medium hover:underline"
            >
              <Plus size={12} /> Agregar fila
            </button>
          </div>
          <div className="space-y-2">
            {medidas.map((row, i) => (
              <div key={i} className="flex gap-2">
                <input
                  placeholder="Talla (ej: S)"
                  value={row.size}
                  onChange={(e) =>
                    setMedidas((m) =>
                      m.map((r, j) => (j === i ? { ...r, size: e.target.value } : r))
                    )
                  }
                  className="border-border focus:ring-brand w-24 rounded-lg border bg-white px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                />
                <input
                  placeholder="Medidas (ej: Largo: 90cm | Busto: 80cm)"
                  value={row.medidas}
                  onChange={(e) =>
                    setMedidas((m) =>
                      m.map((r, j) => (j === i ? { ...r, medidas: e.target.value } : r))
                    )
                  }
                  className="border-border focus:ring-brand min-w-0 flex-1 rounded-lg border bg-white px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setMedidas((m) => m.filter((_, j) => j !== i))}
                  className="text-text-muted hover:text-danger"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Imágenes */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-text-primary text-sm font-medium">Fotos</p>
            <button
              type="button"
              onClick={() =>
                setImages((imgs) => [...imgs, { url: '', alt: '', isPrimary: imgs.length === 0 }])
              }
              className="text-brand flex items-center gap-1 text-xs font-medium hover:underline"
            >
              <Plus size={12} /> Agregar URL
            </button>
          </div>
          <label className="border-border text-text-secondary mb-2 flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed text-sm font-medium">
            <Plus size={16} /> Subir foto desde el teléfono
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                void addPhoto(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </label>
          <div className="space-y-2">
            {images.map((img, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  placeholder="URL de imagen"
                  value={img.url}
                  onChange={(e) =>
                    setImages((imgs) =>
                      imgs.map((r, j) => (j === i ? { ...r, url: e.target.value } : r))
                    )
                  }
                  className="border-border focus:ring-brand min-w-0 flex-1 rounded-lg border bg-white px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                />
                <input
                  placeholder="Descripción"
                  value={img.alt}
                  onChange={(e) =>
                    setImages((imgs) =>
                      imgs.map((r, j) => (j === i ? { ...r, alt: e.target.value } : r))
                    )
                  }
                  className="border-border focus:ring-brand hidden w-32 rounded-lg border bg-white px-3 py-2 text-sm focus:ring-1 focus:outline-none sm:block"
                />
                <label className="text-text-muted flex shrink-0 cursor-pointer items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={img.isPrimary}
                    onChange={() =>
                      setImages((imgs) => imgs.map((r, j) => ({ ...r, isPrimary: j === i })))
                    }
                  />
                  Principal
                </label>
                <button
                  type="button"
                  onClick={() => setImages((imgs) => imgs.filter((_, j) => j !== i))}
                  className="text-text-muted hover:text-danger"
                >
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
