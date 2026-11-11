import type { CategoriesRepository } from '../domain/categories.repository.port.js';
import { Category } from '../domain/entities/category.entity.js';
import { Product } from '../domain/entities/product.entity.js';
import { Variant } from '../domain/entities/variant.entity.js';
import { DuplicateSkuError } from '../domain/errors/catalog.errors.js';
import type { ProductsRepository } from '../domain/products.repository.port.js';
import { ProductId, VariantId } from '../domain/value-objects/ids.vo.js';
import { Money } from '../domain/value-objects/money.vo.js';
import { CategoryName, ProductName, Slug } from '../domain/value-objects/names.vo.js';
import { Color, Size, Sku } from '../domain/value-objects/variant-attributes.vo.js';

export interface ProductsWorld {
  categories: CategoriesRepository;
  products: ProductsRepository;
  // Fija las unidades disponibles de una variante (en la base real, su fila de stock).
  setAvailable(variantId: VariantId, units: number): Promise<void>;
}
type Factory = () => Promise<ProductsWorld> | ProductsWorld;

const variant = (sku: string, size: string, color: string | null = null): Variant =>
  Variant.create({
    sku: Sku.of(sku),
    size: Size.of(size),
    color: color ? Color.of(color) : null,
    price: Money.ofDecimal('349.90'),
  });

async function newCategory(world: ProductsWorld, name: string): Promise<Category> {
  const created = Category.create(CategoryName.of(name));
  await world.categories.save(created);
  return created;
}

const product = (category: Category, name: string, variants: Variant[]): Product =>
  Product.register({ categoryId: category.id, name: ProductName.of(name) }, variants);

function readCases(make: Factory): void {
  it('findById y findByVariantId devuelven null si no existen', async () => {
    const { products } = await make();
    expect(await products.findById(ProductId.generate())).toBeNull();
    expect(await products.findByVariantId(VariantId.generate())).toBeNull();
  });

  it('guarda un producto y lo recupera con todas sus variantes y datos', async () => {
    const world = await make();
    const botas = await newCategory(world, 'Botas');
    const saved = product(botas, 'Bota Chelsea', [variant('BOT-38-NEG', '38', 'Negro')]);
    await world.products.save(saved);

    const found = await world.products.findById(saved.id);
    expect(found?.name.value).toBe('Bota Chelsea');
    expect(found?.variants).toHaveLength(1);
    expect([found?.variants[0]?.sku.value, found?.variants[0]?.price.cents]).toEqual([
      'BOT-38-NEG',
      34990,
    ]);
  });
}

function findCases(make: Factory): void {
  it('findByVariantId encuentra el producto dueño de la variante', async () => {
    const world = await make();
    const saved = product(await newCategory(world, 'Botas'), 'Bota', [variant('B-1', '38')]);
    await world.products.save(saved);

    const found = await world.products.findByVariantId(saved.variants[0]!.id);
    expect(found?.id.equals(saved.id)).toBe(true);
  });
}

function writeCases(make: Factory): void {
  it('save actualiza por id: agrega variantes y cambia datos', async () => {
    const world = await make();
    const saved = product(await newCategory(world, 'Botas'), 'Bota', [variant('B-1', '38')]);
    await world.products.save(saved);
    saved.addVariant(variant('B-2', '39'));
    saved.update({ name: ProductName.of('Bota Pro') });
    saved.setActive(false);
    await world.products.save(saved);

    const found = await world.products.findById(saved.id);
    expect([found?.name.value, found?.active, found?.variants.length]).toEqual([
      'Bota Pro',
      false,
      2,
    ]);
  });

  it('skuExists no distingue mayúsculas', async () => {
    const world = await make();
    await world.products.save(
      product(await newCategory(world, 'Botas'), 'Bota', [variant('B-1', '38')])
    );

    expect(await world.products.skuExists(Sku.of('b-1'))).toBe(true);
    expect(await world.products.skuExists(Sku.of('B-9'))).toBe(false);
  });
}

