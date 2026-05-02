'use client';

import { useEffect, useState } from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import { BannerService } from '@src/services/BannerService';
import { Spinner } from '@src/shared/ui/Spinner';
import type { IBannerPromocional } from '@src/core/models';

export function BannerManager() {
  const [banners, setBanners] = useState<IBannerPromocional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    BannerService.getAllBanners()
      .then(setBanners)
      .finally(() => setIsLoading(false));
  }, []);

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
        <div
          key={banner.id}
          className="border-border flex items-center justify-between gap-4 rounded-2xl border bg-white p-4 shadow-sm"
        >
          <div className="min-w-0 flex-1">
            <p className="text-text-primary truncate font-semibold">{banner.titulo}</p>
            <p className="text-text-muted mt-0.5 truncate text-xs">{banner.url_pc}</p>
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
      ))}
    </div>
  );
}
