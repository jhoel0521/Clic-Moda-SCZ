import { FieldValidationError } from '../../../shared/domain/errors/domain.error.js';
import {
  MovementTypeNotFoundError,
  SystemTypeProtectedError,
} from '../../domain/errors/movement-type.errors.js';
import { seedMovementTypes } from '../../domain/movement-type-seed.js';
import { FakeClock } from '../../testing/fakes.js';
import { InMemoryMovementTypesRepository } from '../../testing/in-memory-movement-types.repository.js';
import {
  CreateMovementTypeCommand,
  ListMovementTypesQuery,
  RenameMovementTypeCommand,
  SetMovementTypeActiveCommand,
} from '../dtos/movement-type.dtos.js';
import { CreateMovementTypeUseCase } from './create-movement-type.use-case.js';
import { ListMovementTypesUseCase } from './list-movement-types.use-case.js';
import { RenameMovementTypeUseCase } from './rename-movement-type.use-case.js';
import { SetMovementTypeActiveUseCase } from './set-movement-type-active.use-case.js';

async function world() {
  const types = new InMemoryMovementTypesRepository();
  const clock = new FakeClock();
  for (const type of seedMovementTypes(clock.now())) await types.add(type);
  return {
    create: new CreateMovementTypeUseCase(types, clock),
    rename: new RenameMovementTypeUseCase(types),
    setActive: new SetMovementTypeActiveUseCase(types),
    list: new ListMovementTypesUseCase(types),
  };
}
const newType = (name: string, kind = 'RECEIVE') => new CreateMovementTypeCommand(name, kind);
const toggle = (code: string, active: boolean) => new SetMovementTypeActiveCommand(code, active);

describe('crear un tipo de movimiento', () => {
  it('genera el código desde el nombre y lo deja activo', async () => {
    const { create } = await world();

    const created = await create.execute(newType('Cambio por talla', 'receive'));

    expect([created.code, created.kind, created.active, created.system]).toEqual([
      'CAMBIO_POR_TALLA',
      'RECEIVE',
      true,
      false,
    ]);
  });

  it('un nombre repetido recibe un sufijo en el código', async () => {
    const { create } = await world();
    await create.execute(newType('Cambio por talla'));

    expect((await create.execute(newType('Cambio por talla'))).code).toBe('CAMBIO_POR_TALLA_2');
  });
});

describe('crear con datos inválidos', () => {
  it('un nombre inválido se informa en el campo del nombre', async () => {
    const { create } = await world();

    await expect(create.execute(newType('ab'))).rejects.toMatchObject({
      issues: [{ field: 'name' }],
    });
  });

  it('una clase desconocida se informa en el campo de la clase', async () => {
    const { create } = await world();
    const failure = create.execute(newType('Cambio por talla', 'X'));

    await expect(failure).rejects.toBeInstanceOf(FieldValidationError);
    await expect(failure).rejects.toMatchObject({ issues: [{ field: 'kind' }] });
  });
});

describe('listar y renombrar', () => {
  it('lista primero los de sistema y oculta los inactivos por omisión', async () => {
    const { create, setActive, list } = await world();
    await create.execute(newType('Cambio por talla'));
    await setActive.execute(toggle('GIFT', false));

    const active = await list.execute(new ListMovementTypesQuery());
    const all = await list.execute(new ListMovementTypesQuery(true));

    expect(active.slice(0, 3).map((type) => type.code)).toEqual(['RECEIVE', 'WITHDRAW', 'ADJUST']);
    expect(active.map((type) => type.code)).not.toContain('GIFT');
    expect(all.map((type) => type.code)).toContain('GIFT');
  });

  it('renombrar conserva el código y la clase', async () => {
    const { rename } = await world();

    const renamed = await rename.execute(new RenameMovementTypeCommand('SALE', 'Venta al cliente'));

    expect([renamed.code, renamed.name, renamed.kind]).toEqual([
      'SALE',
      'Venta al cliente',
      'WITHDRAW',
    ]);
  });
});

describe('desactivar', () => {
  it('un tipo de sistema no se desactiva', async () => {
    const { setActive } = await world();

    await expect(setActive.execute(toggle('RECEIVE', false))).rejects.toBeInstanceOf(
      SystemTypeProtectedError
    );
  });

  it('un código desconocido o mal escrito no existe', async () => {
    const { setActive } = await world();

    await expect(setActive.execute(toggle('NOPE', false))).rejects.toBeInstanceOf(
      MovementTypeNotFoundError
    );
    await expect(setActive.execute(toggle('malo', false))).rejects.toBeInstanceOf(
      MovementTypeNotFoundError
    );
  });

  it('un tipo desactivado se vuelve a activar', async () => {
    const { setActive } = await world();
    await setActive.execute(toggle('GIFT', false));

    expect((await setActive.execute(toggle('GIFT', true))).active).toBe(true);
  });
});