function atomicityCases(make: Factory): void {
  it('un SKU de otro producto es conflicto y no se guarda nada (todo o nada)', async () => {
    const world = await make();
    const botas = await newCategory(world, 'Botas');
    await world.products.save(product(botas, 'Bota', [variant('B-1', '38')]));
    const second = product(botas, 'Otra', [variant('O-1', '38'), variant('b-1', '39')]);

    await expect(world.products.save(second)).rejects.toThrow(DuplicateSkuError);
    expect(await world.products.findById(second.id)).toBeNull();
    expect(await world.products.skuExists(Sku.of('O-1'))).toBe(false);
  });

  it('guardar otra vez el mismo producto con sus propios SKU no es conflicto', async () => {
    const world = await make();
    const saved = product(await newCategory(world, 'Botas'), 'Bota', [variant('B-1', '38')]);
    await world.products.save(saved);

    await expect(world.products.save(saved)).resolves.toBeUndefined();
  });
}

async function seedSearch(world: ProductsWorld): Promise<Category[]> {
  const [botas, tenis] = [await newCategory(world, 'Botas'), await newCategory(world, 'Tenis')];
  const inactive = product(tenis, 'Tenis Viejo', [variant('TV-40', '40')]);
  inactive.setActive(false);
  const items = [product(botas, 'Bota Chelsea', [variant('BOT-38', '38')]), inactive];
  for (const item of items) await world.products.save(item);
  await world.products.save(product(tenis, 'Tenis Runner', [variant('RUN-41', '41')]));
  return [botas, tenis];
}

function searchCases(make: Factory): void {
  it('filtra por texto (nombre o SKU), categoría y estado', async () => {
    const world = await make();
    const [botas, tenis] = await seedSearch(world);
    const page = { page: 1, pageSize: 10 };
    const names = async (filter: object) =>
      (await world.products.search({ ...page, ...filter })).items.map((p) => p.name.value);

    expect(await names({ text: 'CHELSEA' })).toEqual(['Bota Chelsea']);
    expect(await names({ text: 'run-4' })).toEqual(['Tenis Runner']);
    expect(await names({ categoryId: tenis.id })).toEqual(['Tenis Runner', 'Tenis Viejo']);
    expect(await names({ categoryId: botas.id, active: false })).toEqual([]);
    expect(await names({ active: false })).toEqual(['Tenis Viejo']);
  });

  it('pagina, ordena por nombre e informa el total sin paginar', async () => {
    const world = await make();
    await seedSearch(world);

    const second = await world.products.search({ page: 2, pageSize: 2 });
    expect(second.total).toBe(3);
    expect(second.items.map((p) => p.name.value)).toEqual(['Tenis Viejo']);
  });
}

function countCases(make: Factory): void {
  it('countByCategory cuenta los productos activos e inactivos', async () => {
    const world = await make();
    const [botas, tenis] = await seedSearch(world);

    expect(await world.products.countByCategory(tenis.id)).toBe(2);
    expect(await world.products.countByCategory(botas.id)).toBe(1);
  });
}

function stockCases(make: Factory): void {
  it('filtra por stock y informa las unidades disponibles de cada producto', async () => {
    const world = await make();
    const botas = await newCategory(world, 'Botas');
    const withStock = product(botas, 'Con stock', [variant('CS-1', '38'), variant('CS-2', '39')]);
    const without = product(botas, 'Sin stock', [variant('SS-1', '38')]);
    for (const item of [withStock, without]) await world.products.save(item);
    await world.setAvailable(withStock.variants[0]!.id, 3);
    await world.setAvailable(withStock.variants[1]!.id, 4);
    const names = async (stock?: 'out' | 'in') =>
      (await world.products.search({ page: 1, pageSize: 10, stock })).items.map(
        (p) => p.name.value
      );

    expect(await names('out')).toEqual(['Sin stock']);
    expect(await names('in')).toEqual(['Con stock']);
    const all = await world.products.search({ page: 1, pageSize: 10 });
    expect([all.available[withStock.id.value], all.available[without.id.value]]).toEqual([7, 0]);
  });
}

