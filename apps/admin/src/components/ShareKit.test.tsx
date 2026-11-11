import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MediaItem } from '../lib/media';
import ShareCards from './ShareCards';
import ShareKit from './ShareKit';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const item: MediaItem = {
  id: 'm1',
  alt: 'Bota Andes',
  focal: { x: 0.5, y: 0.5 },
  fit: 'cover',
  background: '#ffffff',
  width: 3000,
  height: 2000,
  revision: 3,
  published: true,
  createdAt: '2026-11-11T00:00:00Z',
  variants: [],
};

const supportSharing = () => {
  const share = vi.fn(async () => undefined);
  vi.stubGlobal('navigator', { share, canShare: () => true });
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(new Blob(['x'], { type: 'image/jpeg' })))
  );
  return share;
};

describe('Kit para compartir', () => {
  it('ofrece la descarga de cada formato limpio, con su revisión', () => {
    render(<ShareKit item={item} />);

    const link = screen.getByRole('link', { name: 'Descargar Historia 9:16' });
    expect(link).toHaveAttribute('href', '/api/public/media/m1/story-3.jpg');
    expect(link).toHaveAttribute('download', 'm1-story.jpg');
    expect(screen.getAllByRole('link')).toHaveLength(4);
  });

  it('sin Web Share (escritorio) no muestra los botones de compartir', () => {
    vi.stubGlobal('navigator', {});
    render(<ShareKit item={item} />);

    expect(screen.queryByRole('button', { name: /Compartir/ })).not.toBeInTheDocument();
  });

  it('con Web Share comparte el archivo con el menú del sistema', async () => {
    const share = supportSharing();
    render(<ShareKit item={item} />);

    fireEvent.click(screen.getByRole('button', { name: 'Compartir Historia 9:16' }));

    await vi.waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    const [data] = share.mock.calls[0] as unknown as [{ files: File[]; title: string }];
    expect([data.files[0]?.name, data.title]).toEqual(['m1-story.jpg', 'Bota Andes']);
  });
});

describe('Vista previa de enlaces', () => {
  it('muestra las tres tarjetas con el título, la descripción y el dominio', () => {
    render(<ShareCards item={item} host="tienda.test" />);

    for (const channel of ['WhatsApp', 'Facebook', 'X']) {
      expect(screen.getByRole('region', { name: `Vista previa en ${channel}` })).toBeInTheDocument();
    }
    expect(screen.getAllByText('Bota Andes').length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText(/tienda\.test/i).length).toBeGreaterThanOrEqual(3);
  });

  it('las tarjetas siguen lo que escribe el Gerente', () => {
    render(<ShareCards item={item} host="tienda.test" />);

    fireEvent.change(screen.getByLabelText('Título de ejemplo'), { target: { value: 'Oferta del Live' } });

    expect(screen.getAllByText('Oferta del Live').length).toBeGreaterThanOrEqual(3);
  });
});
