import { ValidationError } from '../../../shared/domain/errors/domain.error.js';
import {
  CategoryNotFoundError,
  DuplicateSkuError,
  DuplicateVariantError,
  ProductNotFoundError,
  SkuLockedError,
  VariantNotFoundError,
} from '../../domain/errors/catalog.errors.js';
import { CategoryId, ProductId, VariantId } from '../../domain/value-objects/ids.vo.js';
import { InMemoryCategoriesRepository } from '../../testing/in-memory-categories.repository.js';
import { InMemoryProductsRepository } from '../../testing/in-memory-products.repository.js';
import { InMemoryVariantHasMovements } from '../../testing/in-memory-variant-has-movements.js';
import {
  AddVariantCommand,
  GetProductQuery,
  RegisterProductCommand,
  SearchProductsQuery,
  SetProductActiveCommand,
  SetVariantActiveCommand,
  UpdateProductCommand,
  UpdateVariantCommand,
  type VariantInput,
} from '../dtos/product.dtos.js';
import { CreateCategoryUseCase } from './create-category.use-case.js';
import { AddVariantUseCase } from './add-variant.use-case.js';
import { GetProductUseCase } from './get-product.use-case.js';
import { RegisterProductUseCase } from './register-product.use-case.js';
import { SearchProductsUseCase } from './search-products.use-case.js';
import { SetProductActiveUseCase } from './set-product-active.use-case.js';
import { SetVariantActiveUseCase } from './set-variant-active.use-case.js';
import { UpdateProductUseCase } from './update-product.use-case.js';
import { UpdateVariantUseCase } from './update-variant.use-case.js';
import { CreateCategoryCommand } from '../dtos/category.dtos.js';

async function setup() {
  const categories = new InMemoryCategoriesRepository();
  const products = new InMemoryProductsRepository();
  const movements = new InMemoryVariantHasMovements();
  const category = await new CreateCategoryUseCase(categories).execute(
    new CreateCategoryCommand('Botas')
  );
  return {
    movements,
    categoryId: category.id,
    register: new RegisterProductUseCase(categories, products),
    update: new UpdateProductUseCase(categories, products),
    setActive: new SetProductActiveUseCase(products),
    addVariant: new AddVariantUseCase(products),
    updateVariant: new UpdateVariantUseCase(products, movements),
    setVariantActive: new SetVariantActiveUseCase(products),
    search: new SearchProductsUseCase(products),
    get: new GetProductUseCase(products),
  };
}
type World = Awaited<ReturnType<typeof setup>>;

const v = (size: string, color: string | null = 'Negro', sku?: string): VariantInput => ({
  size,
  color,
  sku,
  price: '349.90',
});

const botaCommand = (world: World, variants: VariantInput[]) =>
  new RegisterProductCommand(world.categoryId, 'Bota Chelsea', 'Cuero', variants);

describe('RegisterProductUseCase', () => {
  it('registra el producto activo con variantes, SKU generados únicos y precio exacto', async () => {
    const world = await setup();
    const product = await world.register.execute(botaCommand(world, [v('38'), v('39')]));

    expect(product.active).toBe(true);
    expect(product.variants.map((x) => x.sku)).toEqual(['BOT-38-NEG', 'BOT-39-NEG']);
    expect(product.variants[0]?.price).toBe('349.90');
  });

  it('respeta un SKU indicado y rechaza uno repetido en la misma solicitud', async () => {
    const world = await setup();
    const ok = await world.register.execute(botaCommand(world, [v('38', null, 'mi-sku')]));

    expect(ok.variants[0]?.sku).toBe('MI-SKU');
    await expect(
      world.register.execute(botaCommand(world, [v('38', null, 'dup-1'), v('39', null, 'DUP-1')]))
    ).rejects.toThrow(DuplicateSkuError);
  });
});

describe('RegisterProductUseCase: SKU generado', () => {
  it('genera un SKU con sufijo cuando el generado ya existe', async () => {
    const world = await setup();
    await world.register.execute(botaCommand(world, [v('38')]));
    const second = await world.register.execute(botaCommand(world, [v('38')]));

    expect(second.variants[0]?.sku).toBe('BOT-38-NEG-2');
  });
});

describe('RegisterProductUseCase: validaciones', () => {
  it('rechaza categoría inexistente, sin variantes o con una variante inválida, y no guarda nada', async () => {
    const world = await setup();
    const missing = new RegisterProductCommand(CategoryId.generate().value, 'Bota', null, [
      v('38'),
    ]);

    await expect(world.register.execute(missing)).rejects.toThrow(CategoryNotFoundError);
    await expect(world.register.execute(botaCommand(world, []))).rejects.toThrow(ValidationError);
    await expect(
      world.register.execute(botaCommand(world, [v('38'), { size: '39', price: '0' }]))
    ).rejects.toThrow('Precio inválido');
    expect((await world.search.execute(new SearchProductsQuery(1, 10))).total).toBe(0);
  });

  it('rechaza la misma talla y color dos veces', async () => {
    const world = await setup();

    await expect(
      world.register.execute(botaCommand(world, [v('38', 'Negro', 'A-1'), v('38', 'Negro', 'A-2')]))
    ).rejects.toThrow(DuplicateVariantError);
  });
});

