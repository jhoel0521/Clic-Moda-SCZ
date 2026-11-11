import { ValueObject } from '../../../shared/domain/value-object.js';
import { InsufficientContrastError, InvalidSettingError } from '../errors/settings.errors.js';
import { checkContrast, derivePalette, HEX_COLOR, type Palette } from '../palette.js';

// Color primario de la marca. Solo existe si cumple el contraste AA: la tienda nunca recibe uno ilegible.
export class BrandColor extends ValueObject<{ value: string }> {
  static of(raw: string): BrandColor {
    const value = raw.trim().toLowerCase();
    if (!HEX_COLOR.test(value)) {
      throw new InvalidSettingError('brandColor', 'El color debe ser #rrggbb');
    }
    const report = checkContrast(value);
    if (!report.ok) throw new InsufficientContrastError(report.reasons, report.suggestion);
    return new BrandColor({ value });
  }

  get value(): string {
    return this.props.value;
  }

  get palette(): Palette {
    return derivePalette(this.props.value);
  }
}
