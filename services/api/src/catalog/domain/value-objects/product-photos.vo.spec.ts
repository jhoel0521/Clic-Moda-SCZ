import {
  DuplicatePhotoError,
  InvalidPhotoError,
  TooManyPhotosError,
} from '../errors/catalog.errors.js';
import { MAX_PHOTOS, PhotoRef, ProductPhotos } from './product-photos.vo.js';

const id = (n: number): string => `0a1b2c3d-0000-4000-8000-${String(n).padStart(12, '0')}`;
const refs = (count: number): PhotoRef[] =>
  Array.from({ length: count }, (_, i) => PhotoRef.of(id(i + 1)));

describe('PhotoRef', () => {
  it('acepta un UUID y rechaza lo demás', () => {
    expect(PhotoRef.of(id(1)).value).toBe(id(1));
    expect(() => PhotoRef.of('abc')).toThrow(InvalidPhotoError);
  });
});

describe('ProductPhotos: orden y principal', () => {
  it('conserva el orden y la primera es la principal', () => {
    const photos = ProductPhotos.of(refs(3));

    expect(photos.ids).toEqual([id(1), id(2), id(3)]);
    expect(photos.main?.value).toBe(id(1));
  });

  it('sin fotos no hay principal', () => {
    expect(ProductPhotos.empty().main).toBeNull();
    expect(ProductPhotos.of([]).ids).toEqual([]);
  });
});

describe('ProductPhotos: límites', () => {
  it('acepta 8 y rechaza 9', () => {
    expect(ProductPhotos.of(refs(MAX_PHOTOS)).ids).toHaveLength(8);
    expect(() => ProductPhotos.of(refs(MAX_PHOTOS + 1))).toThrow(TooManyPhotosError);
  });

  it('rechaza la misma foto dos veces', () => {
    expect(() => ProductPhotos.of([PhotoRef.of(id(1)), PhotoRef.of(id(1))])).toThrow(
      DuplicatePhotoError
    );
  });

  it('el máximo se informa en el mensaje', () => {
    expect(() => ProductPhotos.of(refs(9))).toThrow('máximo 8');
  });
});
