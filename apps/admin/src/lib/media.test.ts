import { describe, expect, it } from 'vitest';
import { computeCrop } from './crop';
import { focalFromPointer, framingOf, nudge, previewStyle, variantUrl, warnings, type MediaItem } from './media';

const item = (over: Partial<MediaItem> = {}): MediaItem => ({
  id: 'abc',
  alt: 'Bota',
  focal: { x: 0.5, y: 0.5 },
  fit: 'cover',
  background: '#ffffff',
  width: 3000,
  height: 2000,
  revision: 2,
  published: true,
  createdAt: '2026-11-11T00:00:00Z',
  variants: [],
  ...over,
});

describe('variantUrl', () => {
  it('apunta a la revisión vigente con la extensión del formato', () => {
    expect(variantUrl(item(), 'link')).toBe('/api/public/media/abc/link-2.jpg');
    expect(variantUrl(item(), 'card')).toBe('/api/public/media/abc/card-2.webp');
  });
});

describe('warnings', () => {
  it('no avisa con una foto grande y un recorte suave', () => {
    const photo = item();

    expect(warnings(photo, 'link', framingOf(photo))).toEqual([]);
  });

  it('avisa de baja resolución', () => {
    const small = item({ width: 900, height: 700 });

    expect(warnings(small, 'link', framingOf(small))[0]).toContain('pequeña');
  });

  it('avisa cuando el formato muestra menos de la mitad y sugiere el modo completa', () => {
    const photo = item();

    expect(warnings(photo, 'story', framingOf(photo))[0]).toContain('Foto completa');
  });

  it('avisa si la vista previa de enlace pesa más de 300 KB', () => {
    const heavy = item({
      variants: [{ format: 'link', revision: 2, width: 1200, height: 630, bytes: 400_000, url: '' }],
    });

    expect(warnings(heavy, 'link', framingOf(heavy)).join()).toContain('300 KB');
  });
});

describe('previewStyle', () => {
  it('cover: escala y desplaza la foto según el recorte', () => {
    const photo = item();
    const plan = computeCrop(photo, 'story', framingOf(photo));

    expect(previewStyle(plan, photo, 'story')).toMatchObject({ width: `${(3000 / 1125) * 100}%` });
  });

  it('contain: coloca la foto completa dentro del lienzo del formato', () => {
    const photo = item({ fit: 'contain' });
    const plan = computeCrop(photo, 'story', framingOf(photo));

    expect(previewStyle(plan, photo, 'story')).toEqual({
      position: 'absolute',
      left: '0%',
      top: `${(600 / 1920) * 100}%`,
      width: '100%',
      height: `${(720 / 1920) * 100}%`,
    });
  });
});

describe('nudge y focalFromPointer', () => {
  it('mueve de a 2 % (o 10 % con paso grande) sin salirse de 0 a 1', () => {
    expect(nudge({ x: 0.5, y: 0.5 }, 'right')).toEqual({ x: 0.52, y: 0.5 });
    expect(nudge({ x: 0.5, y: 0.5 }, 'up', true)).toEqual({ x: 0.5, y: 0.4 });
    expect(nudge({ x: 0.99, y: 0 }, 'right')).toEqual({ x: 1, y: 0 });
    expect(nudge({ x: 0.1, y: 0.9 }, 'center')).toEqual({ x: 0.5, y: 0.5 });
  });

  it('convierte la posición del puntero en un enfoque limitado a la foto', () => {
    const box = { left: 100, top: 50, width: 200, height: 100 };

    expect(focalFromPointer({ x: 200, y: 100 }, box)).toEqual({ x: 0.5, y: 0.5 });
    expect(focalFromPointer({ x: 900, y: 0 }, box)).toEqual({ x: 1, y: 0 });
  });
});
