import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { fakeApi } from '../test/fake-api';
import ProductForm from './ProductForm';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const categories = [{ id: 'c1', name: 'Botas', slug: 'botas', productCount: 0 }];

const fillBasics = async () => {
  await screen.findByRole('option', { name: 'Botas' });
  fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'c1' } });
  fireEvent.change(screen.getByLabelText('Nombre del producto'), { target: { value: 'Bota Andes' } });
};

const fillVariant = (size: string, price: string, sku = '') => {
  fireEvent.change(screen.getByLabelText('Talla'), { target: { value: size } });
  fireEvent.change(screen.getByLabelText('Precio (Bs)'), { target: { value: price } });
  if (sku) fireEvent.change(screen.getByLabelText('SKU (opcional)'), { target: { value: sku } });
};

it('Formulario de producto — agrega y quita variantes (siempre queda al menos una)', async () => {
  fakeApi({ 'GET catalog/categories': categories });
  render(<ProductForm />);
  await screen.findByRole('option', { name: 'Botas' });

  expect(screen.getAllByLabelText('Talla')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'Agregar otra variante' }));
  expect(screen.getAllByLabelText('Talla')).toHaveLength(2);
  fireEvent.click(screen.getAllByRole('button', { name: /Quitar/ })[0]!);
  expect(screen.getAllByLabelText('Talla')).toHaveLength(1);
});

it('Formulario de producto — no envía si faltan datos y marca el campo', async () => {
  const calls = fakeApi({ 'GET catalog/categories': categories });
  render(<ProductForm />);
  await screen.findByRole('option', { name: 'Botas' });

  fireEvent.click(screen.getByRole('button', { name: /Guardar|Registrar/ }));

  expect(await screen.findAllByRole('alert')).not.toHaveLength(0);
  expect(calls.some((c) => c.method === 'POST')).toBe(false);
});

it('Formulario de producto — un SKU repetido se muestra junto al campo SKU', async () => {
  const message = 'El SKU BOT-38 ya existe';
  fakeApi({
    'GET catalog/categories': categories,
    'POST catalog/products': { status: 409, body: { message } },
  });
  render(<ProductForm />);
  await fillBasics();
  fillVariant('38', '580', 'bot-38');

  fireEvent.click(screen.getByRole('button', { name: /Guardar|Registrar/ }));

  const field = screen.getByLabelText('SKU (opcional)');
  await waitFor(() => expect(field).toBeInvalid());
  expect(screen.getByText(message)).toBeInTheDocument();
});
