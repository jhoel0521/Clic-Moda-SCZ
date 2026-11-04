'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import { ProductService } from '@src/services/ProductService';
import { AdminHeader } from '@src/app/(admin)/AdminHeader';
import { Button } from '@src/shared/ui/Button';
import { Spinner } from '@src/shared/ui/Spinner';
import { ProductForm } from './ProductForm';
import type { IProduct } from '@src/core/models';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | undefined>();

  useEffect(() => {
    ProductService.getProducts()
      .then(setProducts)
      .finally(() => setIsLoading(false));
  }, []);

  function handleSaved(saved: IProduct) {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      return idx >= 0 ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev];
    });
  }

  async function handleToggleEstado(product: IProduct) {
    const updated = await ProductService.toggleProductEstado(product.id);
    if (updated) {
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }
  }

  function openEdit(product: IProduct) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  function openNew() {
    setEditingProduct(undefined);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <AdminHeader title="Gestión de Productos" />

      <div className="flex items-center justify-between">
        <p className="text-text-muted text-sm">{products.length} productos en total</p>
        <Button variant="primary" size="sm" leftIcon={<Plus size={16} />} onClick={openNew}>
          Nuevo producto
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="border-border overflow-x-auto rounded-2xl border shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-secondary border-border border-b">
                <th className="text-text-primary px-2 py-3 text-left font-semibold sm:px-5">
                  Producto
                </th>
                <th className="text-text-primary hidden px-2 py-3 text-left font-semibold sm:table-cell sm:px-5">
                  Categoría
                </th>
                <th className="text-text-primary px-2 py-3 text-right font-semibold sm:px-5">
                  Stock
                </th>
                <th className="text-text-primary px-2 py-3 text-right font-semibold sm:px-5">
                  Precio
                </th>
                <th className="text-text-primary hidden px-2 py-3 text-center font-semibold sm:table-cell sm:px-5">
                  Estado
                </th>
                <th className="text-text-primary px-2 py-3 text-center font-semibold sm:px-5">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y bg-white">
              {products.map((product) => {
                const img = product.images.find((i) => i.isPrimary) ?? product.images[0];
                return (
                  <tr key={product.id} className="hover:bg-surface-hover">
                    <td className="px-2 py-3 sm:px-5">
                      <div className="flex items-center gap-3">
                        <div className="bg-surface-raised relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                          {img ? (
                            <Image
                              src={img.url}
                              alt={img.alt}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-lg">
                              👗
                            </span>
                          )}
                        </div>
                        <p className="text-text-primary line-clamp-2 leading-tight font-medium">
                          {product.name}
                        </p>
                      </div>
                    </td>
                    <td className="text-text-muted hidden px-2 py-3 capitalize sm:table-cell sm:px-5">
                      {product.category}
                    </td>
                    <td className="px-2 py-3 text-right sm:px-5">
                      <span
                        className={
                          Object.values(product.stock).reduce((s, q) => s + q, 0) <= 5
                            ? 'text-warning font-bold'
                            : 'text-text-primary'
                        }
                      >
                        {Object.values(product.stock).reduce((s, q) => s + q, 0)}
                      </span>
                    </td>
                    <td className="text-text-primary px-2 py-3 text-right font-semibold whitespace-nowrap sm:px-5">
                      Bs. {product.price}
                    </td>
                    <td className="hidden px-2 py-3 text-center sm:table-cell sm:px-5">
                      <span
                        className={[
                          'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
                          product.estado === 'activo'
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : 'border-gray-200 bg-gray-50 text-gray-500',
                        ].join(' ')}
                      >
                        {product.estado}
                      </span>
                    </td>
                    <td className="px-2 py-3 sm:px-5">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="text-text-muted hover:bg-surface-hover hover:text-brand flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleEstado(product)}
                          className="text-text-muted hover:bg-surface-hover flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
                          title="Cambiar estado"
                        >
                          {product.estado === 'activo' ? (
                            <ToggleRight size={20} className="text-green-600" />
                          ) : (
                            <ToggleLeft size={20} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ProductForm
        key={editingProduct?.id ?? 'new'}
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingProduct(undefined);
        }}
        product={editingProduct}
        onSaved={handleSaved}
      />
    </div>
  );
}
