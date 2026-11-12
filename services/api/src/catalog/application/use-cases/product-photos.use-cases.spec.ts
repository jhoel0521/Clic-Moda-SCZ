import { FieldValidationError } from '../../../shared/domain/errors/domain.error.js';
import { ProductNotFoundError, TooManyPhotosError } from '../../domain/errors/catalog.errors.js';
import { FakeMediaReferences } from '../../testing/fake-media-references.js';
import { InMemoryCategoriesRepository } from '../../testing/in-memory-categories.repository.js';
import { InMemoryProductsRepository } from '../../testing/in-memory-products.repository.js';
import { CreateCategoryCommand } from '../dtos/category.dtos.js';
import {
  GetProductQuery,
  RegisterProductCommand,
  SetProductPhotosCommand,
} from '../dtos/product.dtos.js';
import { CreateCategoryUseCase } from './create-category.use-case.js';
import { GetProductUseCase } from './get-product.use-case.js';
import { RegisterProductUseCase } from './register-product.use-case.js';
import { SetProductPhotosUseCase } from './set-product-photos.use-case.js';

const id = (n: number): string => `0a1b2c3d-0000-4000-8000-${String(n).padStart(12, '0')}`;

async function setup() {
  const categories = new InMemoryCategoriesRepository();
  const products = new InMemoryProductsRepository();
  const media = new FakeMediaReferences();
  for (let n = 1; n <= 9; n++) media.add({ id: id(n), revision: 1, alt: `Foto ${String(n)}` });
  const category = await new CreateCategoryUseCase(categories).execute(
    new CreateCategoryCommand('Botas')
  );
  const product = await new RegisterProductUseCase(categories, products).execute(
    new RegisterProductCommand(category.id, 'Bota Andes', null, [
      { size: '38', color: 'Negro', price: '100' },
    ])
  );
  return {
    media,
    productId: product.id,
    setPhotos: new SetProductPhotosUseCase(products, media),
    get: new GetProductUseCase(products, media),
  };
}

describe('SetProductPhotosUseCase: guardar', () => {
  it('guarda las fotos en orden y la primera es la principal', async () => {
    const { setPhotos, get, productId } = await setup();

    await setPhotos.execute(new SetProductPhotosCommand(productId, [id(3), id(1), id(2)]));

    expect((await get.execute(new GetProductQuery(productId))).photos).toEqual([
      id(3),
      id(1),
      id(2),
    ]);
  });

  it('reordenar reemplaza la lista y quitar una foto la saca del producto', async () => {
    const { setPhotos, productId } = await setup();
    await setPhotos.execute(new SetProductPhotosCommand(productId, [id(1), id(2), id(3)]));

    const result = await setPhotos.execute(new SetProductPhotosCommand(productId, [id(3), id(1)]));

    expect(result.photos).toEqual([id(3), id(1)]);
  });

  it('un producto sin fotos es válido', async () => {
    const { setPhotos, productId } = await setup();

    expect((await setPhotos.execute(new SetProductPhotosCommand(productId, []))).photos).toEqual(
      []
    );
  });
});

describe('SetProductPhotosUseCase: rechazos', () => {
  it('una imagen que no existe se rechaza diciendo cuál y no cambia nada', async () => {
    const { setPhotos, get, productId } = await setup();
    await setPhotos.execute(new SetProductPhotosCommand(productId, [id(1)]));

    const error = await setPhotos
      .execute(new SetProductPhotosCommand(productId, [id(2), id(99)]))
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(FieldValidationError);
    expect((error as FieldValidationError).issues).toEqual([
      { field: 'photos.1', message: 'La imagen no existe o no está publicada' },
    ]);
    expect((await get.execute(new GetProductQuery(productId))).photos).toEqual([id(1)]);
  });
});

describe('SetProductPhotosUseCase: límites', () => {
  it('rechaza 9 fotos y repetidas', async () => {
    const { setPhotos, productId } = await setup();
    const nine = Array.from({ length: 9 }, (_, i) => id(i + 1));

    await expect(setPhotos.execute(new SetProductPhotosCommand(productId, nine))).rejects.toThrow(
      TooManyPhotosError
    );
    await expect(
      setPhotos.execute(new SetProductPhotosCommand(productId, [id(1), id(1)]))
    ).rejects.toThrow('repetirse');
  });

  it('un producto que no existe da error', async () => {
    const { setPhotos } = await setup();

    await expect(setPhotos.execute(new SetProductPhotosCommand(id(50), [id(1)]))).rejects.toThrow(
      ProductNotFoundError
    );
  });
});

describe('GetProductUseCase: imagen borrada', () => {
  it('omite la foto cuya imagen se borró y la siguiente pasa a ser la principal', async () => {
    const { setPhotos, get, media, productId } = await setup();
    await setPhotos.execute(new SetProductPhotosCommand(productId, [id(1), id(2), id(3)]));

    media.remove(id(1));

    expect((await get.execute(new GetProductQuery(productId))).photos).toEqual([id(2), id(3)]);
  });
});
