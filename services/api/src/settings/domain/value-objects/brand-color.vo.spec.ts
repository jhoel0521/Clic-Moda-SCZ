import { InsufficientContrastError, InvalidSettingError } from '../errors/settings.errors.js';
import { BrandColor } from './brand-color.vo.js';

describe('BrandColor', () => {
  it('acepta el rosa por defecto y expone su paleta', () => {
    const color = BrandColor.of(' #C7305A ');

    expect([color.value, color.palette.dark]).toEqual(['#c7305a', '#9e2647']);
  });

  it('rechaza un formato que no es #rrggbb', () => {
    expect(() => BrandColor.of('rojo')).toThrow(InvalidSettingError);
    expect(() => BrandColor.of('#fff')).toThrow('#rrggbb');
  });

  it('rechaza por contraste e incluye el color cercano que sí pasa', () => {
    expect(() => BrandColor.of('#e63f6e')).toThrow(InsufficientContrastError);
    expect(() => BrandColor.of('#e63f6e')).toThrow('#e2245a');
  });
});
