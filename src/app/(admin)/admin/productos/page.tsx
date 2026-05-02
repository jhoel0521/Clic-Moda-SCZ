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
      return idx >= 0 ? prev.map((p) => p.id === saved.id ? saved : p) : [saved, ...prev];
    });
  }

  async function handleToggleEstado(product: IProduct) {
    const updated = await ProductService.toggleProductEstado(product.id);
    if (updated) {
      setProducts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
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
        <p className="text-sm text-text-muted">
          {products.length} productos en total
        </p>
        <Button variant="primary" size="sm" leftIcon={<Plus size={16} />} onClick={openNew}>
          Nuevo producto
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-secondary border-b border-border">
                <th className="px-5 py-3 text-left font-semibold text-text-primary">Producto</th>
                <th className="hidden sm:table-cell px-5 py-3 text-left font-semibold text-text-primary">Categoría</th>
                <th className="px-5 py-3 text-right font-semibold text-text-primary">Stock</th>
                <th className="px-5 py-3 text-right font-semibold text-text-primary">Precio</th>
                <th className="px-5 py-3 text-center font-semibold text-text-primary">Estado</th>
                <th className="px-5 py-3 text-center font-semibold text-text-primary">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {products.map((product) => {
                const img = product.images.find((i) => i.isPrimary) ?? product.images[0];
                return (
                  <tr key={product.id} className="hover:bg-surface-hover">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-raised">
                          {img ? <Image src={img.url} alt={img.alt} fill className="object-cover" sizes="40px" /> : <span className="flex h-full w-full items-center justify-center text-lg">👗</span>}
                        </div>
                        <p className="font-medium text-text-primary line-clamp-1">{product.name}</p>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-5 py-3 text-text-muted capitalize">{product.category}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={product.stock <= 5 ? 'font-bold text-warning' : 'text-text-primary'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-text-primary">Bs. {product.price}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={['inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold', product.estado === 'activo' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'].join(' ')}>
                        {product.estado}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button type="button" onClick={() => openEdit(product)} className="p-1.5 rounded-lg text-text-muted hover:bg-surface-hover hover:text-brand transition-colors" title="Editar">
                          <Pencil size={15} />
                        </button>
                        <button type="button" onClick={() => handleToggleEstado(product)} className="p-1.5 rounded-lg text-text-muted hover:bg-surface-hover transition-colors" title="Cambiar estado">
                          {product.estado === 'activo' ? <ToggleRight size={16} className="text-green-600" /> : <ToggleLeft size={16} />}
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
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingProduct(undefined); }}
        product={editingProduct}
        onSaved={handleSaved}
      />
    </div>
  );
}
