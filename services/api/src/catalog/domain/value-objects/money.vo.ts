import { ValueObject } from '../../../shared/domain/value-object.js';
import { InvalidMoneyError } from '../errors/invalid-value.errors.js';

const MAX_CENTS = 10_000_000; // 100 000 Bs
const DECIMAL_FORMAT = /^(\d{1,8})(?:\.(\d{1,2}))?$/;

// Dinero en bolivianos como centavos enteros: nunca hay errores de redondeo de coma flotante.
export class Money extends ValueObject<{ cents: number }> {
  static ofCents(cents: number): Money {
    if (!Number.isInteger(cents)) throw new InvalidMoneyError('los centavos deben ser un entero');
    if (cents <= 0) throw new InvalidMoneyError('debe ser mayor que cero');
    if (cents > MAX_CENTS) throw new InvalidMoneyError('supera el máximo de 100000 Bs');
    return new Money({ cents });
  }

  // Acepta "349.90", "349.9" o "349"; rechaza más de dos decimales, signos y texto.
  static ofDecimal(raw: string | number): Money {
    const match = DECIMAL_FORMAT.exec(String(raw).trim());
    if (!match) throw new InvalidMoneyError('use números con hasta dos decimales');
    const cents = Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
    return Money.ofCents(cents);
  }

  get cents(): number {
    return this.props.cents;
  }

  // "349.90": el formato que reciben y devuelven los clientes de la API.
  toDecimal(): string {
    const whole = Math.floor(this.cents / 100);
    return `${whole}.${String(this.cents % 100).padStart(2, '0')}`;
  }
}
