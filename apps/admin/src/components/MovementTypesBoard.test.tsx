import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { MovementTypeItem } from '../lib/movement-types';
import { fakeApi, type FakeRequest } from '../test/fake-api';
import MovementTypesBoard from './MovementTypesBoard';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const type = (code: string, name: string, kind: MovementTypeItem['kind'], extra = {}): MovementTypeItem => ({
  code,
  name,
  kind,
  active: true,
  system: false,
  createdAt: '2026-11-12T10:00:00Z',
  ...extra,
});

const TYPES = [
  type('RECEIVE', 'Ingreso', 'RECEIVE', { system: true }),
  type('PURCHASE', 'Ingreso por compra', 'RECEIVE'),
  type('SALE', 'Venta', 'WITHDRAW'),
  type('GIFT', 'Regalo o muestra', 'WITHDRAW', { active: false }),
];

const routes = (extra: Record<string, unknown> = {}) => ({ 'GET inventory/movement-types': TYPES, ...extra });
const board = (canWrite = true) => render(<MovementTypesBoard canWrite={canWrite} />);
const bodyOf = (calls: FakeRequest[], method: string) => calls.find((call) => call.method === method)?.body;

it('Tipos — el Gerente ve la lista con las clases y puede abrir cada tipo; pide también los desactivados', async () => {
  const calls = fakeApi(routes());
  board();

  expect(await screen.findByText('Ingreso por compra')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Ingresos \(2\)/ })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: /Retiros \(2\)/ })).toBeInTheDocument();
  expect(screen.getByText('De sistema')).toBeInTheDocument();
  expect(calls[0]?.query.get('includeInactive')).toBe('true');
});

it('Tipos — quien solo lee ve la lista sin acciones y solo pide los activos', async () => {
  const calls = fakeApi(routes());
  board(false);

  expect(await screen.findByText('Ingreso por compra')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Agregar' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Ingreso por compra/ })).not.toBeInTheDocument();
  expect(calls[0]?.query.get('includeInactive')).toBeNull();
});

it('Tipos — crear un tipo lo agrega a la clase elegida y anuncia el resultado', async () => {
  const calls = fakeApi(
    routes({
      'POST inventory/movement-types': { status: 201, body: type('CAMBIO_POR_TALLA', 'Cambio por talla', 'RECEIVE') },
    })
  );
  board();
  await screen.findByText('Ingreso por compra');

  fireEvent.change(screen.getByLabelText('Nuevo tipo de ingreso'), { target: { value: 'Cambio por talla' } });
  fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));

  expect(await screen.findByText('Tipo «Cambio por talla» creado')).toBeInTheDocument();
  expect(bodyOf(calls, 'POST')).toEqual({ name: 'Cambio por talla', kind: 'RECEIVE' });
  expect(screen.getByLabelText('Nuevo tipo de ingreso')).toHaveValue('');
});

it('Tipos — un nombre inválido muestra el error junto al campo y conserva lo escrito', async () => {
  fakeApi(
    routes({
      'POST inventory/movement-types': {
        status: 422,
        body: {
          message: 'Hay campos inválidos',
          issues: [{ field: 'name', message: 'El nombre del tipo debe tener entre 3 y 60 caracteres' }],
        },
      },
    })
  );
  board();
  await screen.findByText('Ingreso por compra');

  fireEvent.change(screen.getByLabelText('Nuevo tipo de ingreso'), { target: { value: 'abc' } });
  fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('entre 3 y 60');
  expect(screen.getByLabelText('Nuevo tipo de ingreso')).toHaveValue('abc');
});

it('Tipos — renombrar y desactivar un tipo envían solo lo que cambió', async () => {
  const calls = fakeApi(routes({ 'PATCH inventory/movement-types/SALE': type('SALE', 'Venta', 'WITHDRAW') }));
  board();
  await screen.findByText('Ingreso por compra');
  fireEvent.click(screen.getByRole('button', { name: /Retiros/ }));

  fireEvent.click(screen.getByRole('button', { name: /^Venta/ }));
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Venta al cliente' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
  await waitFor(() => expect(bodyOf(calls, 'PATCH')).toEqual({ name: 'Venta al cliente' }));

  fireEvent.click(screen.getByRole('switch', { name: 'Tipo activo' }));
  await waitFor(() => expect(calls.filter((call) => call.method === 'PATCH')[1]?.body).toEqual({ active: false }));
});

it('Tipos — un tipo de sistema no se puede desactivar desde el editor', async () => {
  fakeApi(routes());
  board();
  await screen.findByText('Ingreso por compra');

  fireEvent.click(screen.getByRole('button', { name: /De sistema/ }));

  expect(screen.getByRole('switch', { name: 'Tipo activo' })).toBeDisabled();
});

it('Tipos — si la lista falla muestra el error con Reintentar y al reintentar la carga', async () => {
  let fail = true;
  fakeApi({
    'GET inventory/movement-types': () => (fail ? { status: 500, body: { message: 'Sin conexión' } } : TYPES),
  });
  board();

  expect(await screen.findByRole('alert')).toHaveTextContent('Sin conexión');
  fail = false;
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

  expect(await screen.findByText('Ingreso por compra')).toBeInTheDocument();
});
