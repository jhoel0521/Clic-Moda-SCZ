import { isDeepStrictEqual } from 'node:util';

// Objeto de valor: inmutable y comparado por valor (no por identidad). Las subclases validan en su
// fábrica estática (`of`/`create`) y lanzan un error de dominio si el valor no es válido.
export abstract class ValueObject<Props extends object> {
  protected readonly props: Readonly<Props>;

  protected constructor(props: Props) {
    this.props = Object.freeze({ ...props });
  }

  equals(other?: ValueObject<Props> | null): boolean {
    if (!other || other.constructor !== this.constructor) return false;
    return isDeepStrictEqual(this.props, other.props);
  }
}
