import { InvalidSettingError } from '../errors/settings.errors.js';
import { Address, BrandName, PickupHours, SeoDescription, SeoTitle, Tagline } from './texts.vo.js';

const long = (n: number): string => 'a'.repeat(n);

describe('textos de la marca: límites', () => {
  it.each([
    ['BrandName', (raw: string) => BrandName.of(raw), 2, 24],
    ['Tagline', (raw: string) => Tagline.of(raw), 0, 60],
    ['SeoTitle', (raw: string) => SeoTitle.of(raw), 10, 60],
    ['SeoDescription', (raw: string) => SeoDescription.of(raw), 70, 160],
    ['Address', (raw: string) => Address.of(raw), 0, 160],
    ['PickupHours', (raw: string) => PickupHours.of(raw), 0, 120],
  ])('%s acepta los extremos del rango', (_name, of, min, max) => {
    expect(of(long(min)).value).toHaveLength(min);
    expect(of(long(max)).value).toHaveLength(max);
  });

  it.each([
    ['BrandName', (raw: string) => BrandName.of(raw), 1, 25],
    ['SeoTitle', (raw: string) => SeoTitle.of(raw), 9, 61],
    ['SeoDescription', (raw: string) => SeoDescription.of(raw), 69, 161],
    ['Tagline', (raw: string) => Tagline.of(raw), -1, 61],
  ])('%s rechaza fuera del rango', (_name, of, below, above) => {
    if (below >= 0) expect(() => of(long(below))).toThrow(InvalidSettingError);
    expect(() => of(long(above))).toThrow(InvalidSettingError);
  });
});

describe('textos de la marca: limpieza', () => {
  it('recorta espacios y junta los repetidos', () => {
    expect(BrandName.of('  Clic   Moda  SC ').value).toBe('Clic Moda SC');
  });

  it('rechaza etiquetas HTML y dice qué campo falló', () => {
    expect(() => BrandName.of('<b>Clic</b>')).toThrow(/no admite/);
    expect(() => BrandName.of('<b>')).toThrowError(expect.objectContaining({ field: 'brandName' }));
  });

  it('el rango del mensaje coincide con el límite', () => {
    expect(() => BrandName.of(long(25))).toThrow('entre 2 y 24');
    expect(() => Tagline.of(long(61))).toThrow('como máximo 60');
  });
});
