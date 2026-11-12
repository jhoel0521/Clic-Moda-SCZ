import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, expect, it, vi } from 'vitest';
import type { MovementTypeItem } from '../lib/movement-types';
import type { StockRow } from '../lib/stock';
import { fakeApi, type FakeRequest } from '../test/fake-api';
import MovementSheet from './MovementSheet';

// jsdom no implementa <dialog>.showModal: se simula para que el contenido sea accesible.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const row: StockRow = {
  variantId: 'v39',
  sku: 'BOT-39',
  productName: 'Bota Andes',
  size: '39',
  color: 'Negro',
  active: true,
  onHand: 4,
  reserved: 0,
  available: 4,
  location: null,
  reorderLevel: 2,
};

const type = (code: string, name: string, kind: MovementTypeItem['kind'], system = false): MovementTypeItem => ({
  code,
  name,
  kind,
  active: true,
  system,
  createdAt: '2026-11-12T10:00:00Z',
});

const TYPES = [
  type('RECEIVE', 'Ingreso', 'RECEIVE', true),
  type('WITHDRAW', 'Retiro', 'WITHDRAW', true),
  type('SALE', 'Venta', 'WITHDRAW'),
  type('SHRINKAGE', 'Merma o daño', 'WITHDRAW'),
];

const accepted = (request: FakeRequest) => ({
  status: 202,
  body: { id: 'cmd1', status: 'PENDING', rejectReason: null, units: 1, ...Object(request.body) },
});

function routes(types: unknown = TYPES) {
  return {
    'GET inventory/movement-types': types,
    'POST inventory/commands': accepted,
    'GET inventory/commands/cmd1': { id: 'cmd1', status: 'APPLIED', rejectReason: null },
  };
}

const sheet = (kind: 'RECEIVE' | 'WITHDRAW' | 'ADJUST' = 'WITHDRAW') =>
  render(<MovementSheet row={row} kind={kind} onClose={() => undefined} onDone={() => undefined} />);

const fillAndSend = (units = '1') => {
  fireEvent.change(screen.getByLabelText('Unidades que salen'), { target: { value: units } });
  fireEvent.click(screen.getByRole('button', { name: 'Registrar' }));
};

const sentBody = (calls: FakeRequest[]) => calls.find((call) => call.method === 'POST')?.body;

it('Movimiento — el tipo de sistema de la clase viene preseleccionado y se envía su código', async () => {
  const calls = fakeApi(routes());
  sheet();
  const select = await screen.findByLabelText('Tipo');
  await waitFor(() => expect(screen.getAllByRole('option').length).toBe(3));

  expect(select).toHaveValue('WITHDRAW');
  fillAndSend();

  await waitFor(() => expect(sentBody(calls)).toMatchObject({ type: 'WITHDRAW', typeCode: 'WITHDRAW' }));
});

it('Movimiento — elegir otro tipo de la misma clase envía su código y no ofrece los de otra clase', async () => {
  const calls = fakeApi(routes());
  sheet();
  await waitFor(() => expect(screen.getAllByRole('option').length).toBe(3));

  fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'SHRINKAGE' } });
  fillAndSend('2');

  expect(screen.queryByRole('option', { name: 'Ingreso' })).not.toBeInTheDocument();
  await waitFor(() => expect(sentBody(calls)).toMatchObject({ typeCode: 'SHRINKAGE', units: 2 }));
});

const many = Array.from({ length: 10 }, (_, index) => type(`W${index + 1}`, `Retiro ${index + 1}`, 'WITHDRAW'));

it('Movimiento — con más de 7 tipos muestra 7 opciones con «Ver todos» y al elegirlo muestra todos', async () => {
  fakeApi(routes(many));
  sheet();

  await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(7));
  expect(screen.getByRole('option', { name: 'Ver todos (10)' })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: '__all__' } });

  await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(10));
});

it('Movimiento — si los tipos no cargan, igual se puede registrar con el tipo de sistema', async () => {
  const calls = fakeApi({ ...routes(), 'GET inventory/movement-types': { status: 500, body: { message: 'x' } } });
  sheet('RECEIVE');
  expect(await screen.findByLabelText('Tipo')).toHaveValue('RECEIVE');

  fireEvent.change(screen.getByLabelText('Unidades que ingresan'), { target: { value: '5' } });
  fireEvent.click(screen.getByRole('button', { name: 'Registrar' }));

  await waitFor(() => expect(sentBody(calls)).toMatchObject({ type: 'RECEIVE', typeCode: 'RECEIVE' }));
});

it('Movimiento — un doble clic en Registrar envía un solo comando', async () => {
  const calls = fakeApi(routes());
  sheet();
  await waitFor(() => expect(screen.getAllByRole('option').length).toBe(3));

  fireEvent.change(screen.getByLabelText('Unidades que salen'), { target: { value: '1' } });
  const button = screen.getByRole('button', { name: 'Registrar' });
  fireEvent.click(button);
  fireEvent.click(button);

  await waitFor(() => expect(screen.getByText('Listo: el stock ya se actualizó.')).toBeInTheDocument());
  expect(calls.filter((call) => call.method === 'POST')).toHaveLength(1);
});
