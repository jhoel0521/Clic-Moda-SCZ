import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MediaItem } from '../lib/media';
import { fakeApi } from '../test/fake-api';
import FramingEditor from './FramingEditor';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const photo: MediaItem = {
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

const show = (item: MediaItem = photo, canWrite = true, onSaved = vi.fn()) => {
  render(<FramingEditor item={item} canWrite={canWrite} onSaved={onSaved} />);
  return onSaved;
};
const marker = () => screen.getByRole('button', { name: /Punto de enfoque/ });

describe('Encuadre: formatos y zonas seguras', () => {
  it('ofrece los cuatro formatos y empieza en la vista previa de enlace', () => {
    show();

    const names = screen.getAllByRole('radio').map((radio) => radio.parentElement?.textContent);
    expect(names).toHaveLength(4);
    expect(screen.getByText('1200 × 630 px')).toBeInTheDocument();
  });

  it('al elegir historia muestra las zonas seguras con su porcentaje y deja configurarlas', () => {
    show();

    fireEvent.click(screen.getByLabelText(/Historia 9:16/));

    expect(screen.getByText('1080 × 1920 px')).toBeInTheDocument();
    expect(screen.getByText('Arriba 14 %')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Arriba %'), { target: { value: '20' } });
    expect(screen.getByText('Arriba 20 %')).toBeInTheDocument();
  });

  it('las zonas seguras no aparecen en los otros formatos', () => {
    show();

    expect(screen.queryByText('Arriba 14 %')).not.toBeInTheDocument();
  });
});

describe('Encuadre: avisos', () => {
  it('avisa del recorte excesivo en historia y sugiere el modo completa', () => {
    show();
    fireEvent.click(screen.getByLabelText(/Historia 9:16/));

    expect(screen.getByRole('status')).toHaveTextContent('Foto completa');
  });

  it('avisa de baja resolución sin impedir guardar', () => {
    show({ ...photo, width: 900, height: 700 });

    expect(screen.getByRole('status')).toHaveTextContent('pequeña');
    expect(screen.queryByRole('button', { name: 'Guardar encuadre' })).toBeDisabled();
  });
});

describe('Encuadre: enfoque sin arrastrar', () => {
  it('las flechas del teclado mueven el marcador y avisan la posición', () => {
    show();

    fireEvent.keyDown(marker(), { key: 'ArrowRight' });

    expect(marker()).toHaveAccessibleName(/horizontal 52 %, vertical 50 %/);
  });

  it('Mayús mueve en pasos de 10 % y Inicio vuelve al centro', () => {
    show();

    fireEvent.keyDown(marker(), { key: 'ArrowDown', shiftKey: true });
    expect(marker()).toHaveAccessibleName(/vertical 60 %/);
    fireEvent.keyDown(marker(), { key: 'Home' });
    expect(marker()).toHaveAccessibleName(/vertical 50 %/);
  });

  it('los botones de dirección también mueven el enfoque', () => {
    show();

    fireEvent.click(screen.getByRole('button', { name: 'Mover el enfoque hacia arriba' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mover el enfoque a la izquierda' }));

    expect(marker()).toHaveAccessibleName(/horizontal 48 %, vertical 48 %/);
  });
});

describe('Encuadre: guardar', () => {
  it('guarda el nuevo enfoque y entrega la imagen con la revisión nueva', async () => {
    const calls = fakeApi({ 'PATCH media/m1/framing': { ...photo, revision: 2 } });
    const onSaved = show();

    fireEvent.keyDown(marker(), { key: 'ArrowRight' });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar encuadre' }));

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalledWith({ ...photo, revision: 2 }));
    expect(calls[0]?.body).toEqual({ focalX: 0.52, focalY: 0.5, fit: 'cover', background: '#ffffff' });
  });

  it('muestra el error de la API', async () => {
    fakeApi({ 'PATCH media/m1/framing': { status: 400, body: { message: 'Encuadre inválido' } } });
    show();

    fireEvent.keyDown(marker(), { key: 'ArrowUp' });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar encuadre' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Encuadre inválido');
  });
});

describe('Encuadre: foto completa y permisos', () => {
  it('en modo completa pide el color de fondo y oculta el selector de enfoque', () => {
    show();

    fireEvent.change(screen.getByLabelText('Encuadre'), { target: { value: 'contain' } });

    expect(screen.getByLabelText('Color de fondo')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Punto de enfoque/ })).not.toBeInTheDocument();
  });

  it('sin permiso de escritura no hay botón de guardar y los controles están desactivados', () => {
    show(photo, false);

    expect(screen.queryByRole('button', { name: 'Guardar encuadre' })).not.toBeInTheDocument();
    expect(marker()).toBeDisabled();
    expect(screen.getByLabelText('Encuadre')).toBeDisabled();
  });
});
