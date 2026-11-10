import { ValueObject } from './value-object.js';

type MoneyProps = { amount: number; currency: string };

class Money extends ValueObject<MoneyProps> {
  static of(amount: number, currency: string): Money {
    return new Money({ amount, currency });
  }

  get amount(): number {
    return this.props.amount;
  }
}

class Points extends ValueObject<MoneyProps> {
  static of(amount: number, currency: string): Points {
    return new Points({ amount, currency });
  }
}

describe('ValueObject', () => {
  it('es igual cuando los valores son iguales, aunque sean instancias distintas', () => {
    expect(Money.of(5, 'BOB').equals(Money.of(5, 'BOB'))).toBe(true);
  });

  it('es distinto cuando cambia algún valor', () => {
    expect(Money.of(5, 'BOB').equals(Money.of(6, 'BOB'))).toBe(false);
  });

  it('no es igual a otra clase con los mismos valores', () => {
    expect(Money.of(5, 'BOB').equals(Points.of(5, 'BOB') as never)).toBe(false);
  });

  it('no es igual a null ni a undefined', () => {
    const money = Money.of(5, 'BOB');

    expect([money.equals(null), money.equals(undefined)]).toEqual([false, false]);
  });

  it('es inmutable: no se pueden modificar sus valores', () => {
    const money = Money.of(5, 'BOB');
    const inner = (money as unknown as { props: MoneyProps }).props;

    expect(() => {
      inner.amount = 9;
    }).toThrow(TypeError);
    expect(money.amount).toBe(5);
  });
});
