import sharp from 'sharp';
import { computeCrop } from '../../domain/crop.js';
import {
  Framing,
  FocalPoint,
  ImageDimensions,
} from '../../domain/value-objects/image-values.vo.js';
import { MediaFormat } from '../../domain/value-objects/media-format.vo.js';
import { SharpImageProcessor } from './sharp-image-processor.js';

const processor = new SharpImageProcessor();

// Foto de prueba: degradado con ruido para que el JPEG pese algo realista.
async function photo(width: number, height: number, type: 'jpeg' | 'png' = 'jpeg') {
  const base = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: '#808080',
      noise: { type: 'gaussian', mean: 128, sigma: 40 },
    },
  });
  return type === 'jpeg' ? base.jpeg().toBuffer() : base.png().toBuffer();
}

describe('SharpImageProcessor.inspect', () => {
  it.each(['jpeg', 'png'] as const)('reconoce %s por sus bytes', async (type) => {
    expect(await processor.inspect(await photo(900, 700, type))).toEqual({
      type,
      width: 900,
      height: 700,
    });
  });

  it('reconoce webp', async () => {
    const webp = await sharp(await photo(700, 700))
      .webp()
      .toBuffer();

    expect((await processor.inspect(webp))?.type).toBe('webp');
  });

  it('rechaza lo que no es una imagen (texto, SVG, GIF)', async () => {
    const gif = await sharp(await photo(10, 10))
      .gif()
      .toBuffer();

    expect(await processor.inspect(Buffer.from('hola'))).toBeNull();
    expect(
      await processor.inspect(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'))
    ).toBeNull();
    expect(await processor.inspect(gif)).toBeNull();
  });
});

describe('SharpImageProcessor.normalize', () => {
  it('limita el lado mayor y conserva la proporción', async () => {
    const out = await processor.normalize(await photo(6000, 4000), 3000);

    expect([out.dimensions.width, out.dimensions.height, out.mime]).toEqual([
      3000,
      2000,
      'image/jpeg',
    ]);
  });

  it('no agranda una foto pequeña', async () => {
    expect((await processor.normalize(await photo(1000, 800), 3000)).dimensions.width).toBe(1000);
  });
});

describe('SharpImageProcessor.normalize: orientación', () => {
  it('endereza la orientación EXIF', async () => {
    const rotated = await sharp(await photo(1200, 800))
      .withMetadata({ orientation: 6 })
      .jpeg()
      .toBuffer();

    const out = await processor.normalize(rotated, 3000);

    expect([out.dimensions.width, out.dimensions.height]).toEqual([800, 1200]);
    expect((await sharp(out.buffer).metadata()).orientation).toBeUndefined();
  });
});

describe('SharpImageProcessor.normalize: privacidad', () => {
  it('quita todos los metadatos EXIF, incluida la ubicación GPS', async () => {
    const exif = { IFD0: { Copyright: 'privado' }, IFD3: { GPSLatitudeRef: 'S' } };
    const tagged = await sharp(await photo(1200, 800))
      .withExif(exif)
      .jpeg()
      .toBuffer();
    expect((await sharp(tagged).metadata()).exif).toBeDefined();

    const out = await processor.normalize(tagged, 3000);

    expect((await sharp(out.buffer).metadata()).exif).toBeUndefined();
  });
});

describe('SharpImageProcessor.normalize: transparencia', () => {
  it('una PNG con transparencia se queda PNG', async () => {
    const png = await sharp({
      create: {
        width: 800,
        height: 800,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0.5 },
      },
    })
      .png()
      .toBuffer();

    expect((await processor.normalize(png, 3000)).mime).toBe('image/png');
  });
});

describe('SharpImageProcessor.render', () => {
  const master = ImageDimensions.of(3000, 2000);

  it.each(['link', 'square', 'portrait', 'story', 'thumb', 'card'])(
    'genera %s con las medidas exactas',
    async (name) => {
      const format = MediaFormat.of(name);
      const plan = computeCrop(master, format, Framing.default());

      const out = await processor.render(await photo(3000, 2000), format, plan);
      const meta = await sharp(out).metadata();

      expect([meta.width, meta.height]).toEqual([format.width, format.height]);
    }
  );

  it('link pesa 300 KB o menos', async () => {
    const format = MediaFormat.of('link');
    const plan = computeCrop(master, format, Framing.default());

    const out = await processor.render(await photo(3000, 2000), format, plan);

    expect(out.length).toBeLessThanOrEqual(300_000);
  });
});

describe('SharpImageProcessor.render: formatos y modos', () => {
  const master = ImageDimensions.of(3000, 2000);

  it('los formatos para otros canales son JPEG y los de la tienda WebP', async () => {
    const framing = Framing.default();
    const link = MediaFormat.of('link');
    const card = MediaFormat.of('card');

    const jpeg = await processor.render(
      await photo(3000, 2000),
      link,
      computeCrop(master, link, framing)
    );
    const webp = await processor.render(
      await photo(3000, 2000),
      card,
      computeCrop(master, card, framing)
    );

    expect([(await sharp(jpeg).metadata()).format, (await sharp(webp).metadata()).format]).toEqual([
      'jpeg',
      'webp',
    ]);
  });
});

describe('SharpImageProcessor.render: modo contain', () => {
  const master = ImageDimensions.of(3000, 2000);

  it('contain deja el fondo elegido arriba y abajo de una foto horizontal', async () => {
    const story = MediaFormat.of('story');
    const framing = Framing.of(FocalPoint.center(), 'contain', '#ff0000');

    const out = await processor.render(
      await photo(3000, 2000),
      story,
      computeCrop(master, story, framing)
    );
    const { data } = await sharp(out)
      .extract({ left: 540, top: 5, width: 1, height: 1 })
      .raw()
      .toBuffer({ resolveWithObject: true });

    expect([(data[0] ?? 0) > 200, (data[1] ?? 255) < 60]).toEqual([true, true]);
  });
});
