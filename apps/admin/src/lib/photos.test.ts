import { describe, expect, it } from 'vitest';
import { MAX_PHOTOS, append, isDirty, move, movedMessage, photoErrors, remove } from './photos';

describe('move', () => {
  it('sube y baja una posición', () => {
    expect(move(['a', 'b', 'c'], 2, -1)).toEqual(['a', 'c', 'b']);
    expect(move(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
  });

  it('en los extremos no cambia nada y no modifica la lista original', () => {
    const list = ['a', 'b'];

    expect(move(list, 0, -1)).toEqual(['a', 'b']);
    expect(move(list, 1, 1)).toEqual(['a', 'b']);
    expect(move(list, 5, 1)).toEqual(['a', 'b']);
    expect(list).toEqual(['a', 'b']);
  });
});

describe('append y remove', () => {
  it('agrega al final sin repetir', () => {
    expect(append(['a'], 'b')).toEqual(['a', 'b']);
    expect(append(['a'], 'a')).toEqual(['a']);
  });

  it(`no pasa de ${MAX_PHOTOS} fotos`, () => {
    const full = Array.from({ length: MAX_PHOTOS }, (_, i) => `f${i}`);

    expect(append(full, 'nueva')).toEqual(full);
  });

  it('quitar saca solo esa foto', () => {
    expect(remove(['a', 'b', 'c'], 'b')).toEqual(['a', 'c']);
  });
});

describe('isDirty', () => {
  it('detecta cambios de contenido y de orden', () => {
    expect(isDirty(['a', 'b'], ['a', 'b'])).toBe(false);
    expect(isDirty(['b', 'a'], ['a', 'b'])).toBe(true);
    expect(isDirty(['a'], ['a', 'b'])).toBe(true);
  });
});

describe('mensajes', () => {
  it('anuncia la posición y cuándo pasa a ser la principal', () => {
    expect(movedMessage(2, 3)).toBe('Foto movida a la posición 2 de 3');
    expect(movedMessage(1, 3)).toBe('Foto movida a la posición 1: ahora es la principal');
  });

  it('convierte el campo photos.N de la API en "Foto N+1"', () => {
    expect(
      photoErrors([
        { field: 'photos.1', message: 'La imagen no existe o no está publicada' },
        { field: 'otro', message: 'Algo más' },
      ])
    ).toEqual(['Foto 2: La imagen no existe o no está publicada', 'Algo más']);
  });
});