describe('UpdateProductUseCase y SetProductActiveUseCase', () => {
  it('edita nombre y descripción y valida la categoría nueva', async () => {
    const world = await setup();
    const { id } = await world.register.execute(botaCommand(world, [v('38')]));

    const updated = await world.update.execute(
      new UpdateProductCommand(id, { name: 'Bota Pro', description: null })
    );
    expect([updated.name, updated.description]).toEqual(['Bota Pro', null]);
    await expect(
      world.update.execute(
        new UpdateProductCommand(id, { categoryId: CategoryId.generate().value })
      )
    ).rejects.toThrow(CategoryNotFoundError);
  });
});

describe('SetProductActiveUseCase', () => {
  it('desactiva y reactiva conservando las variantes', async () => {
    const world = await setup();
    const { id } = await world.register.execute(botaCommand(world, [v('38'), v('39')]));

    const off = await world.setActive.execute(new SetProductActiveCommand(id, false));
    expect([off.active, off.variants.length]).toEqual([false, 2]);
    expect((await world.setActive.execute(new SetProductActiveCommand(id, true))).active).toBe(
      true
    );
  });

  it('falla si el producto no existe', async () => {
    const world = await setup();
    const missing = ProductId.generate().value;

    await expect(world.update.execute(new UpdateProductCommand(missing, {}))).rejects.toThrow(
      ProductNotFoundError
    );
    await expect(world.get.execute(new GetProductQuery(missing))).rejects.toThrow(
      ProductNotFoundError
    );
  });
});

describe('AddVariantUseCase y SetVariantActiveUseCase', () => {
  it('agrega una variante con SKU generado sin chocar con las existentes', async () => {
    const world = await setup();
    const { id } = await world.register.execute(botaCommand(world, [v('38')]));

    const product = await world.addVariant.execute(new AddVariantCommand(id, v('39')));
    expect(product.variants.map((x) => x.sku)).toEqual(['BOT-38-NEG', 'BOT-39-NEG']);
    await expect(world.addVariant.execute(new AddVariantCommand(id, v('38')))).rejects.toThrow(
      DuplicateVariantError
    );
  });

  it('desactiva una variante sin tocar las demás y falla si no existe', async () => {
    const world = await setup();
    const product = await world.register.execute(botaCommand(world, [v('38'), v('39')]));

    const off = await world.setVariantActive.execute(
      new SetVariantActiveCommand(product.variants[0]!.id, false)
    );
    expect(off.variants.map((x) => x.active)).toEqual([false, true]);
    await expect(
      world.setVariantActive.execute(new SetVariantActiveCommand(VariantId.generate().value, true))
    ).rejects.toThrow(VariantNotFoundError);
  });
});

describe('UpdateVariantUseCase', () => {
  it('cambia precio, talla y color', async () => {
    const world = await setup();
    const product = await world.register.execute(botaCommand(world, [v('38')]));

    const updated = await world.updateVariant.execute(
      new UpdateVariantCommand(product.variants[0]!.id, { price: '400', size: '40', color: null })
    );
    expect(updated.variants[0]).toMatchObject({ price: '400.00', size: '40', color: null });
  });

  it('cambia el SKU si no tiene movimientos y lo rechaza si ya los tiene', async () => {
    const world = await setup();
    const product = await world.register.execute(botaCommand(world, [v('38'), v('39')]));
    const [first, second] = product.variants as unknown as [{ id: string }, { id: string }];

    const renamed = await world.updateVariant.execute(
      new UpdateVariantCommand(first.id, { sku: 'nuevo-1' })
    );
    expect(renamed.variants[0]?.sku).toBe('NUEVO-1');
    world.movements.addMovement(VariantId.of(second.id));
    await expect(
      world.updateVariant.execute(new UpdateVariantCommand(second.id, { sku: 'otro-2' }))
    ).rejects.toThrow(SkuLockedError);
  });
});

describe('UpdateVariantUseCase: SKU sin cambio', () => {
  it('el mismo SKU con movimientos no es un cambio y no falla', async () => {
    const world = await setup();
    const product = await world.register.execute(botaCommand(world, [v('38')]));
    const { id, sku } = product.variants[0]!;
    world.movements.addMovement(VariantId.of(id));

    await expect(
      world.updateVariant.execute(new UpdateVariantCommand(id, { sku, price: '10' }))
    ).resolves.toBeDefined();
  });
});

describe('SearchProductsUseCase y GetProductUseCase', () => {
  it('busca por texto, pagina y valida los parámetros', async () => {
    const world = await setup();
    await world.register.execute(botaCommand(world, [v('38')]));
    await world.register.execute(
      new RegisterProductCommand(world.categoryId, 'Tenis Runner', null, [v('40', 'Rojo')])
    );

    const found = await world.search.execute(new SearchProductsQuery(1, 1, 'run'));
    expect([found.total, found.items[0]?.name]).toEqual([1, 'Tenis Runner']);
    expect((await world.search.execute(new SearchProductsQuery(2, 1))).items).toHaveLength(1);
    await expect(world.search.execute(new SearchProductsQuery(0, 10))).rejects.toThrow(
      ValidationError
    );
    await expect(world.search.execute(new SearchProductsQuery(1, 101))).rejects.toThrow(
      ValidationError
    );
  });
});

describe('GetProductUseCase', () => {
  it('GetProduct devuelve el detalle con las variantes', async () => {
    const world = await setup();
    const { id } = await world.register.execute(botaCommand(world, [v('38'), v('39')]));

    expect((await world.get.execute(new GetProductQuery(id))).variants).toHaveLength(2);
  });
});
