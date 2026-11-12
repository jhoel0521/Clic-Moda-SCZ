import { describe, expect, it } from 'vitest';
import { isActive } from './nav';

describe('isActive', () => {
  it('el inicio solo está activo en "/"', () => {
    expect(isActive('/', '/')).toBe(true);
    expect(isActive('/catalogo', '/')).toBe(false);
  });

  it('el detalle de un producto cuenta como catálogo', () => {
    expect(isActive('/p/bota-andes', '/catalogo')).toBe(true);
    expect(isActive('/p/bota-andes', '/contacto')).toBe(false);
  });

  it('una página activa solo en su ruta', () => {
    expect(isActive('/contacto', '/contacto')).toBe(true);
    expect(isActive('/contacto-falso', '/contacto')).toBe(false);
  });
});
