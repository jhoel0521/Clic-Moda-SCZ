import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { fakeApi, type FakeRequest } from '../test/fake-api';
import InventoryBoard from './InventoryBoard';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const variant = (id: string, size: string, available: number, active = true) => ({
  id,
  sku: `BOT-${size}`,
  size,
  color: 'Negro',
  price: '580.00',
  active,
  available,
  reorderLevel: 2,
  location: 'Estante B6',
});

const bota = {
  id: 'p1',
  categoryId: 'c1',
  name: 'Bota Andes',
  description: null,
  active: true,
  available: 4,
  soldOutVariants: 1,
  variants: [variant('v38', '38', 0), variant('v39', '39', 4)],
};

const summary = { models: 1, units: 4, soldOutVariants: 1, lowStockVariants: 0 };

function routes(extra: Record<string, unknown> = {}) {
  return {
    'GET catalog/products': { items: [bota], total: 1, page: 1, pageSize: 10 },
    'GET inventory/summary': summary,
    'GET catalog/categories': [{ id: 'c1', name: 'Botas', slug: 'botas', productCount: 1 }],
    ...extra,
  };
}

const board = (canWrite = true, canDeactivate = true) =>
  render(<InventoryBoard canWrite={canWrite} canDeactivate={canDeactivate} />);

it('Inventario: lista y estados — muestra el resumen de arriba y cada modelo con sus pares y alerta', async () => {
  fakeApi(routes());
  board();

  expect(await screen.findByText('Bota Andes')).toBeInTheDocument();
  expect(await screen.findByLabelText('Resumen del inventario')).toHaveTextContent('Agotadas');
  expect(screen.getByText('1 agotadas')).toBeInTheDocument();
});

it('Inventario: lista y estados — sin modelos muestra el estado vacío', async () => {
  fakeApi(routes({ 'GET catalog/products': { items: [], total: 0, page: 1, pageSize: 10 } }));
  board();

  expect(await screen.findByText('No hay modelos con esos filtros')).toBeInTheDocument();
});

it('Inventario: lista y estados — si la API falla muestra el error', async () => {
  fakeApi(routes({ 'GET catalog/products': { status: 500, body: { message: 'Error del servidor' } } }));
  board();

  expect(await screen.findByRole('alert')).toHaveTextContent('Error del servidor');
});

it('Inventario: interruptor de activo — cambia al instante y se envía al servidor', async () => {
  const calls = fakeApi(routes({ 'PATCH catalog/products/p1/active': {} }));
  board();
  const toggle = await screen.findByRole('switch', { name: 'Bota Andes: activo' });

  fireEvent.click(toggle);

  expect(toggle).toHaveAttribute('aria-checked', 'false');
  await waitFor(() => expect(calls.find((c) => c.method === 'PATCH')?.body).toEqual({ active: false }));
});

it('Inventario: interruptor de activo — si el servidor falla vuelve atrás y avisa', async () => {
  fakeApi(routes({ 'PATCH catalog/products/p1/active': { status: 500, body: { message: 'No se pudo' } } }));
  board();
  const toggle = await screen.findByRole('switch', { name: 'Bota Andes: activo' });

  fireEvent.click(toggle);

  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo');
  expect(toggle).toHaveAttribute('aria-checked', 'true');
});

const openMatrix = async () => {
  fireEvent.click(await screen.findByRole('button', { name: /Bota Andes/ }));
  return screen.findByRole('table');
};

