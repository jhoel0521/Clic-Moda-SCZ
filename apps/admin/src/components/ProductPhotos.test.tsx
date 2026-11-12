import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MediaItem } from '../lib/media';
import { fakeApi } from '../test/fake-api';
import ProductPhotos from './ProductPhotos';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const item = (id: string, alt: string): MediaItem => ({
  id,
  alt,
  focal: { x: 0.5, y: 0.5 },
  fit: 'cover',
  background: '#ffffff',
  width: 1600,
  height: 1200,
  revision: 1,
  published: true,
  createdAt: '2026-11-11T00:00:00Z',
  variants: [],
});

const MEDIA = [item('m1', 'Frente'), item('m2', 'Lado'), item('m3', 'Atrás'), item('m4', 'Suela')];

function open(photos: string[], extra: Record<string, unknown> = {}) {
  const calls = fakeApi({
    'GET catalog/products/p1': { id: 'p1', photos },
    'GET media': MEDIA,
    ...extra,
  });
  const view = render(<ProductPhotos productId="p1" />);
  return { calls, ...view };
}

const ready = () => screen.findByRole('list', { name: 'Fotos del producto' });
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }));

describe('Fotos del producto: lista', () => {
  it('muestra las fotos en orden con la etiqueta "Principal" en la primera', async () => {
    open(['m2', 'm1']);

    const list = await ready();

    expect(list.querySelectorAll('li')).toHaveLength(2);
    expect(list.textContent).toContain('Principal');
    expect(list.querySelectorAll('li')[0]?.textContent).toContain('Lado');
  });

  it('sin fotos lo dice y los botones de mover no existen', async () => {
    open([]);

    expect(await screen.findByText('Este producto todavía no tiene fotos.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Subir la foto/ })).toBeNull();
  });

  it('el HTML es válido: la raíz no es un formulario', async () => {
    const { container } = open(['m1']);
    await ready();

    expect(container.firstElementChild?.tagName).not.toBe('FORM');
    expect(container.querySelector('form form')).toBeNull();
  });
});

describe('Fotos del producto: orden y anuncios', () => {
  it('mover una foto cambia el orden y se anuncia la posición', async () => {
    open(['m1', 'm2', 'm3']);
    await ready();

    click('Subir la foto Atrás');

    expect(screen.getByRole('status')).toHaveTextContent('Foto movida a la posición 2 de 3');
    const names = screen.getAllByRole('listitem').map((li) => li.textContent);
    expect(names[1]).toContain('Atrás');
  });

  it('la primera no se puede subir y la última no se puede bajar', async () => {
    open(['m1', 'm2']);
    await ready();

    expect(screen.getByRole('button', { name: 'Subir la foto Frente' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Bajar la foto Lado' })).toBeDisabled();
  });

  it('quitar una foto la saca del producto y aclara que no borra la imagen', async () => {
    open(['m1', 'm2']);
    await ready();

    click('Quitar la foto Frente del producto');

    expect(screen.getByRole('status')).toHaveTextContent('Foto quitada: Frente');
    expect(screen.getByText(/no borra la imagen/)).toBeInTheDocument();
  });
});

describe('Fotos del producto: agregar y máximo', () => {
  it('agrega al final desde las imágenes disponibles', async () => {
    open(['m1']);
    await ready();

    click('Agregar la foto Suela');

    expect(screen.getByRole('status')).toHaveTextContent('Foto agregada: Suela');
    expect(screen.queryByRole('button', { name: 'Agregar la foto Suela' })).toBeNull();
  });

  it('con 8 fotos no deja agregar más', async () => {
    const eight = Array.from({ length: 8 }, (_, i) => `x${i}`);
    open(eight, { 'GET media': [...MEDIA, ...eight.map((id) => item(id, id))] });
    await ready();

    expect(screen.getByRole('button', { name: 'Agregar la foto Frente' })).toBeDisabled();
  });
});

describe('Fotos del producto: guardar', () => {
  it('guardar está desactivado hasta que haya cambios y envía el orden con PUT', async () => {
    const { calls } = open(['m1', 'm2'], { 'PUT catalog/products/p1/photos': { photos: ['m2', 'm1'] } });
    await ready();
    expect(screen.getByRole('button', { name: 'Guardar fotos' })).toBeDisabled();

    click('Bajar la foto Frente');
    click('Guardar fotos');

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Fotos guardadas'));
    expect(calls.find((call) => call.method === 'PUT')?.body).toEqual({ mediaIds: ['m2', 'm1'] });
    expect(screen.getByRole('button', { name: 'Guardar fotos' })).toBeDisabled();
  });

  it('un error de la API por foto se muestra como "Foto N: …"', async () => {
    const issues = [{ field: 'photos.1', message: 'La imagen no existe o no está publicada' }];
    open(['m1', 'm2'], {
      'PUT catalog/products/p1/photos': { status: 422, body: { message: 'Hay campos inválidos', issues } },
    });
    await ready();

    click('Quitar la foto Frente del producto');
    click('Guardar fotos');

    expect(await screen.findByText('Foto 2: La imagen no existe o no está publicada')).toBeInTheDocument();
  });
});
