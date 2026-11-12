import { CreateCategoryCommand } from '../dtos/category.dtos.js';
import { RegisterProductCommand, UpdateProductCommand } from '../dtos/product.dtos.js';
import { InMemoryCategoriesRepository } from '../../testing/in-memory-categories.repository.js';
import { InMemoryProductsRepository } from '../../testing/in-memory-products.repository.js';
import { CreateCategoryUseCase } from './create-category.use-case.js';
import { RegisterProductUseCase } from './register-product.use-case.js';
import { UpdateProductUseCase } from './update-product.use-case.js';

async function setup() {
  const categories = new InMemoryCategoriesRepository();
  const products = new InMemoryProductsRepository();
  const category = await new CreateCategoryUseCase(categories).execute(
    new CreateCategoryCommand('Botas')
  );
  return {
    categoryId: category.id,
    register: new RegisterProductUseCase(categories, products),
    update: new UpdateProductUseCase(categories, products),
  };
}

const named = (categoryId: string, name: string) =>
  new RegisterProductCommand(categoryId, name, null, [
    { size: '38', color: 'Negro', price: '100' },
  ]);

describe('slug de producto: registro', () => {
  it('se deriva del nombre, sin acentos y en minúsculas', async () => {
    const { register, categoryId } = await setup();

    const product = await register.execute(named(categoryId, 'Bota Andes Coñac'));

    expect(product.slug).toBe('bota-andes-conac');
  });

  it('si ya existe agrega -2 y luego -3', async () => {
    const { register, categoryId } = await setup();

    const first = await register.execute(named(categoryId, 'Bota Andes'));
    const second = await register.execute(named(categoryId, 'Bota Andes'));
    const third = await register.execute(named(categoryId, 'bota   andes'));

    expect([first.slug, second.slug, third.slug]).toEqual([
      'bota-andes',
      'bota-andes-2',
      'bota-andes-3',
    ]);
  });

  it('un nombre solo con símbolos recibe "producto" y no falla', async () => {
    const { register, categoryId } = await setup();

    expect((await register.execute(named(categoryId, '★★'))).slug).toBe('producto');
  });
});

describe('slug de producto: renombrar', () => {
  it('cambiar el nombre no cambia el slug (los enlaces compartidos siguen valiendo)', async () => {
    const { register, update, categoryId } = await setup();
    const product = await register.execute(named(categoryId, 'Bota Andes'));

    const renamed = await update.execute(
      new UpdateProductCommand(product.id, { name: 'Bota Andes Nueva' })
    );

    expect([renamed.name, renamed.slug]).toEqual(['Bota Andes Nueva', 'bota-andes']);
  });
});
