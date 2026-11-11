import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fakeApi } from '../test/fake-api';
import CategoriesManager from './CategoriesManager';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const botas = { id: 'c1', name: 'Botas', slug: 'botas', productCount: 3 };
const vacias = { id: 'c2', name: 'Sandalias', slug: 'sandalias', productCount: 0 };

describe('Categorías: estados', () => {
  it('muestra "Cargando…" y luego cada categoría con su conteo', async () => {
    fakeApi({ 'GET catalog/categories': [botas, vacias] });
    render(<CategoriesManager canWrite />);

    expect(screen.getByText('Cargando…')).toBeInTheDocument();
    expect(await screen.findByText('Botas')).toBeInTheDocument();
    expect(screen.getByText('3 productos')).toBeInTheDocument();
    expect(screen.getByText('0 productos')).toBeInTheDocument();
  });

  it('sin categorías muestra el estado vacío', async () => {
    fakeApi({ 'GET catalog/categories': [] });
    render(<CategoriesManager canWrite />);

    expect(await screen.findByText('Todavía no hay categorías')).toBeInTheDocument();
  });

  it('si la API falla muestra el error', async () => {
    fakeApi({ 'GET catalog/categories': { status: 500, body: { message: 'Error del servidor' } } });
    render(<CategoriesManager canWrite />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Error del servidor');
  });
});

describe('Categorías: acciones', () => {
  it('crea una categoría y recarga la lista', async () => {
    const calls = fakeApi({ 'GET catalog/categories': [botas], 'POST catalog/categories': { status: 201, body: {} } });
    render(<CategoriesManager canWrite />);
    await screen.findByText('Botas');

    fireEvent.change(screen.getByLabelText('Nueva categoría'), { target: { value: 'Zapatillas' } });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));

    await waitFor(() => expect(calls.filter((c) => c.method === 'GET')).toHaveLength(2));
    expect(calls.find((c) => c.method === 'POST')?.body).toEqual({ name: 'Zapatillas' });
  });

  it('el error del servidor (nombre repetido) aparece sin perder lo escrito', async () => {
    fakeApi({
      'GET catalog/categories': [botas],
      'POST catalog/categories': { status: 409, body: { message: 'Ya existe una categoría con ese nombre' } },
    });
    render(<CategoriesManager canWrite />);
    await screen.findByText('Botas');

    fireEvent.change(screen.getByLabelText('Nueva categoría'), { target: { value: 'Botas' } });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe una categoría con ese nombre');
    expect(screen.getByLabelText('Nueva categoría')).toHaveValue('Botas');
  });
});

describe('Categorías: permisos y borrado', () => {
  it('no se puede borrar una categoría con productos', async () => {
    fakeApi({ 'GET catalog/categories': [botas, vacias] });
    render(<CategoriesManager canWrite />);
    await screen.findByText('Botas');

    const [conProductos, sinProductos] = [
      screen.getByRole('button', { name: 'No se puede borrar: tiene productos' }),
      screen.getByRole('button', { name: 'Borrar categoría' }),
    ];
    expect(conProductos).toBeDisabled();
    expect(sinProductos).toBeEnabled();
  });

  it('quien solo lee no ve formulario ni botones de modificar', async () => {
    fakeApi({ 'GET catalog/categories': [botas] });
    render(<CategoriesManager canWrite={false} />);
    await screen.findByText('Botas');

    expect(screen.queryByLabelText('Nueva categoría')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar categoría' })).not.toBeInTheDocument();
  });
});