function stockCases2(make: Factory): void {
  it('las variantes inactivas no suman al disponible del producto', async () => {
    const world = await make();
    const saved = product(await newCategory(world, 'Botas'), 'Bota', [
      variant('B-1', '38'),
      variant('B-2', '39'),
    ]);
    saved.variants[1]!.setActive(false);
    await world.products.save(saved);
    await world.setAvailable(saved.variants[0]!.id, 2);
    await world.setAvailable(saved.variants[1]!.id, 50);

    const page = await world.products.search({ page: 1, pageSize: 10 });
    expect(page.available[saved.id.value]).toBe(2);
  });
}

function variantStockCases(make: Factory): void {
  it('informa el stock disponible de cada variante de la página', async () => {
    const world = await make();
    const saved = product(await newCategory(world, 'Botas'), 'Bota', [
      variant('B-1', '38'),
      variant('B-2', '39'),
    ]);
    await world.products.save(saved);
    await world.setAvailable(saved.variants[0]!.id, 6);
    const page = await world.products.search({ page: 1, pageSize: 10 });
    const stock = (index: number) => page.variantStock[saved.variants[index]!.id.value]?.available;

    expect([stock(0), stock(1)]).toEqual([6, 0]);
  });
}

function soldOutCases(make: Factory): void {
  it('cuenta las variantes agotadas y filtra los productos con alguna agotada aunque tengan stock', async () => {
    const world = await make();
    const botas = await newCategory(world, 'Botas');
    const mixed = product(botas, 'Mixto', [
      variant('M-1', '38'),
      variant('M-2', '39'),
      variant('M-3', '40'),
    ]);
    const full = product(botas, 'Completo', [variant('C-1', '38')]);
    for (const item of [mixed, full]) await world.products.save(item);
    await world.setAvailable(mixed.variants[0]!.id, 5);
    await world.setAvailable(full.variants[0]!.id, 2);
    const page = await world.products.search({ page: 1, pageSize: 10 });
    const partial = await world.products.search({ page: 1, pageSize: 10, stock: 'partial' });

    expect([page.soldOutVariants[mixed.id.value], page.soldOutVariants[full.id.value]]).toEqual([
      2, 0,
    ]);
    expect(partial.items.map((p) => p.name.value)).toEqual(['Mixto']);
    expect(page.available[mixed.id.value]).toBe(5);
  });
}

function slugCases(make: Factory): void {
  it('guarda el slug y lo encuentra por slug; slugExists dice si está en uso', async () => {
    const world = await make();
    const botas = await newCategory(world, 'Botas');
    const saved = product(botas, 'Bota Andes Coñac', [variant('BAC-1', '38')]);
    await world.products.save(saved);

    const found = await world.products.findBySlug(Slug.of('bota-andes-conac'));

    expect(found?.id.equals(saved.id)).toBe(true);
    expect(await world.products.slugExists(Slug.of('bota-andes-conac'))).toBe(true);
    expect(await world.products.slugExists(Slug.of('otra-cosa'))).toBe(false);
    expect(await world.products.findBySlug(Slug.of('otra-cosa'))).toBeNull();
  });

  it('renombrar el producto no cambia su slug al volver a guardarlo', async () => {
    const world = await make();
    const botas = await newCategory(world, 'Botas');
    const saved = product(botas, 'Bota Andes', [variant('BA-1', '38')]);
    await world.products.save(saved);

    saved.update({ name: ProductName.of('Bota Andes Nueva') });
    await world.products.save(saved);

    const found = await world.products.findById(saved.id);
    expect([found?.name.value, found?.slug.value]).toEqual(['Bota Andes Nueva', 'bota-andes']);
  });
}

// Suite de contrato: toda implementación del puerto (fake en memoria y TypeORM) debe pasarla.
export function productsRepositoryContract(label: string, make: Factory): void {
  describe(`ProductsRepository: ${label}`, () => {
    readCases(make);
    findCases(make);
    writeCases(make);
    atomicityCases(make);
    searchCases(make);
    stockCases(make);
    soldOutCases(make);
    variantStockCases(make);
    stockCases2(make);
    countCases(make);
    slugCases(make);
  });
}
