import { MediaFormat } from '../../domain/value-objects/media-format.vo.js';
import { MediaId } from '../../domain/value-objects/media-id.vo.js';
import { Revision } from '../../domain/value-objects/image-values.vo.js';
import { FakeImageProcessor, fakeImage } from '../../testing/fake-image-processor.js';
import { InMemoryMediaAssetsRepository } from '../../testing/in-memory-media-assets.repository.js';
import { InMemoryMediaStorage } from '../../testing/in-memory-media-storage.js';
import { UploadMediaCommand } from '../dtos/media.dtos.js';
import { BackfillMissingVariantsUseCase } from './backfill-missing-variants.use-case.js';
import { UploadMediaUseCase } from './upload-media.use-case.js';

// Una imagen "antigua": subida cuando todavía no existía el formato `logo`.
async function legacyImage() {
  const assets = new InMemoryMediaAssetsRepository();
  const storage = new InMemoryMediaStorage();
  const processor = new FakeImageProcessor();
  const created = await new UploadMediaUseCase(assets, storage, processor).execute(
    new UploadMediaCommand(fakeImage('jpeg', 3000, 2000), 'Logo antiguo')
  );
  const id = MediaId.of(created.id);
  const logo = await assets.findVariant(id, MediaFormat.of('logo'), Revision.first());
  if (!logo) throw new Error('la subida debe crear logo');
  await assets.deleteVariants([logo]);
  await storage.delete([logo.storageKey]);
  return {
    assets,
    storage,
    id,
    backfill: new BackfillMissingVariantsUseCase(assets, storage, processor),
  };
}

describe('BackfillMissingVariantsUseCase', () => {
  it('crea solo la variante que faltaba, con la misma revisión (las URLs publicadas no cambian)', async () => {
    const { assets, storage, id, backfill } = await legacyImage();

    const created = await backfill.execute();

    expect(created).toBe(1);
    const logo = await assets.findVariant(id, MediaFormat.of('logo'), Revision.first());
    expect(logo?.storageKey).toBe(`m/${id.value}/logo-1.webp`);
    expect(storage.keys()).toContain(`m/${id.value}/logo-1.webp`);
    expect((await assets.findById(id))?.revision.value).toBe(1);
  });

  it('es idempotente: la segunda vez no hace nada', async () => {
    const { backfill } = await legacyImage();

    await backfill.execute();

    expect(await backfill.execute()).toBe(0);
  });

  it('si la copia maestra no está, omite la imagen sin fallar', async () => {
    const { storage, id, backfill } = await legacyImage();
    await storage.delete([`m/${id.value}/master.jpg`]);

    expect(await backfill.execute()).toBe(0);
  });
});
