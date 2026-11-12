import { SEED_TYPES } from '../../../inventory/domain/movement-type-seed.js';
import { MIGRATION_SEED_TYPES } from './migrations/1794800000001-CreateMovementTypes.js';

describe('migración de los tipos de movimiento', () => {
  it('siembra exactamente los tipos que el dominio declara', () => {
    const fromDomain = SEED_TYPES.map((seed) => [seed.code, seed.name, seed.kind, seed.system]);

    expect(MIGRATION_SEED_TYPES.map((row) => [...row])).toEqual(fromDomain);
  });
});
