'use client';

import { useEffect, useState } from 'react';
import { Tag, Plus, Pencil, Check, Trash2 } from 'lucide-react';
import { EtiquetaService } from '@src/services/EtiquetaService';
import { ProductService } from '@src/services/ProductService';
import { Spinner } from '@src/shared/ui/Spinner';
import { Input } from '@src/shared/ui/Input';
import { Button } from '@src/shared/ui/Button';
import type { IEtiqueta } from '@src/core/models';

export function EtiquetaManager() {
  const [etiquetas, setEtiquetas] = useState<IEtiqueta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all([EtiquetaService.getAll(), ProductService.getProducts()]).then(
      ([etiqs, products]) => {
        if (cancelled) return;
        const counts: Record<string, number> = {};
        for (const e of etiqs) counts[e.id] = 0;
        for (const p of products) {
          for (const eid of p.etiquetaIds) {
            counts[eid] = (counts[eid] ?? 0) + 1;
          }
        }
        setEtiquetas(etiqs);
        setProductCounts(counts);
        setIsLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    const created = await EtiquetaService.create(newName.trim());
    if (created) {
      setEtiquetas((prev) => {
        if (prev.some((e) => e.id === created.id)) return prev;
        return [...prev, created];
      });
      setProductCounts((prev) => ({ ...prev, [created.id]: 0 }));
    }
    setNewName('');
    setCreating(false);
  }

  function startEdit(etiqueta: IEtiqueta) {
    setEditingId(etiqueta.id);
    setEditName(etiqueta.nombre);
    setConfirmDeleteId(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
  }

  async function handleSave(id: string) {
    if (!editName.trim()) return;
    setSaving(true);
    const updated = await EtiquetaService.update(id, editName.trim());
    if (updated) {
      setEtiquetas((prev) => prev.map((e) => (e.id === id ? updated : e)));
    }
    setSaving(false);
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const success = await EtiquetaService.remove(id);
    if (success) {
      setEtiquetas((prev) => prev.filter((e) => e.id !== id));
      setProductCounts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
    setDeletingId(null);
    setConfirmDeleteId(null);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-border rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Plus size={16} className="text-brand" />
          <p className="text-text-primary text-sm font-semibold">Nueva etiqueta</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Nombre de la etiqueta"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
          />
          <Button
            variant="primary"
            size="sm"
            isLoading={creating}
            leftIcon={<Check size={14} />}
            onClick={handleCreate}
          >
            Crear
          </Button>
        </div>
      </div>

      {etiquetas.length === 0 ? (
        <div className="border-border bg-surface rounded-2xl border px-6 py-14 text-center">
          <p className="text-text-muted">No hay etiquetas creadas.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {etiquetas.map((etiqueta) => (
            <div key={etiqueta.id} className="border-border rounded-2xl border bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Tag size={14} className="text-brand shrink-0" />
                  {editingId === etiqueta.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave(etiqueta.id);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        className="max-w-[200px]"
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={saving}
                        leftIcon={<Check size={12} />}
                        onClick={() => handleSave(etiqueta.id)}
                      >
                        Guardar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={cancelEdit}>
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-text-primary text-sm font-medium">{etiqueta.nombre}</p>
                      <span className="text-text-muted rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold">
                        {productCounts[etiqueta.id] ?? 0} productos
                      </span>
                    </>
                  )}
                </div>

                {editingId !== etiqueta.id && (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(etiqueta)}
                      className="text-text-muted hover:bg-surface-hover hover:text-brand rounded-lg p-1.5 transition-colors"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    {confirmDeleteId === etiqueta.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-medium text-red-500">
                          {(productCounts[etiqueta.id] ?? 0) > 0
                            ? `Se quitará de ${productCounts[etiqueta.id]} productos`
                            : 'Confirmar?'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          isLoading={deletingId === etiqueta.id}
                          leftIcon={<Trash2 size={12} className="text-red-500" />}
                          onClick={() => handleDelete(etiqueta.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Sí
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)}>
                          No
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(etiqueta.id)}
                        className="text-text-muted rounded-lg p-1.5 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
