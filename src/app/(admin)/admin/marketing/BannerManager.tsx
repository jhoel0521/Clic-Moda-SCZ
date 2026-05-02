'use client';

import { useEffect, useState } from 'react';
import { ToggleLeft, ToggleRight, Pencil, X, Check } from 'lucide-react';
import { BannerService } from '@src/services/BannerService';
import { Spinner } from '@src/shared/ui/Spinner';
import { Input } from '@src/shared/ui/Input';
import { Button } from '@src/shared/ui/Button';
import type { IBannerPromocional } from '@src/core/models';

type EditState = Omit<IBannerPromocional, 'id' | 'activo'>;

export function BannerManager() {
  const [banners, setBanners] = useState<IBannerPromocional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditState>({
    titulo: '',
    descripcion: '',
    url_pc: '',
    url_tablet: '',
    url_movil: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    BannerService.getAllBanners()
      .then(setBanners)
      .finally(() => setIsLoading(false));
  }, []);

  function startEdit(banner: IBannerPromocional) {
    setEditingId(banner.id);
    setEditForm({
      titulo: banner.titulo,
      descripcion: banner.descripcion ?? '',
      url_pc: banner.url_pc,
      url_tablet: banner.url_tablet,
      url_movil: banner.url_movil,
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleSave(id: string) {
    setSaving(true);
    const updated = await BannerService.updateBanner(id, editForm);
    if (updated) {
      setBanners((prev) => prev.map((b) => (b.id === id ? updated : b)));
    }
    setSaving(false);
    setEditingId(null);
  }

  async function handleToggle(id: string) {
    setToggling(id);
    const updated = await BannerService.toggleBanner(id);
    if (updated) {
      setBanners((prev) => prev.map((b) => (b.id === id ? updated : b)));
    }
    setToggling(null);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="border-border bg-surface rounded-2xl border px-6 py-14 text-center">
        <p className="text-text-muted">No hay banners configurados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {banners.map((banner) => (
        <div key={banner.id} className="border-border rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="text-text-primary truncate font-semibold">{banner.titulo}</p>
              {banner.descripcion && (
                <p className="text-text-muted mt-0.5 truncate text-xs">{banner.descripcion}</p>
              )}
              <p className="text-text-muted mt-0.5 truncate text-xs opacity-60">{banner.url_pc}</p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <span
                className={[
                  'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  banner.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500',
                ].join(' ')}
              >
                {banner.activo ? 'Activo' : 'Inactivo'}
              </span>
              <button
                type="button"
                onClick={() => (editingId === banner.id ? cancelEdit() : startEdit(banner))}
                className="text-text-muted hover:text-brand p-1 transition-colors"
                title="Editar"
              >
                {editingId === banner.id ? <X size={18} /> : <Pencil size={16} />}
              </button>
              <button
                type="button"
                disabled={toggling === banner.id}
                onClick={() => handleToggle(banner.id)}
                className="text-text-muted hover:text-brand transition-colors disabled:opacity-40"
                title={banner.activo ? 'Desactivar' : 'Activar'}
              >
                {banner.activo ? (
                  <ToggleRight size={24} className="text-brand" />
                ) : (
                  <ToggleLeft size={24} />
                )}
              </button>
            </div>
          </div>

          {editingId === banner.id && (
            <div className="border-border border-t px-4 pt-3 pb-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Título"
                  value={editForm.titulo}
                  onChange={(e) => setEditForm((f) => ({ ...f, titulo: e.target.value }))}
                />
                <Input
                  label="Descripción"
                  value={editForm.descripcion ?? ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, descripcion: e.target.value }))}
                />
                <Input
                  label="URL imagen PC"
                  value={editForm.url_pc}
                  onChange={(e) => setEditForm((f) => ({ ...f, url_pc: e.target.value }))}
                />
                <Input
                  label="URL imagen Tablet"
                  value={editForm.url_tablet}
                  onChange={(e) => setEditForm((f) => ({ ...f, url_tablet: e.target.value }))}
                />
                <Input
                  label="URL imagen Móvil"
                  value={editForm.url_movil}
                  onChange={(e) => setEditForm((f) => ({ ...f, url_movil: e.target.value }))}
                />
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={cancelEdit}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={saving}
                  leftIcon={<Check size={14} />}
                  onClick={() => handleSave(banner.id)}
                >
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
