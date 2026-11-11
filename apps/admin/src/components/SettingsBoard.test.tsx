import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MediaItem } from '../lib/media';
import type { SettingsData } from '../lib/settings';
import { fakeApi } from '../test/fake-api';
import SettingsBoard from './SettingsBoard';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const initial: SettingsData = {
  brandName: 'Clic Moda SC',
  tagline: 'Calzado de moda',
  color: { primary: '#c7305a', dark: '#9e2647', light: '#db6988', soft: '#fbeef2', onPrimary: '#ffffff' },
  logo: null,
  seo: {
    title: 'Clic Moda SC · Calzado de moda en Santa Cruz',
    description:
      'Zapatos de moda en Santa Cruz de la Sierra. Mira el catálogo, elige tu talla y cierra tu compra por WhatsApp.',
    shareImage: null,
  },
  contact: { whatsapp: '59171234567', address: 'Av. Banzer 123', pickupHours: 'Lun a sáb 9 a 18', mapUrl: null },
  social: { instagram: null, tiktok: null, facebook: null },
  updatedAt: '2026-11-12T00:00:00.000Z',
};

const logo: MediaItem = {
  id: 'm1',
  alt: 'Logo',
  focal: { x: 0.5, y: 0.5 },
  fit: 'contain',
  background: '#ffffff',
  width: 800,
  height: 600,
  revision: 3,
  published: true,
  createdAt: '2026-11-11T00:00:00Z',
  variants: [],
};

const open = (canWrite = true) => render(<SettingsBoard initial={initial} canWrite={canWrite} />);
const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe('Configuración: HTML válido', () => {
  it('no anida formularios (la subida de imágenes trae el suyo) y el guardado es un botón', async () => {
    fakeApi({ 'GET media': [] });
    const { container } = open();

    expect(container.querySelector('form form')).toBeNull();
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toHaveAttribute('type', 'button');
    await waitFor(() => expect(screen.queryByText('Cargando imágenes…')).not.toBeInTheDocument());
  });
});

describe('Configuración: formulario', () => {
  it('muestra los valores actuales y los contadores de caracteres', async () => {
    fakeApi({ 'GET media': [] });
    open();

    expect(screen.getByLabelText('Nombre de la tienda')).toHaveValue('Clic Moda SC');
    expect(screen.getByText('12 de 24 caracteres')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Cargando imágenes…')).not.toBeInTheDocument());
  });

  it('un nombre fuera del rango no se envía y se marca el campo', async () => {
    const calls = fakeApi({ 'GET media': [] });
    open();

    type('Nombre de la tienda', 'x');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('El nombre: entre 2 y 24 caracteres')).toBeInTheDocument();
    expect(calls.some((call) => call.method === 'PUT')).toBe(false);
  });
});

describe('Configuración: guardar', () => {
  it('guarda con PUT, avisa del plazo y refleja lo que devolvió la API', async () => {
    const saved = { ...initial, brandName: 'Verashoe' };
    const calls = fakeApi({ 'GET media': [], 'PUT store-settings': saved });
    open();

    type('Nombre de la tienda', 'Verashoe');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByRole('status')).toHaveTextContent('menos de un minuto');
    const put = calls.find((call) => call.method === 'PUT');
    expect(put?.body).toMatchObject({ brandName: 'Verashoe', mapUrl: null, logoMediaId: null });
  });
});

describe('Configuración: errores de la API', () => {
  it('marca cada campo que la API rechazó con 422', async () => {
    const issues = [{ field: 'instagram', message: 'El enlace de instagram debe ser de instagram.com' }];
    fakeApi({
      'GET media': [],
      'PUT store-settings': { status: 422, body: { message: 'Hay campos inválidos', issues } },
    });
    open();

    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('El enlace de instagram debe ser de instagram.com')).toBeInTheDocument();
  });

  it('sin permiso de escritura el botón de guardar está desactivado', async () => {
    fakeApi({ 'GET media': [] });
    open(false);

    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
    await waitFor(() => expect(screen.queryByText('Cargando imágenes…')).not.toBeInTheDocument());
  });
});

describe('Configuración: contraste y vista previa', () => {
  it('avisa si el color no cumple y ofrece el cercano que sí', async () => {
    fakeApi({ 'GET media': [] });
    open();

    type('Color principal', '#e63f6e');

    expect(screen.getByRole('alert')).toHaveTextContent('3.96:1');
    fireEvent.click(screen.getByRole('button', { name: 'Usar #e2245a' }));
    expect(await screen.findByText(/Cumple el contraste AA/)).toBeInTheDocument();
  });
});

describe('Configuración: vista previa', () => {
  it('la vista previa cambia de 360 px a 1280 px', async () => {
    fakeApi({ 'GET media': [logo] });
    open();

    expect(screen.getByTestId('preview-frame')).toHaveStyle({ width: '360px' });
    fireEvent.click(screen.getByLabelText('Escritorio 1280 px'));
    expect(screen.getByTestId('preview-frame')).toHaveStyle({ width: '1280px' });
    await waitFor(() => expect(screen.queryByText('Cargando imágenes…')).not.toBeInTheDocument());
  });

  it('el logo elegido aparece en la cabecera de la vista previa', async () => {
    fakeApi({ 'GET media': [logo] });
    open();

    await screen.findAllByLabelText('Logo', { selector: 'input[type=radio]' });
    // El primer grupo de imágenes es el del logo; el segundo es el de compartir.
    fireEvent.click(screen.getAllByLabelText('Logo', { selector: 'input[type=radio]' })[0] as HTMLElement);

    const img = screen.getByAltText('Clic Moda SC');
    expect(img).toHaveAttribute('src', '/api/public/media/m1/logo-3.webp');
  });
});
