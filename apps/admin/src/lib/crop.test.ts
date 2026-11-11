import { describe, expect, it } from 'vitest';
import { computeCrop, visibleFraction, type Framing } from './crop';

const photo = { width: 3000, height: 2000 };
const framing = (focalX = 0.5, focalY = 0.5, fit: Framing['fit'] = 'cover'): Framing => ({
  focalX,
  focalY,
  fit,
  background: '#ffffff',
});

// Casos FIJOS: son los mismos que los de services/api/src/media/domain/crop.spec.ts.
describe('computeCrop: cover (mismos casos que la API)', () => {
  it('foto 3000x2000 a link (1.91:1) centrada', () => {
    expect(computeCrop(photo, 'link', framing())).toEqual({ fit: 'cover', x: 0, y: 213, width: 3000, height: 1575 });
  });

  it('foto horizontal a story: ventana vertical que sigue el enfoque', () => {
    expect(computeCrop(photo, 'story', framing(0.25))).toEqual({
      fit: 'cover',
      x: 188,
      y: 0,
      width: 1125,
      height: 2000,
    });
  });

  it('no se sale de la foto cuando el enfoque está en el borde', () => {
    expect(computeCrop(photo, 'story', framing(1, 1))).toMatchObject({ x: 1875, y: 0, width: 1125, height: 2000 });
  });

  it('una foto ya cuadrada a square no recorta nada', () => {
    const square = { width: 1200, height: 1200 };

    expect(computeCrop(square, 'square', framing())).toEqual({ fit: 'cover', x: 0, y: 0, width: 1200, height: 1200 });
  });
});

describe('computeCrop: contain y fracción visible', () => {
  it('foto horizontal en story: completa, centrada y sobre el fondo', () => {
    expect(computeCrop(photo, 'story', framing(0.5, 0.5, 'contain'))).toEqual({
      fit: 'contain',
      background: '#ffffff',
      left: 0,
      top: 600,
      width: 1080,
      height: 720,
    });
  });

  it('avisa un recorte menor a la mitad y en contain se ve todo', () => {
    expect(visibleFraction(computeCrop(photo, 'story', framing()), photo)).toBeLessThan(0.5);
    expect(visibleFraction(computeCrop(photo, 'story', framing(0.5, 0.5, 'contain')), photo)).toBe(1);
  });
});
