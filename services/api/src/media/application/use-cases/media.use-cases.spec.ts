import { MEDIA_LIMITS } from '../../domain/media-limits.js';
import { InMemoryMediaAssetsRepository } from '../../testing/in-memory-media-assets.repository.js';
import { InMemoryMediaStorage } from '../../testing/in-memory-media-storage.js';
import { FakeImageProcessor, fakeImage } from '../../testing/fake-image-processor.js';
import { ChangeFocalPointCommand, UploadMediaCommand } from '../dtos/media.dtos.js';
import { ChangeFocalPointUseCase } from './change-focal-point.use-case.js';
import { UploadMediaUseCase } from './upload-media.use-case.js';

function setup() {
  const assets = new InMemoryMediaAssetsRepository();
  const storage = new InMemoryMediaStorage();
  const processor = new FakeImageProcessor();
  return {
    assets,
    storage,
    upload: new UploadMediaUseCase(assets, storage, processor),
    reframe: new ChangeFocalPointUseCase(assets, storage, processor),
  };
}

const photo = (type: 'jpeg' | 'png' | 'webp' = 'jpeg', w = 3000, h = 2000) => fakeImage(type, w, h);
const upload = (world: ReturnType<typeof setup>, file = photo()) =>
  world.upload.execute(new UploadMediaCommand(file, 'Bota Andes coñac de perfil'));

describe('UploadMediaUseCase: éxito', () => {
  it('crea la imagen con sus siete variantes en la revisión 1', async () => {
    const result = await upload(setup());

    expect(result.variants.map((v) => v.format).sort()).toEqual(
      ['card', 'link', 'logo', 'portrait', 'square', 'story', 'thumb'].sort()
    );
    expect(result.revision).toBe(1);
  });

  it('guarda la copia maestra y una clave por variante', async () => {
    const world = setup();
    const result = await upload(world);

    expect(world.storage.keys()).toContain(`m/${result.id}/master.jpg`);
    expect(world.storage.keys()).toHaveLength(8);
  });
});

describe('UploadMediaUseCase: resultado', () => {
  it('expone la ruta pública con formato, revisión y extensión', async () => {
    const result = await upload(setup());

    expect(result.variants.find((v) => v.format === 'link')?.url).toBe(
      `/m/${result.id}/link-1.jpg`
    );
    expect(result.variants.find((v) => v.format === 'card')?.url).toBe(
      `/m/${result.id}/card-1.webp`
    );
  });

  it('limita la maestra a 3000 px por lado', async () => {
    const result = await upload(setup(), photo('jpeg', 6000, 4000));

    expect([result.width, result.height]).toEqual([3000, 2000]);
  });

  it('una PNG queda como maestra PNG', async () => {
    const world = setup();
    const result = await upload(world, photo('png'));

    expect(world.storage.keys()).toContain(`m/${result.id}/master.png`);
  });
});

describe('UploadMediaUseCase: rechazos', () => {
  it('rechaza un archivo que no es imagen y no guarda nada', async () => {
    const world = setup();

    await expect(upload(world, Buffer.from('<svg></svg>'))).rejects.toThrow('JPEG, PNG o WebP');
    expect(world.storage.keys()).toEqual([]);
  });

  it('rechaza más de 12 MB', async () => {
    const heavy = Buffer.alloc(MEDIA_LIMITS.maxBytes + 1);

    await expect(upload(setup(), heavy)).rejects.toThrow('12 MB');
  });

  it('rechaza más de 50 megapíxeles', async () => {
    await expect(upload(setup(), photo('jpeg', 9000, 6000))).rejects.toThrow('50 megapíxeles');
  });

  it('rechaza un lado corto menor a 600 px', async () => {
    await expect(upload(setup(), photo('jpeg', 400, 300))).rejects.toThrow('600 px');
  });

  it('exige el texto alternativo', async () => {
    const command = new UploadMediaCommand(photo(), '   ');

    await expect(setup().upload.execute(command)).rejects.toThrow('texto alternativo');
  });
});

describe('UploadMediaUseCase: fallos a mitad de camino', () => {
  it('si falla la base, borra los archivos que ya había escrito', async () => {
    const world = setup();
    world.assets.save = () => Promise.reject(new Error('base caída'));

    await expect(upload(world)).rejects.toThrow('base caída');
    expect(world.storage.keys()).toEqual([]);
  });
});

describe('ChangeFocalPointUseCase', () => {
  it('crea la revisión 2 sin tocar los archivos de la 1', async () => {
    const world = setup();
    const { id } = await upload(world);

    const result = await world.reframe.execute(new ChangeFocalPointCommand(id, 0.2, 0.8));

    expect(result.revision).toBe(2);
    expect(world.storage.keys()).toContain(`m/${id}/link-1.jpg`);
    expect(world.storage.keys()).toContain(`m/${id}/link-2.jpg`);
  });

  it('conserva el modo y el fondo si no se envían', async () => {
    const world = setup();
    const created = await world.upload.execute(
      new UploadMediaCommand(photo(), 'Logo', 'contain', '#101010')
    );

    const result = await world.reframe.execute(new ChangeFocalPointCommand(created.id, 0.4, 0.4));

    expect([result.fit, result.background]).toEqual(['contain', '#101010']);
  });
});

describe('ChangeFocalPointUseCase: validación', () => {
  it('rechaza una imagen inexistente y un enfoque fuera de rango', async () => {
    const world = setup();
    const { id } = await upload(world);

    await expect(
      world.reframe.execute(new ChangeFocalPointCommand(crypto.randomUUID(), 0.5, 0.5))
    ).rejects.toThrow('no existe');
    await expect(world.reframe.execute(new ChangeFocalPointCommand(id, 2, 0.5))).rejects.toThrow(
      'entre 0 y 1'
    );
  });
});
