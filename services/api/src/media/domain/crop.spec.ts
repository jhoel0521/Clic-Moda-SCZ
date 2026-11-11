import { computeCrop, visibleFraction } from './crop.js';
import { FocalPoint, Framing, ImageDimensions } from './value-objects/image-values.vo.js';
import { MediaFormat } from './value-objects/media-format.vo.js';

const photo = (w: number, h: number) => ImageDimensions.of(w, h);
const focus = (x: number, y: number) => Framing.of(FocalPoint.of(x, y));

describe('computeCrop: cover', () => {
  it('foto 3000x2000 a link (1.91:1) centrada', () => {
    const plan = computeCrop(photo(3000, 2000), MediaFormat.of('link'), Framing.default());

    expect(plan).toEqual({ fit: 'cover', x: 0, y: 213, width: 3000, height: 1575 });
  });

  it('foto horizontal a story: ventana vertical que sigue el enfoque', () => {
    const plan = computeCrop(photo(3000, 2000), MediaFormat.of('story'), focus(0.25, 0.5));

    expect(plan).toEqual({ fit: 'cover', x: 188, y: 0, width: 1125, height: 2000 });
  });

  it('no se sale de la foto cuando el enfoque está en el borde', () => {
    const plan = computeCrop(photo(3000, 2000), MediaFormat.of('story'), focus(1, 1));

    expect(plan).toMatchObject({ x: 1875, y: 0, width: 1125, height: 2000 });
  });

  it('una foto ya cuadrada a square no recorta nada', () => {
    const plan = computeCrop(photo(1200, 1200), MediaFormat.of('square'), Framing.default());

    expect(plan).toEqual({ fit: 'cover', x: 0, y: 0, width: 1200, height: 1200 });
  });

  it('es determinista', () => {
    const args = [photo(2400, 1600), MediaFormat.of('portrait'), focus(0.3, 0.7)] as const;

    expect(computeCrop(...args)).toEqual(computeCrop(...args));
  });
});

describe('computeCrop: contain', () => {
  it('foto horizontal en story: completa, centrada y sobre el fondo', () => {
    const framing = Framing.of(FocalPoint.center(), 'contain', '#FFFFFF');

    const plan = computeCrop(photo(3000, 2000), MediaFormat.of('story'), framing);

    expect(plan).toEqual({
      fit: 'contain',
      background: '#ffffff',
      left: 0,
      top: 600,
      width: 1080,
      height: 720,
    });
  });
});

describe('computeCrop: logo', () => {
  it('entra completo y centrado sobre fondo transparente, aunque el encuadre sea cover', () => {
    const plan = computeCrop(photo(1000, 1000), MediaFormat.of('logo'), Framing.default());

    expect(plan).toEqual({
      fit: 'contain',
      background: 'transparent',
      left: 160,
      top: 0,
      width: 320,
      height: 320,
    });
  });
});

describe('visibleFraction', () => {
  it('avisa cuando el recorte muestra menos de la mitad', () => {
    const src = photo(3000, 2000);
    const plan = computeCrop(src, MediaFormat.of('story'), Framing.default());

    expect(visibleFraction(plan, src)).toBeLessThan(0.5);
  });

  it('en contain se ve toda la foto', () => {
    const src = photo(3000, 2000);
    const framing = Framing.of(FocalPoint.center(), 'contain');

    expect(visibleFraction(computeCrop(src, MediaFormat.of('story'), framing), src)).toBe(1);
  });
});
