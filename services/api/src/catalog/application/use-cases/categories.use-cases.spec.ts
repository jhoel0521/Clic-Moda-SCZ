import {
  CategoryInUseError,
  CategoryNotFoundError,
  DuplicateCategoryError,
} from '../../domain/errors/catalog.errors.js';
import { Product } from '../../domain/entities/product.entity.js';
import { Variant } from '../../domain/entities/variant.entity.js';
import { CategoryId } from '../../domain/value-objects/ids.vo.js';
import { Money } from '../../domain/value-objects/money.vo.js';
import { ProductName } from '../../domain/value-objects/names.vo.js';
import { Size, Sku } from '../../domain/value-objects/variant-attributes.vo.js';
import { InMemoryCategoriesRepository } from '../../testing/in-memory-categories.repository.js';
import { InMemoryProductsRepository } from '../../testing/in-memory-products.repository.js';
import {
  CreateCategoryCommand,
  DeleteCategoryCommand,
  UpdateCategoryCommand,
} from '../dtos/category.dtos.js';
import { CreateCategoryUseCase } from './create-category.use-case.js';
import { DeleteCategoryUseCase } from './delete-category.use-case.js';
import { ListCategoriesUseCase } from './list-categories.use-case.js';
import { UpdateCategoryUseCase } from './update-category.use-case.js';

function setup() {
  const categories = new InMemoryCategoriesRepository();
  const products = new InMemoryProductsRepository();
  return {
    products,
    create: new CreateCategoryUseCase(categories),
    update: new UpdateCategoryUseCase(categories, products),
    remove: new DeleteCategoryUseCase(categories, products),
    list: new ListCategoriesUseCase(categories, products),
  };
}

async function addProduct(world: ReturnType<typeof setup>, categoryId: string): Promise<void> {
  const variant = Variant.create({
    sku: Sku.of('B-1'),
    size: Size.of('38'),
    color: null,
    price: Money.ofDecimal('100'),
  });
  const product = Product.register(
    { categoryId: CategoryId.of(categoryId), name: ProductName.of('Bota') },
    [variant]
  );
  await world.products.save(product);
}

describe('CreateCategoryUseCase', () => {
  it('crea una categoría activa con su slug y cero productos', async () => {
    const created = await setup().create.execute(new CreateCategoryCommand('Zapatillas Urbanas'));

    expect(created).toMatchObject({
      name: 'Zapatillas Urbanas',
      slug: 'zapatillas-urbanas',
      active: true,
      productCount: 0,
    });
  });

  it('rechaza un nombre repetido sin distinguir mayúsculas ni espacios sobrantes', async () => {
    const { create } = setup();
    await create.execute(new CreateCategoryCommand('Zapatillas Urbanas'));

    await expect(create.execute(new CreateCategoryCommand(' zapatillas urbanas '))).rejects.toThrow(
      DuplicateCategoryError
    );
  });

  it('rechaza un nombre inválido antes de tocar el repositorio', async () => {
    await expect(setup().create.execute(new CreateCategoryCommand('A'))).rejects.toThrow(
      'entre 2 y 60'
    );
  });
});

describe('UpdateCategoryUseCase', () => {
  it('renombra y actualiza el slug', async () => {
    const world = setup();
    const { id } = await world.create.execute(new CreateCategoryCommand('Botas'));

    const updated = await world.update.execute(new UpdateCategoryCommand(id, 'Botines Ñandú'));
    expect([updated.name, updated.slug]).toEqual(['Botines Ñandú', 'botines-nandu']);
  });

  it('permite guardar la categoría con su mismo nombre y rechaza el de otra', async () => {
    const world = setup();
    const { id } = await world.create.execute(new CreateCategoryCommand('Botas'));
    await world.create.execute(new CreateCategoryCommand('Tenis'));

    await expect(
      world.update.execute(new UpdateCategoryCommand(id, 'BOTAS'))
    ).resolves.toBeDefined();
    await expect(world.update.execute(new UpdateCategoryCommand(id, 'tenis'))).rejects.toThrow(
      DuplicateCategoryError
    );
  });

  it('falla si la categoría no existe', async () => {
    const missing = CategoryId.generate().value;

    await expect(setup().update.execute(new UpdateCategoryCommand(missing, 'X1'))).rejects.toThrow(
      CategoryNotFoundError
    );
  });
});

describe('DeleteCategoryUseCase', () => {
  it('borra una categoría sin productos', async () => {
    const world = setup();
    const { id } = await world.create.execute(new CreateCategoryCommand('Botas'));
    await world.remove.execute(new DeleteCategoryCommand(id));

    expect(await world.list.execute()).toEqual([]);
  });

  it('rechaza borrar una categoría con productos y la conserva', async () => {
    const world = setup();
    const { id } = await world.create.execute(new CreateCategoryCommand('Botas'));
    await addProduct(world, id);

    await expect(world.remove.execute(new DeleteCategoryCommand(id))).rejects.toThrow(
      CategoryInUseError
    );
    expect(await world.list.execute()).toHaveLength(1);
  });

  it('falla si la categoría no existe', async () => {
    const missing = new DeleteCategoryCommand(CategoryId.generate().value);

    await expect(setup().remove.execute(missing)).rejects.toThrow(CategoryNotFoundError);
  });
});

describe('ListCategoriesUseCase', () => {
  it('lista por nombre con la cantidad de productos de cada una', async () => {
    const world = setup();
    const botas = await world.create.execute(new CreateCategoryCommand('Botas'));
    await world.create.execute(new CreateCategoryCommand('Tenis'));
    await addProduct(world, botas.id);

    const listed = await world.list.execute();
    expect(listed.map((c) => [c.name, c.productCount])).toEqual([
      ['Botas', 1],
      ['Tenis', 0],
    ]);
  });
});
