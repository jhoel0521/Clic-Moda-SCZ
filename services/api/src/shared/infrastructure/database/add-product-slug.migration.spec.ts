import type { QueryRunner } from 'typeorm';
import { allocateSlug } from '../../../catalog/domain/slug-allocator.js';
import { Slug } from '../../../catalog/domain/value-objects/names.vo.js';
import { AddProductSlug1794700000001 } from './migrations/1794700000001-AddProductSlug.js';

// QueryRunner mínimo: devuelve los productos de la consulta y recuerda cada UPDATE de slug.
function fakeRunner(names: string[]) {
  const updates = new Map<string, string>();
  const rows = names.map((name, index) => ({ id: `id-${String(index)}`, name }));
  const runner = {
    query: (sql: string, params?: string[]): Promise<unknown> => {
      if (sql.startsWith('SELECT')) return Promise.resolve(rows);
      if (sql.startsWith('UPDATE')) updates.set(params?.[1] as string, params?.[0] as string);
      return Promise.resolve([]);
    },
  } as unknown as QueryRunner;
  return { runner, slugs: () => rows.map((row) => updates.get(row.id)) };
}

const migrate = async (names: string[]) => {
  const world = fakeRunner(names);
  await new AddProductSlug1794700000001().up(world.runner);
  return world.slugs();
};

describe('migración AddProductSlug: relleno de slugs', () => {
  it('asigna slugs únicos en orden, con sufijo para nombres repetidos', async () => {
    expect(await migrate(['Bota Andes', 'Bota Andes', 'bota  ANDES', 'Zapatilla'])).toEqual([
      'bota-andes',
      'bota-andes-2',
      'bota-andes-3',
      'zapatilla',
    ]);
  });

  it('quita acentos y no falla con nombres sin letras', async () => {
    expect(await migrate(['Sandalia Cañete', '★★', '★★'])).toEqual([
      'sandalia-canete',
      'producto',
      'producto-2',
    ]);
  });

  it('un nombre largo repetido recorta antes del sufijo y no pasa de 80 caracteres', async () => {
    const long = 'palabra '.repeat(30);

    const [first, second] = (await migrate([long, long])) as string[];

    expect([first?.length, second?.length].every((n) => (n as number) <= 80)).toBe(true);
    expect(second?.endsWith('-2')).toBe(true);
    expect(first).not.toBe(second);
  });
});

describe('migración AddProductSlug: coincide con el dominio', () => {
  it('da los mismos slugs que Slug.fromTextOrDefault + allocateSlug para los mismos nombres', async () => {
    const names = [
      'Bota Andes',
      'Bota Andes',
      'Sandalia Cañete',
      '★★',
      'palabra '.repeat(30),
      'palabra '.repeat(30),
      'Ñandú ÁÉÍ',
    ];
    const taken = new Set<string>();
    const expected: string[] = [];
    for (const name of names) {
      const slug = await allocateSlug(Slug.fromTextOrDefault(name), (c) =>
        Promise.resolve(taken.has(c.value))
      );
      taken.add(slug.value);
      expected.push(slug.value);
    }

    expect(await migrate(names)).toEqual(expected);
  });
});
