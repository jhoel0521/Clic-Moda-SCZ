import { InMemoryMediaAssetsRepository } from '../../testing/in-memory-media-assets.repository.js';
import { InMemoryMediaStorage } from '../../testing/in-memory-media-storage.js';
import { FakeImageProcessor, fakeImage } from '../../testing/fake-image-processor.js';
import { MediaId } from '../../domain/value-objects/media-id.vo.js';
import {
  ChangeFocalPointCommand,
  MediaIdQuery,
  PublicVariantQuery,
  PurgeObsoleteMediaCommand,
  UploadMediaCommand,
} from '../dtos/media.dtos.js';
import { ChangeFocalPointUseCase } from './change-focal-point.use-case.js';
import { DeleteMediaUseCase } from './delete-media.use-case.js';
import { GetMediaMasterUseCase } from './get-media-master.use-case.js';
import { GetPublicVariantUseCase } from './get-public-variant.use-case.js';
import { ListMediaUseCase } from './list-media.use-case.js';
import { PurgeObsoleteMediaUseCase } from './purge-obsolete-media.use-case.js';
import { UploadMediaUseCase } from './upload-media.use-case.js';

async function setup() {
  const assets = new InMemoryMediaAssetsRepository();
  const storage = new InMemoryMediaStorage();
  const processor = new FakeImageProcessor();
  const created = await new UploadMediaUseCase(assets, storage, processor).execute(
    new UploadMediaCommand(fakeImage('jpeg', 3000, 2000), 'Bota Andes coñac')
  );
  return {
    assets,
    storage,
    id: created.id,
    reframe: new ChangeFocalPointUseCase(assets, storage, processor),
    remove: new DeleteMediaUseCase(assets, storage),
    list: new ListMediaUseCase(assets),
    master: new GetMediaMasterUseCase(assets, storage),
    publicVariant: new GetPublicVariantUseCase(assets, storage),
    purge: new PurgeObsoleteMediaUseCase(assets, storage),
  };
}

describe('GetPublicVariantUseCase', () => {
  it('sirve la variante publicada con su tipo y un ETag estable', async () => {
    const world = await setup();

    const result = await world.publicVariant.execute(
      new PublicVariantQuery(world.id, 'link', 1, 'jpg')
    );

    expect([result.contentType, result.etag]).toEqual(['image/jpeg', `"${world.id}-link-1"`]);
  });

  it('una imagen despublicada responde que no existe', async () => {
    const world = await setup();
    const asset = await world.assets.findById(MediaId.of(world.id));
    asset?.unpublish();

    await expect(
      world.publicVariant.execute(new PublicVariantQuery(world.id, 'link', 1, 'jpg'))
    ).rejects.toThrow('no existe');
  });
});

describe('GetPublicVariantUseCase: casos que no existen', () => {
  it.each([
    ['formato desconocido', 'banner', 1, 'jpg'],
    ['extensión que no corresponde', 'link', 1, 'webp'],
    ['revisión inexistente', 'link', 9, 'jpg'],
    ['revisión inválida', 'link', 0, 'jpg'],
  ])('responde que no existe ante %s', async (_name, format, revision, extension) => {
    const world = await setup();

    await expect(
      world.publicVariant.execute(new PublicVariantQuery(world.id, format, revision, extension))
    ).rejects.toThrow('no existe');
  });

  it('la copia maestra nunca sale por la ruta pública', async () => {
    const world = await setup();

    await expect(
      world.publicVariant.execute(new PublicVariantQuery(world.id, 'master', 1, 'jpg'))
    ).rejects.toThrow('no existe');
  });
});

describe('GetPublicVariantUseCase: revisiones', () => {
  it('una revisión anterior sigue sirviéndose tras reencuadrar', async () => {
    const world = await setup();
    await world.reframe.execute(new ChangeFocalPointCommand(world.id, 0.1, 0.1));

    const old = await world.publicVariant.execute(
      new PublicVariantQuery(world.id, 'story', 1, 'jpg')
    );

    expect(old.contentType).toBe('image/jpeg');
  });
});

describe('GetMediaMasterUseCase, ListMediaUseCase y DeleteMediaUseCase', () => {
  it('el admin obtiene la copia maestra', async () => {
    const world = await setup();

    expect((await world.master.execute(new MediaIdQuery(world.id))).contentType).toBe('image/jpeg');
  });

  it('lista las imágenes con las variantes de la revisión vigente', async () => {
    const world = await setup();
    await world.reframe.execute(new ChangeFocalPointCommand(world.id, 0.3, 0.3));

    const [item] = await world.list.execute();

    expect(item?.variants.every((v) => v.revision === 2)).toBe(true);
    expect(item?.variants).toHaveLength(6);
  });
});

describe('DeleteMediaUseCase', () => {
  it('borrar elimina la maestra, todas las revisiones y el registro', async () => {
    const world = await setup();
    await world.reframe.execute(new ChangeFocalPointCommand(world.id, 0.3, 0.3));

    await world.remove.execute(new MediaIdQuery(world.id));

    expect(world.storage.keys()).toEqual([]);
    expect(await world.list.execute()).toEqual([]);
  });

  it('borrar una imagen inexistente falla', async () => {
    const world = await setup();

    await expect(world.remove.execute(new MediaIdQuery(crypto.randomUUID()))).rejects.toThrow(
      'no existe'
    );
  });
});

describe('PurgeObsoleteMediaUseCase', () => {
  const later = new Date(Date.now() + 31 * 24 * 3600 * 1000);

  it('conserva la revisión vigente y borra las anteriores ya viejas', async () => {
    const world = await setup();
    await world.reframe.execute(new ChangeFocalPointCommand(world.id, 0.3, 0.3));

    const removed = await world.purge.execute(new PurgeObsoleteMediaCommand(later));

    expect(removed).toBe(6);
    expect(world.storage.keys().filter((k) => k.includes('-1.'))).toEqual([]);
    expect(world.storage.keys()).toContain(`m/${world.id}/link-2.jpg`);
  });

  it('no borra nada si las anteriores aún no cumplen los días', async () => {
    const world = await setup();
    await world.reframe.execute(new ChangeFocalPointCommand(world.id, 0.3, 0.3));

    expect(await world.purge.execute(new PurgeObsoleteMediaCommand(new Date(0)))).toBe(0);
  });
});
