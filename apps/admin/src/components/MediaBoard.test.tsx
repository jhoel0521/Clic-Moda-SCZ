import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MediaItem } from '../lib/media';
import { fakeApi } from '../test/fake-api';
import MediaBoard, { uploadProblem } from './MediaBoard';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

export const botas: MediaItem = {
  id: 'm1',
  alt: 'Bota Andes',
  focal: { x: 0.5, y: 0.5 },
  fit: 'cover',
  background: '#ffffff',
  width: 3000,
  height: 2000,
  revision: 1,
  published: true,
  createdAt: '2026-11-11T00:00:00Z',
  variants: [],
};

const jpeg = (name = 'foto.jpg', type = 'image/jpeg') => new File(['x'], name, { type });

describe('uploadProblem', () => {
  it('pide la foto, valida tipo, peso y texto alternativo', () => {
    expect(uploadProblem(null, 'a')).toBe('Elige una foto');
    expect(uploadProblem(jpeg('a.gif', 'image/gif'), 'a')).toBe('La foto debe ser JPG, PNG o WebP');
    expect(uploadProblem(jpeg(), '  ')).toBe('Escribe el texto alternativo de la foto');
    expect(uploadProblem(jpeg(), 'Bota')).toBeNull();
  });

  it('rechaza más de 12 MB', () => {
    const big = jpeg();
    Object.defineProperty(big, 'size', { value: 13 * 1024 * 1024 });

    expect(uploadProblem(big, 'Bota')).toBe('La foto pesa más de 12 MB');
  });
});

describe('Imágenes: estados', () => {
  it('muestra "Cargando…" y luego cada imagen', async () => {
    fakeApi({ 'GET media': [botas] });
    render(<MediaBoard canWrite host="tienda.test" />);

    expect(screen.getByText('Cargando…')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Abrir Bota Andes' })).toBeInTheDocument();
  });

  it('sin imágenes muestra el estado vacío', async () => {
    fakeApi({ 'GET media': [] });
    render(<MediaBoard canWrite host="tienda.test" />);

    expect(await screen.findByText('Todavía no hay imágenes')).toBeInTheDocument();
  });

  it('si la API falla muestra el error', async () => {
    fakeApi({ 'GET media': { status: 500, body: { message: 'Error del servidor' } } });
    render(<MediaBoard canWrite host="tienda.test" />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Error del servidor');
  });
});

const fill = (alt: string, file: File | null) => {
  const input = screen.getByLabelText('Foto');
  if (file) fireEvent.change(input, { target: { files: [file] } });
  fireEvent.change(screen.getByLabelText('Texto alternativo'), { target: { value: alt } });
  fireEvent.click(screen.getByRole('button', { name: 'Subir imagen' }));
};

describe('Imágenes: subir', () => {
  it('sube la foto, la agrega a la lista y abre su editor', async () => {
    const calls = fakeApi({ 'GET media': [], 'POST media': { status: 201, body: botas } });
    render(<MediaBoard canWrite host="tienda.test" />);
    await screen.findByText('Todavía no hay imágenes');

    fill('Bota Andes', jpeg());

    expect(await screen.findByText('Revisión 1')).toBeInTheDocument();
    expect(calls.find((c) => c.method === 'POST')?.body).toMatchObject({ alt: 'Bota Andes', fit: 'cover' });
  });
});

describe('Imágenes: subir, validaciones', () => {
  it('no llama a la API si falta la foto', async () => {
    const calls = fakeApi({ 'GET media': [] });
    render(<MediaBoard canWrite host="tienda.test" />);
    await screen.findByText('Todavía no hay imágenes');

    fill('Bota', null);

    expect(await screen.findByRole('alert')).toHaveTextContent('Elige una foto');
    expect(calls.filter((c) => c.method === 'POST')).toHaveLength(0);
  });

  it('muestra el rechazo de la API (por ejemplo, una foto muy pequeña)', async () => {
    const reply = { status: 400, body: { message: 'El lado corto de la imagen debe medir al menos 600 px' } };
    fakeApi({ 'GET media': [], 'POST media': reply });
    render(<MediaBoard canWrite host="tienda.test" />);
    await screen.findByText('Todavía no hay imágenes');

    fill('Bota', jpeg());

    expect(await screen.findByRole('alert')).toHaveTextContent('600 px');
  });
});

describe('Imágenes: borrar', () => {
  it('con confirmación llama a la API y la imagen sale de la lista', async () => {
    const calls = fakeApi({ 'GET media': [botas], 'DELETE media/m1': { status: 204 } });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<MediaBoard canWrite host="tienda.test" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Abrir Bota Andes' }));
    fireEvent.click(screen.getByRole('button', { name: 'Borrar imagen' }));

    expect(await screen.findByText('Todavía no hay imágenes')).toBeInTheDocument();
    expect(calls.some((c) => c.method === 'DELETE')).toBe(true);
  });

  it('sin confirmar no borra nada', async () => {
    const calls = fakeApi({ 'GET media': [botas] });
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<MediaBoard canWrite host="tienda.test" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Abrir Bota Andes' }));
    fireEvent.click(screen.getByRole('button', { name: 'Borrar imagen' }));

    await waitFor(() => expect(calls.filter((c) => c.method === 'DELETE')).toHaveLength(0));
    expect(screen.getByRole('button', { name: 'Abrir Bota Andes' })).toBeInTheDocument();
  });
});

describe('Imágenes: subir, doble envío', () => {
  it('desactiva el botón mientras la foto sube para no enviarla dos veces', async () => {
    let finish: (value: Response) => void = () => undefined;
    const pending = new Promise<Response>((resolve) => (finish = resolve));
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: string, init?: RequestInit) =>
        init?.method === 'POST' ? pending : new Response('[]', { status: 200 })
      )
    );
    render(<MediaBoard canWrite host="tienda.test" />);
    await screen.findByText('Todavía no hay imágenes');

    fill('Bota', jpeg());

    expect(await screen.findByRole('button', { name: 'Subiendo…' })).toBeDisabled();
    finish(new Response(JSON.stringify(botas), { status: 201 }));
    expect(await screen.findByText('Revisión 1')).toBeInTheDocument();
  });
});
