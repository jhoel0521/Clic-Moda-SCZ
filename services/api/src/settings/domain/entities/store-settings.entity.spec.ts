import { MapUrl } from '../value-objects/contact.vo.js';
import { MediaRef } from '../value-objects/media-ref.vo.js';
import { BrandName } from '../value-objects/texts.vo.js';
import { StoreSettings } from './store-settings.entity.js';

const LOGO_ID = '0a1b2c3d-0000-4000-8000-000000000001';

describe('StoreSettings: semilla', () => {
  it('la semilla es la marca provisional del cliente, sin imágenes ni redes', () => {
    const { values } = StoreSettings.seed(new Date('2026-11-12T00:00:00Z'));

    expect(values.brandName.value).toBe('Clic Moda SC');
    expect(values.brandColor.value).toBe('#c7305a');
    expect([values.logo, values.shareImage, values.mapUrl, values.instagram]).toEqual([
      null,
      null,
      null,
      null,
    ]);
  });
});

describe('StoreSettings: reemplazo', () => {
  it('reemplazar devuelve otra configuración con la fecha nueva y no toca la anterior', () => {
    const seed = StoreSettings.seed(new Date('2026-11-12T00:00:00Z'));
    const now = new Date('2026-11-13T10:00:00Z');
    const changes = {
      ...seed.values,
      brandName: BrandName.of('Verashoe'),
      logo: MediaRef.of('logo', LOGO_ID),
      mapUrl: MapUrl.of('https://maps.app.goo.gl/x'),
    };

    const next = seed.replaceWith(changes, now);

    expect([next.values.brandName.value, next.values.logo?.value, next.values.updatedAt]).toEqual([
      'Verashoe',
      LOGO_ID,
      now,
    ]);
    expect(seed.values.brandName.value).toBe('Clic Moda SC');
  });
});

describe('MediaRef', () => {
  it('rechaza lo que no es un UUID', () => {
    expect(() => MediaRef.of('logo', 'abc')).toThrow('no es válida');
  });
});
