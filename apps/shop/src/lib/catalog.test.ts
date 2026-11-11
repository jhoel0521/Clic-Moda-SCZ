import { describe, expect, it, vi } from 'vitest';
import {
  CATALOG_TTL_MS,
  CatalogUnavailableError,
  RETRY_AFTER_MS,
  createCatalogClient,
  listQuery,
} from './catalog';

const page = (total: number) => ({ items: [], total, page: 1, pageSize: 12 });

function world() {
  const clock = { t: 1_000_000 };
  const state = { total: 1, failing: false, status: 200 };
  const fetcher = vi.fn(() =>
    state.failing
      ? Promise.reject(new Error('API caída'))
      : Promise.resolve(Response.json(page(state.total), { status: state.status }))
  );
  const client = createCatalogClient({
    fetcher,
    now: () => clock.t,
    base: () => 'http://api.test',
  });
  return { clock, state, fetcher, client };
}

describe('listQuery', () => {
  it('arma los parámetros en orden fijo y omite lo que es por omisión', () => {
    expect(listQuery({})).toBe('');
    expect(listQuery({ page: 1, sort: 'new' })).toBe('');
    expect(
      listQuery({
        sort: 'price_asc',
        q: 'bota',
        page: 2,
        available: true,
        size: '38',
        category: 'botas',
      })
    ).toBe('?page=2&category=botas&size=38&q=bota&available=true&sort=price_asc');
  });
});

describe('caché del catálogo', () => {
  it('dentro de 15 s no vuelve a pedirlo a la API', async () => {
    const { client, fetcher, clock } = world();

    await client.list({});
    clock.t += CATALOG_TTL_MS - 1;
    await client.list({});

    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('cada URL tiene su propia entrada', async () => {
    const { client, fetcher } = world();

    await client.list({});
    await client.list({ category: 'botas' });

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('un cambio de stock se ve antes de 60 s (15 s de la API + 15 s de aquí)', async () => {
    const { client, state, clock } = world();
    await client.list({});

    state.total = 2;
    clock.t += 15_000 + CATALOG_TTL_MS;

    expect((await client.list({})).total).toBe(2);
    expect(15_000 + CATALOG_TTL_MS).toBeLessThan(60_000);
  });
});

describe('respaldo ante fallos', () => {
  it('si la API falla entrega el último valor y reintenta a los 5 s', async () => {
    const { client, state, fetcher, clock } = world();
    await client.list({});
    state.failing = true;
    clock.t += CATALOG_TTL_MS;

    expect((await client.list({})).total).toBe(1);
    await client.list({});
    expect(fetcher).toHaveBeenCalledTimes(2);
    clock.t += RETRY_AFTER_MS;
    await client.list({});
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it('si nunca hubo un valor lanza CatalogUnavailableError', async () => {
    const { client, state } = world();
    state.failing = true;

    await expect(client.list({})).rejects.toThrow(CatalogUnavailableError);
  });
});

describe('detalle de producto', () => {
  it('un 404 devuelve null y no se guarda en la caché', async () => {
    const { client, state, fetcher } = world();
    state.status = 404;

    expect(await client.product('no-existe')).toBeNull();
    expect(await client.product('no-existe')).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('codifica el slug en la URL', async () => {
    const { client, fetcher } = world();

    await client.product('a/b');

    expect(fetcher).toHaveBeenCalledWith(
      'http://api.test/public/catalog/products/a%2Fb',
      expect.anything()
    );
  });
});

describe('límite de la caché', () => {
  it('no crece sin tope con URLs distintas (recuerda solo las últimas 200)', async () => {
    const { client, fetcher } = world();

    for (let n = 0; n < 250; n++) await client.list({ q: `q${String(n)}` });
    await client.list({ q: 'q0' }); // ya no está: vuelve a pedirse

    expect(fetcher).toHaveBeenCalledTimes(251);
  });
});
