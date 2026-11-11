import { StoreSettings } from '../domain/entities/store-settings.entity.js';
import type { StoreSettingsRepository } from '../domain/store-settings.repository.port.js';
import { SocialUrl } from '../domain/value-objects/contact.vo.js';
import { MediaRef } from '../domain/value-objects/media-ref.vo.js';
import { BrandName } from '../domain/value-objects/texts.vo.js';

const LOGO_ID = '0a1b2c3d-0000-4000-8000-000000000001';

type Create = () => Promise<StoreSettingsRepository>;

function readingCases(create: Create): void {
  it('sin nada guardado devuelve null', async () => {
    expect(await (await create()).find()).toBeNull();
  });

  it('lo que no se llena vuelve como null', async () => {
    const repo = await create();

    await repo.save(StoreSettings.seed());
    const values = (await repo.find())?.values;

    expect([values?.logo, values?.shareImage, values?.mapUrl, values?.tiktok]).toEqual([
      null,
      null,
      null,
      null,
    ]);
  });
}

function filled(): StoreSettings {
  const seed = StoreSettings.seed(new Date('2026-11-12T10:00:00Z'));
  return seed.replaceWith(
    {
      ...seed.values,
      brandName: BrandName.of('Verashoe'),
      logo: MediaRef.of('logo', LOGO_ID),
      instagram: SocialUrl.of('instagram', 'https://www.instagram.com/verashoe'),
    },
    new Date('2026-11-12T11:00:00Z')
  );
}

function writingCases(create: Create): void {
  it('guarda y devuelve la misma configuración, campo por campo', async () => {
    const repo = await create();

    await repo.save(filled());

    expect((await repo.find())?.values).toEqual(filled().values);
  });

  it('guardar de nuevo reemplaza: sigue habiendo una sola configuración', async () => {
    const repo = await create();
    const seed = StoreSettings.seed(new Date('2026-11-12T10:00:00Z'));

    await repo.save(seed);
    await repo.save(seed.replaceWith({ ...seed.values, brandName: BrandName.of('Otra') }));

    expect((await repo.find())?.values.brandName.value).toBe('Otra');
  });
}

// Contrato que cumple CUALQUIER implementación del repositorio (en memoria y Postgres).
export function storeSettingsRepositoryContract(name: string, create: Create): void {
  describe(`${name}: contrato de StoreSettingsRepository (lectura)`, () => readingCases(create));
  describe(`${name}: contrato de StoreSettingsRepository (escritura)`, () => writingCases(create));
}
