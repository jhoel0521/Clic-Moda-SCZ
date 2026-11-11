import { FieldValidationError } from '../../../shared/domain/errors/domain.error.js';
import { FakeMediaReferences } from '../../testing/fake-media-references.js';
import { InMemoryStoreSettingsRepository } from '../../testing/in-memory-store-settings.repository.js';
import { UpdateSettingsCommand } from '../dtos/settings.dtos.js';
import { GetPublicSettingsUseCase } from './get-public-settings.use-case.js';
import { UpdateSettingsUseCase } from './update-settings.use-case.js';

const LOGO = '0a1b2c3d-0000-4000-8000-000000000001';
const SHARE = '0a1b2c3d-0000-4000-8000-000000000002';

const valid = (over: Partial<UpdateSettingsCommand> = {}): UpdateSettingsCommand =>
  Object.assign(
    new UpdateSettingsCommand(
      'Verashoe',
      'Calzado de moda',
      '#c7305a',
      null,
      'Verashoe · Calzado de moda en Santa Cruz',
      'Zapatos de moda en Santa Cruz. Mira el catálogo, elige tu talla y cierra tu compra por WhatsApp con nosotros.',
      null,
      '59171234567',
      'Av. Banzer 123',
      'Lunes a sábado de 9 a 18',
      null,
      null,
      null,
      null
    ),
    over
  );

function world() {
  const repo = new InMemoryStoreSettingsRepository();
  const media = new FakeMediaReferences()
    .add({ id: LOGO, revision: 2, alt: 'Logo' })
    .add({ id: SHARE, revision: 1, alt: 'Fachada' });
  return {
    repo,
    media,
    get: new GetPublicSettingsUseCase(repo, media),
    put: new UpdateSettingsUseCase(repo, media),
  };
}

describe('GetPublicSettingsUseCase', () => {
  it('sin nada guardado entrega la semilla "Clic Moda SC" con su paleta', async () => {
    const result = await world().get.execute();

    expect([result.brandName, result.color.primary, result.logo]).toEqual([
      'Clic Moda SC',
      '#c7305a',
      null,
    ]);
  });

  it('la semilla es estable: dos lecturas dan lo mismo (el ETag no cambia)', async () => {
    const { get } = world();

    expect(await get.execute()).toEqual(await get.execute());
  });

  it('no expone ningún dato de pago', async () => {
    const keys = JSON.stringify(await world().get.execute()).toLowerCase();

    expect(keys).not.toMatch(/banco|bank|cuenta|account|qr|nit/);
  });
});

describe('UpdateSettingsUseCase: guardar', () => {
  it('guarda y la siguiente lectura devuelve el nombre nuevo', async () => {
    const { put, get } = world();

    await put.execute(valid());

    expect((await get.execute()).brandName).toBe('Verashoe');
  });

  it('arma las rutas del logo (WebP) y de compartir (JPEG) con la revisión vigente', async () => {
    const { put } = world();

    const result = await put.execute(valid({ logoMediaId: LOGO, shareMediaId: SHARE }));

    expect([result.logo?.path, result.seo.shareImage?.path]).toEqual([
      `/m/${LOGO}/logo-2.webp`,
      `/m/${SHARE}/link-1.jpg`,
    ]);
    expect(result.seo.shareImage).toMatchObject({ width: 1200, height: 630, type: 'image/jpeg' });
  });

  it('una imagen borrada después se omite y la tienda cae al nombre', async () => {
    const { put, get, media } = world();
    await put.execute(valid({ logoMediaId: LOGO }));

    media.remove(LOGO);

    expect((await get.execute()).logo).toBeNull();
  });
});

describe('UpdateSettingsUseCase: rechazos', () => {
  it('junta todos los campos inválidos y no guarda nada', async () => {
    const { put, repo } = world();

    const error = await put
      .execute(valid({ brandName: 'x', whatsapp: '71234567', brandColor: '#e63f6e' }))
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(FieldValidationError);
    expect((error as FieldValidationError).issues.map((i) => i.field).sort()).toEqual([
      'brandColor',
      'brandName',
      'whatsapp',
    ]);
    expect(await repo.find()).toBeNull();
  });

  it('el contraste insuficiente trae el color cercano en el mensaje', async () => {
    const error = await world()
      .put.execute(valid({ brandColor: '#e63f6e' }))
      .catch((e: unknown) => e);

    expect((error as FieldValidationError).issues[0]?.message).toContain('#e2245a');
  });
});

describe('UpdateSettingsUseCase: imágenes y opcionales', () => {
  it('rechaza una imagen que no existe', async () => {
    const missing = '0a1b2c3d-0000-4000-8000-0000000000ff';

    const error = await world()
      .put.execute(valid({ logoMediaId: missing }))
      .catch((e: unknown) => e);

    expect((error as FieldValidationError).issues).toEqual([
      { field: 'logo', message: 'La imagen elegida no existe o no está publicada' },
    ]);
  });

  it('los opcionales vacíos se guardan como ausentes', async () => {
    const result = await world().put.execute(valid({ mapUrl: '  ', instagram: '' }));

    expect([result.contact.mapUrl, result.social.instagram]).toEqual([null, null]);
  });
});
