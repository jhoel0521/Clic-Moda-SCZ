import {
  checkContrast,
  contrastRatio,
  derivePalette,
  nearestPassing,
  softIsReadable,
} from './palette.js';

// Casos FIJOS: son los mismos que los de apps/admin/src/lib/palette.test.ts.
describe('derivePalette (casos fijos)', () => {
  it('deriva las variantes del rosa por defecto', () => {
    expect(derivePalette('#C7305A')).toEqual({
      primary: '#c7305a',
      dark: '#9e2647',
      light: '#db6988',
      soft: '#fbeef2',
      onPrimary: '#ffffff',
    });
  });

  it('la variante suave deja leer el texto del estándar', () => {
    expect(softIsReadable(derivePalette('#c7305a'))).toBe(true);
  });
});

describe('contraste AA (casos fijos)', () => {
  it('el rosa por defecto cumple con 5.25:1', () => {
    expect(contrastRatio('#ffffff', '#c7305a').toFixed(2)).toBe('5.25');
    expect(checkContrast('#c7305a')).toEqual({ ok: true, reasons: [], suggestion: null });
  });

  it('#e63f6e falla (3.96:1) y sugiere un color cercano que sí cumple', () => {
    const report = checkContrast('#e63f6e');

    expect(report.ok).toBe(false);
    expect(report.reasons[0]).toContain('3.96:1');
    expect(report.suggestion).toBe('#e2245a');
    expect(checkContrast(report.suggestion as string).ok).toBe(true);
  });

  it('el amarillo falla por las dos razones y la sugerencia oscurece el mismo matiz', () => {
    const report = checkContrast('#ffff00');

    expect(report.reasons).toHaveLength(2);
    expect(report.suggestion).toBe('#7a7a00');
  });

  it('hasta el blanco tiene una sugerencia que oscurece', () => {
    expect(nearestPassing('#ffffff')).not.toBeNull();
  });
});
