import { MovementType } from '../domain/entities/movement-type.entity.js';
import { MovementTypeCodeTakenError } from '../domain/errors/movement-type.errors.js';
import { SEED_TYPES } from '../domain/movement-type-seed.js';
import type { MovementTypesRepository } from '../domain/movement-types.repository.port.js';
import { TypeCode, TypeName } from '../domain/value-objects/type-values.vo.js';

type Factory = () => Promise<MovementTypesRepository> | MovementTypesRepository;

const NOW = new Date('2026-11-12T12:00:00Z');
const fresh = (name: string): MovementType =>
  MovementType.create({ name: TypeName.of(name), kind: 'WITHDRAW', takenCodes: new Set() }, NOW);

function listingCases(make: Factory): void {
  it('lista los tipos con los que nace el sistema, los de sistema primero', async () => {
    const types = await make();

    const listed = await types.list({ includeInactive: false });

    expect(listed.map((type) => type.code.value)).toEqual(SEED_TYPES.map((seed) => seed.code));
    expect(listed.slice(0, 3).every((type) => type.system)).toBe(true);
  });

  it('un código desconocido devuelve null', async () => {
    const types = await make();

    expect(await types.findByCode(TypeCode.of('NO_EXISTE'))).toBeNull();
  });
}

function addingCases(make: Factory): void {
  it('agrega un tipo nuevo, lo encuentra por su código y lo cuenta entre los códigos', async () => {
    const types = await make();
    await types.add(fresh('Cambio por talla'));

    const found = await types.findByCode(TypeCode.of('CAMBIO_POR_TALLA'));

    expect([found?.name.value, found?.kind, found?.active, found?.system]).toEqual([
      'Cambio por talla',
      'WITHDRAW',
      true,
      false,
    ]);
    expect((await types.codes()).has('CAMBIO_POR_TALLA')).toBe(true);
  });

  it('agregar un código que ya existe falla sin pisar el tipo anterior', async () => {
    const types = await make();
    await types.add(fresh('Cambio por talla'));

    await expect(types.add(fresh('Cambio por talla'))).rejects.toBeInstanceOf(
      MovementTypeCodeTakenError
    );
  });
}

// Suite de contrato: toda implementación del puerto (fake en memoria y TypeORM) debe pasarla. La
// fábrica devuelve un repositorio que ya tiene los tipos con los que nace el sistema (SEED_TYPES).
export function movementTypesRepositoryContract(label: string, make: Factory): void {
  describe(`MovementTypesRepository: ${label}`, () => {
    listingCases(make);
    addingCases(make);
  });
}
