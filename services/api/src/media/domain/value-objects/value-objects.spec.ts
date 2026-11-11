import { MediaId } from './media-id.vo.js';
import { MediaFormat, MEDIA_FORMAT_NAMES } from './media-format.vo.js';
import { AltText, FocalPoint, Framing, ImageDimensions, Revision } from './image-values.vo.js';

describe('MediaFormat', () => {
  it.each([
    ['link', 1200, 630, 'image/jpeg', 'jpg'],
    ['square', 1080, 1080, 'image/jpeg', 'jpg'],
    ['portrait', 1080, 1350, 'image/jpeg', 'jpg'],
    ['story', 1080, 1920, 'image/jpeg', 'jpg'],
    ['thumb', 320, 320, 'image/webp', 'webp'],
    ['card', 800, 1000, 'image/webp', 'webp'],
    ['logo', 640, 320, 'image/webp', 'webp'],
  ])('%s mide %ix%i en %s', (name, width, height, mime, extension) => {
    const format = MediaFormat.of(name);

    expect([format.width, format.height, format.mime, format.extension]).toEqual([
      width,
      height,
      mime,
      extension,
    ]);
  });
});

describe('MediaFormat: peso y catálogo', () => {
  it('solo link tiene tope de peso (300 KB)', () => {
    expect(MediaFormat.of('link').maxBytes).toBe(300_000);
    expect(MediaFormat.of('story').maxBytes).toBeUndefined();
  });

  it('all() devuelve los siete formatos', () => {
    expect(MediaFormat.all().map((f) => f.name)).toEqual(MEDIA_FORMAT_NAMES);
  });

  it('rechaza un formato desconocido, incluido uno heredado del prototipo', () => {
    expect(() => MediaFormat.of('banner')).toThrow('formato de imagen conocido');
    expect(() => MediaFormat.of('constructor')).toThrow('formato de imagen conocido');
  });
});

describe('AltText', () => {
  it('limpia espacios y acepta de 1 a 125 caracteres', () => {
    expect(AltText.of('  Bota   Andes  coñac ').value).toBe('Bota Andes coñac');
    expect(AltText.of('a'.repeat(125)).value).toHaveLength(125);
  });

  it.each(['', '   ', 'a'.repeat(126)])('rechaza %j', (raw) => {
    expect(() => AltText.of(raw)).toThrow('entre 1 y 125');
  });
});

describe('FocalPoint y Framing', () => {
  it('por defecto está en el centro', () => {
    expect(FocalPoint.center().equals(FocalPoint.of(0.5, 0.5))).toBe(true);
  });

  it.each([
    [-0.1, 0.5],
    [0.5, 1.1],
    [Number.NaN, 0],
  ])('rechaza el enfoque (%f, %f)', (x, y) => {
    expect(() => FocalPoint.of(x, y)).toThrow('entre 0 y 1');
  });

  it('el encuadre por defecto es cover, centrado y con fondo blanco', () => {
    const framing = Framing.default();

    expect([framing.fit, framing.background, framing.focal.x]).toEqual(['cover', '#ffffff', 0.5]);
  });

  it('rechaza un fondo que no es #rrggbb o un modo desconocido', () => {
    expect(() => Framing.of(FocalPoint.center(), 'cover', 'rojo')).toThrow('#rrggbb');
    expect(() => Framing.of(FocalPoint.center(), 'fill' as 'cover')).toThrow('modo');
  });
});

describe('ImageDimensions', () => {
  it('expone el lado corto y los píxeles', () => {
    const d = ImageDimensions.of(3000, 2000);

    expect([d.shortSide, d.pixels]).toEqual([2000, 6_000_000]);
  });

  it.each([
    [0, 10],
    [10, -1],
    [1.5, 10],
  ])('rechaza %f x %f', (w, h) => {
    expect(() => ImageDimensions.of(w, h)).toThrow('Medidas');
  });
});

describe('Revision', () => {
  it('empieza en 1 y avanza de uno en uno', () => {
    expect(Revision.first().next().value).toBe(2);
  });

  it.each([0, -1, 1.5])('rechaza %f', (n) => {
    expect(() => Revision.of(n)).toThrow('revisión');
  });
});

describe('MediaId', () => {
  it('genera y reconoce un UUID', () => {
    const id = MediaId.generate();

    expect(MediaId.of(id.value).equals(id)).toBe(true);
  });

  it('rechaza un texto que no es UUID', () => {
    expect(() => MediaId.of('no-es-uuid')).toThrow('identificador de imagen');
  });
});
