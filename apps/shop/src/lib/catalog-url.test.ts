import { describe, expect, it } from 'vitest';
import type { Filters } from './catalog';
import {
  activeChips,
  catalogHref,
  parseCatalogState,
  toListParams,
  totalPages,
  withFilter,
} from './catalog-url';

const parse = (query: string) => parseCatalogState(new URLSearchParams(query));
const FILTERS: Filters = {
  categories: [{ name: 'Botas', slug: 'botas', count: 3 }],
  sizes: ['38'],
};

describe('parseCatalogState', () => {
  it('sin parámetros da el estado por omisión', () => {
    expect(parse('')).toEqual({
      category: null,
      size: null,
      q: null,
      available: false,
      sort: 'new',
      page: 1,
    });
  });

  it('lee los filtros en español', () => {
    expect(
      parse('categoria=botas&talla=38&q=andes&disponibles=1&orden=precio-desc&pagina=3')
    ).toEqual({
      category: 'botas',
      size: '38',
      q: 'andes',
      available: true,
      sort: 'price_desc',
      page: 3,
    });
  });
});

describe('catalog-url (2)', () => {
  it('ignora valores inválidos: orden desconocido, página negativa o rara, textos vacíos', () => {
    expect(parse('orden=raro&pagina=-4&q=%20%20&talla=')).toMatchObject({
      sort: 'new',
      page: 1,
      q: null,
      size: null,
    });
    expect(parse('pagina=abc').page).toBe(1);
  });

  it('acota el largo de los textos', () => {
    expect(parse(`q=${'x'.repeat(500)}`).q).toHaveLength(100);
  });
});

describe('catalogHref', () => {
  it('escribe solo lo que no es por omisión, en orden fijo', () => {
    expect(catalogHref(parse(''))).toBe('/catalogo');
    expect(catalogHref(parse('pagina=2&orden=precio-asc&talla=38&categoria=botas'))).toBe(
      '/catalogo?categoria=botas&talla=38&orden=precio-asc&pagina=2'
    );
  });

  it('ida y vuelta: parsear lo que se escribió da el mismo estado', () => {
    const state = parse('categoria=botas&talla=38&q=andes&disponibles=1&orden=precio-asc&pagina=2');

    expect(parse(catalogHref(state).split('?')[1] ?? '')).toEqual(state);
  });
});

describe('withFilter y toListParams', () => {
  it('cambiar un filtro vuelve a la página 1; cambiar la página no toca los filtros', () => {
    const state = parse('categoria=botas&pagina=3');

    expect(withFilter(state, { size: '38' }).page).toBe(1);
    expect(withFilter(state, { page: 4 })).toMatchObject({ page: 4, category: 'botas' });
  });

  it('traduce al lenguaje de la API', () => {
    expect(toListParams(parse('categoria=botas&orden=precio-asc&disponibles=1'))).toEqual({
      page: 1,
      category: 'botas',
      size: undefined,
      q: undefined,
      available: true,
      sort: 'price_asc',
    });
  });
});

describe('chips y páginas', () => {
  it('cada filtro activo es un chip cuyo enlace lo quita y vuelve a la página 1', () => {
    const chips = activeChips(parse('categoria=botas&talla=38&pagina=2'), FILTERS);

    expect(chips.map((chip) => chip.label)).toEqual(['Botas', 'Talla 38']);
    expect(chips[0]?.href).toBe('/catalogo?talla=38');
    expect(chips[1]?.href).toBe('/catalogo?categoria=botas');
  });

  it('sin filtros no hay chips', () => {
    expect(activeChips(parse(''), FILTERS)).toEqual([]);
  });

  it('calcula las páginas, mínimo 1', () => {
    expect([
      totalPages(0, 12),
      totalPages(12, 12),
      totalPages(13, 12),
      totalPages(100, 48),
    ]).toEqual([1, 1, 2, 3]);
  });
});