it('Inventario: matriz — muestra una celda por color y talla con su disponible', async () => {
  fakeApi(routes());
  board();
  await openMatrix();

  expect(screen.getByRole('button', { name: 'Talla 39 Negro: 4 disponibles' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Talla 38 Negro: 0 disponibles, agotada' })).toBeInTheDocument();
});

it('Inventario: matriz — al tocar una celda aparecen ingresar, retirar y ajustar', async () => {
  fakeApi(routes());
  board();
  await openMatrix();

  fireEvent.click(screen.getByRole('button', { name: 'Talla 39 Negro: 4 disponibles' }));

  for (const name of ['Ingresar', 'Retirar', 'Ajustar']) {
    expect(screen.getByRole('button', { name })).toBeInTheDocument();
  }
});

it('Inventario: matriz — quien solo lee no ve los botones de modificar', async () => {
  fakeApi(routes());
  board(false, false);
  await openMatrix();

  fireEvent.click(screen.getByRole('button', { name: 'Talla 39 Negro: 4 disponibles' }));

  expect(screen.queryByRole('button', { name: 'Ingresar' })).not.toBeInTheDocument();
  expect(screen.queryByRole('switch', { name: 'Variante activa' })).not.toBeInTheDocument();
});

const sendIngress = async (units: string) => {
  await openMatrix();
  fireEvent.click(screen.getByRole('button', { name: 'Talla 39 Negro: 4 disponibles' }));
  fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
  fireEvent.change(await screen.findByLabelText('Unidades que ingresan'), { target: { value: units } });
  fireEvent.click(screen.getByRole('button', { name: 'Registrar' }));
};

const command = (request: FakeRequest) => ({
  id: 'cmd1',
  type: 'RECEIVE',
  units: 3,
  status: 'PENDING',
  rejectReason: null,
  ...Object(request.body),
});

it('Inventario: movimientos por la cola — encola con su clave de idempotencia y muestra "Listo" al aplicarse', async () => {
  const calls = fakeApi(
    routes({
      'POST inventory/commands': { status: 202, body: command({} as FakeRequest) },
      'GET inventory/commands/cmd1': { id: 'cmd1', status: 'APPLIED', rejectReason: null, type: 'RECEIVE', units: 3 },
    })
  );
  board();
  await sendIngress('3');

  expect(await screen.findByText('Listo: el stock ya se actualizó.')).toBeInTheDocument();
  const sent = calls.find((c) => c.method === 'POST');
  expect(sent?.body).toMatchObject({ variantId: 'v39', type: 'RECEIVE', units: 3 });
  expect(sent?.headers['Idempotency-Key']).toMatch(/^adm-/);
});

it('Inventario: movimientos por la cola — un rechazo se explica con su motivo', async () => {
  fakeApi(
    routes({
      'POST inventory/commands': { status: 202, body: command({} as FakeRequest) },
      'GET inventory/commands/cmd1': {
        id: 'cmd1',
        status: 'REJECTED',
        rejectReason: 'INSUFFICIENT_STOCK',
        type: 'RECEIVE',
        units: 3,
      },
    })
  );
  board();
  await sendIngress('3');

  expect(await screen.findByText('No hay stock suficiente disponible')).toBeInTheDocument();
});

it('Inventario: movimientos por la cola — no permite registrar con 0 unidades', async () => {
  fakeApi(routes());
  board();
  await openMatrix();
  fireEvent.click(screen.getByRole('button', { name: 'Talla 39 Negro: 4 disponibles' }));
  fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
  fireEvent.change(await screen.findByLabelText('Unidades que ingresan'), { target: { value: '0' } });

  expect(screen.getByRole('button', { name: 'Registrar' })).toBeDisabled();
});

it('Inventario: precio único — guarda un solo precio para todo el modelo', async () => {
  const calls = fakeApi(routes({ 'PATCH catalog/products/p1/price': {} }));
  board();
  await openMatrix();

  fireEvent.change(screen.getByLabelText('Mismo precio para todas las variantes (Bs)'), {
    target: { value: '349.90' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

  await waitFor(() => expect(calls.find((c) => c.method === 'PATCH')?.body).toEqual({ price: '349.90' }));
});

it('Historial — muestra los movimientos de la variante elegida', async () => {
  const movement = {
    id: 'm1',
    type: 'RECEIVE',
    delta: 5,
    reason: 'Compra a proveedor',
    operator: 'u',
    occurredAt: '2026-11-10T12:00:00Z',
  };
  fakeApi(routes({ 'GET inventory/variants/v39/movements': { items: [movement], total: 1, page: 1, pageSize: 10 } }));
  board();
  await openMatrix();
  fireEvent.click(screen.getByRole('button', { name: 'Talla 39 Negro: 4 disponibles' }));

  fireEvent.click(screen.getByRole('button', { name: 'Ver historial' }));

  expect(await screen.findByText('+5')).toBeInTheDocument();
  expect(screen.getByText(/Compra a proveedor/)).toBeInTheDocument();
});

it('Estante — se ve junto a la categoría y se cambia para todo el modelo', async () => {
  const calls = fakeApi(routes({ 'PATCH inventory/stock/v38/settings': {}, 'PATCH inventory/stock/v39/settings': {} }));
  board();
  await screen.findByText('Botas · Estante B6');
  await openMatrix();

  fireEvent.change(screen.getByLabelText('Estante del modelo'), { target: { value: 'Estante D4' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar estante' }));

  await waitFor(() => expect(calls.filter((c) => c.method === 'PATCH')).toHaveLength(2));
  expect(calls.filter((c) => c.method === 'PATCH').map((c) => c.body)).toEqual([
    { location: 'Estante D4', reorderLevel: 2 },
    { location: 'Estante D4', reorderLevel: 2 },
  ]);
});
