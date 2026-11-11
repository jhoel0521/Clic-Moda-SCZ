import type { StockCommand } from './entities/stock-command.entity.js';
import type { StockLevel } from './entities/stock-level.entity.js';
import type { RejectReason } from './value-objects/command-values.js';

export type StockDecision =
  | { readonly kind: 'APPLY'; readonly delta: number }
  | { readonly kind: 'REJECT'; readonly reason: RejectReason };

const apply = (delta: number): StockDecision => ({ kind: 'APPLY', delta });
const reject = (reason: RejectReason): StockDecision => ({ kind: 'REJECT', reason });

// Regla de negocio pura: decide qué pasa con un comando según el stock actual. No toca nada.
export const StockPolicy = {
  decide(command: StockCommand, level: StockLevel): StockDecision {
    const units = command.quantity.units;
    if (command.type === 'RECEIVE') return apply(units);
    if (command.type === 'WITHDRAW') {
      return units > level.available ? reject('INSUFFICIENT_STOCK') : apply(-units);
    }
    // ADJUST: la cantidad es el conteo físico real; el cambio se calcula con el stock de ese instante.
    if (units < level.reserved) return reject('BELOW_RESERVED');
    const delta = units - level.onHand;
    return delta === 0 ? reject('NO_CHANGE') : apply(delta);
  },
};
