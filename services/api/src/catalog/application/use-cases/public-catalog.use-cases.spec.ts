import { ProductNotFoundError } from '../../domain/errors/catalog.errors.js';
import type {
  PublicCatalogReader,
  PublicListFilter,
  PublishedProduct,
} from '../../domain/public-catalog.reader.port.js';
import { Money } from '../../domain/value-objects/money.vo.js';
import { FakeMediaReferences } from '../../testing/fake-media-references.js';
import { GetPublicProductQuery, ListPublicCatalogQuery } from '../dtos/public-catalog.dtos.js';
import { GetPublicProductUseCase } from './get-public-product.use-case.js';
import { ListPublicCatalogUseCase } from './list-public-catalog.use-case.js';
import { ListPublicFiltersUseCase } from './list-public-filters.use-case.js';
import { ListPublishedSlugsUseCase } from './list-published-slugs.use-case.js';

const id = (n: number): string => `0a1b2c3d-0000-4000-8000-${String(n).padStart(12, '0')}`;

const product = (slug: string, over: Partial<PublishedProduct> = {}): PublishedProduct => ({
  slug,
  name: `Bota ${slug}`,
  description: 'Cuero',
  categoryName: 'Botas',
  categorySlug: 'botas',
  price: Money.ofDecimal('349.90'),
  photoIds: [],
  variants: [{ sku: `${slug}-38`, size: '38', color: 'Negro', available: 10 }],
  createdAt: new Date('2026-11-01T00:00:00Z'),
  updatedAt: new Date('2026-11-02T00:00:00Z'),
  ...over,
});

class StubReader implements PublicCatalogReader {
  lastFilter?: PublicListFilter;
  constructor(private readonly items: PublishedProduct[]) {}

  list(filter: PublicListFilter) {
    this.lastFilter = filter;
    return Promise.resolve({ items: this.items, total: this.items.length });
  }

  findBySlug(slug: string) {
    return Promise.resolve(this.items.find((item) => item.slug === slug) ?? null);
  }

  filters() {
    return Promise.resolve({
      categories: [{ name: 'Botas', slug: 'botas', count: 2 }],
      sizes: ['38', '39'],
    });
  }

  slugs() {
    return Promise.resolve(
      this.items.map((item) => ({ slug: item.slug, updatedAt: item.updatedAt }))
    );
  }
}

const query = (pageSize = 12) => new ListPublicCatalogQuery(1, pageSize, 'new', false);

describe('lectura pública: disponibilidad como estado', () => {
  it('muestra "low" para 1 a 3 unidades y no expone la cantidad', async () => {
    const reader = new StubReader([
      product('a', { variants: [{ sku: 'A', size: '38', color: null, available: 2 }] }),
    ]);

    const page = await new ListPublicCatalogUseCase(reader, new FakeMediaReferences()).execute(
      query()
    );

    expect(page.items[0]?.availability).toBe('low');
    expect(JSON.stringify(page)).not.toMatch(/available|"2"|onHand|location|reorder/);
  });

  it('el detalle da el estado de cada variante y el del producto (out solo si todas están agotadas)', async () => {
    const variants = [
      { sku: 'A-38', size: '38', color: 'Negro', available: 0 },
      { sku: 'A-39', size: '39', color: 'Negro', available: 12 },
    ];
    const reader = new StubReader([product('a', { variants })]);

    const detail = await new GetPublicProductUseCase(reader, new FakeMediaReferences()).execute(
      new GetPublicProductQuery('a')
    );

    expect(detail.variants.map((v) => v.availability)).toEqual(['out', 'in_stock']);
    expect(detail.availability).toBe('in_stock');
  });
});

describe('lectura pública: fotos sin N+1', () => {
  it('resuelve las fotos de TODA la página con una sola consulta a medios', async () => {
    const media = new FakeMediaReferences()
      .add({ id: id(1), revision: 2, alt: 'Frente' })
      .add({ id: id(2), revision: 1, alt: 'Lado' })
      .add({ id: id(3), revision: 1, alt: 'Atrás' });
    const reader = new StubReader([
      product('a', { photoIds: [id(1), id(2)] }),
      product('b', { photoIds: [id(3)] }),
      product('c', { photoIds: [] }),
    ]);

    const page = await new ListPublicCatalogUseCase(reader, media).execute(query());

    expect(media.calls).toBe(1);
    expect(page.items.map((item) => item.photo?.alt ?? null)).toEqual(['Frente', 'Atrás', null]);
    expect(page.items[0]?.photo).toEqual({
      alt: 'Frente',
      card: `/m/${id(1)}/card-2.webp`,
      thumb: `/m/${id(1)}/thumb-2.webp`,
      link: `/m/${id(1)}/link-2.jpg`,
    });
  });
});

describe('lectura pública: imagen borrada', () => {
  it('una imagen borrada se omite y la siguiente pasa a ser la principal', async () => {
    const media = new FakeMediaReferences().add({ id: id(2), revision: 1, alt: 'Lado' });
    const reader = new StubReader([product('a', { photoIds: [id(1), id(2)] })]);

    const detail = await new GetPublicProductUseCase(reader, media).execute(
      new GetPublicProductQuery('a')
    );

    expect(detail.photos.map((photo) => photo.alt)).toEqual(['Lado']);
  });
});

describe('lectura pública: límites y 404', () => {
  it('acota el tamaño de página a 48', async () => {
    const reader = new StubReader([product('a')]);

    const page = await new ListPublicCatalogUseCase(reader, new FakeMediaReferences()).execute(
      query(500)
    );

    expect([page.pageSize, reader.lastFilter?.pageSize]).toEqual([48, 48]);
  });

  it('un slug que no existe da 404 (ProductNotFoundError)', async () => {
    const useCase = new GetPublicProductUseCase(new StubReader([]), new FakeMediaReferences());

    await expect(useCase.execute(new GetPublicProductQuery('no-existe'))).rejects.toThrow(
      ProductNotFoundError
    );
  });

  it('filtros y slugs pasan tal cual, con fechas en ISO', async () => {
    const reader = new StubReader([product('a')]);

    expect((await new ListPublicFiltersUseCase(reader).execute()).sizes).toEqual(['38', '39']);
    expect(await new ListPublishedSlugsUseCase(reader).execute()).toEqual([
      { slug: 'a', updatedAt: '2026-11-02T00:00:00.000Z' },
    ]);
  });
});
