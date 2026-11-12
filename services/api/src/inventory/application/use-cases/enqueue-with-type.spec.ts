import { FieldValidationError } from '../../../shared/domain/errors/domain.error.js';
import { IdempotencyConflictError } from '../../domain/errors/inventory.errors.js';
import { VariantId } from '../../domain/value-objects/ids.vo.js';
import { FakeClock, InMemoryVariantLookup } from '../../testing/fakes.js';
import { InMemoryMovementTypesRepository } from '../../testing/in-memory-movement-types.repository.js';
import { InMemoryStockCommandsRepository } from '../../testing/in-memory-stock-commands.repository.js';
import { InMemoryStockProcessing } from '../../testing/in-memory-stock-processing.js';
import { InMemoryStockStore } from '../../testing/in-memory-stock-store.js';
import { SetMovementTypeActiveCommand } from '../dtos/movement-type.dtos.js';
import { EnqueueStockCommand } from '../dtos/stock.dtos.js';
import { EnqueueStockCommandUseCase } from './enqueue-stock-command.use-case.js';
import { ProcessNextStockCommandUseCase } from './process-next-stock-command.use-case.js';
import { SetMovementTypeActiveUseCase } from './set-movement-type-active.use-case.js';

function setup() {
  const store = new InMemoryStockStore();
  const types = InMemoryMovementTypesRepository.seeded();
  const variants = new InMemoryVariantLookup();
  const clock = new FakeClock();
  const variantId = VariantId.generate();
  variants.add(variantId);
  return {
    store,
    variantId: variantId.value,
    enqueue: new EnqueueStockCommandUseCase(
      new InMemoryStockCommandsRepository(store),
      types,
      variants,
      clock
    ),
    process: new ProcessNextStockCommandUseCase(new InMemoryStockProcessing(store), clock),
    setActive: new SetMovementTypeActiveUseCase(types),
  };
}
type World = ReturnType<typeof setup>;

const send = (world: World, kind: string, typeCode?: string, key?: string, units = 3) =>
  world.enqueue.execute(
    new EnqueueStockCommand(world.variantId, kind, units, 'Prueba de tipo', 'u-1', key, typeCode)
  );

describe('el comando lleva el código del tipo', () => {
  it('guarda el tipo elegido y, sin código, el de sistema de la clase', async () => {
    const world = setup();

    const sale = await send(world, 'WITHDRAW', 'SALE');
    const plain = await send(world, 'RECEIVE');

    expect([sale.command.typeCode, plain.command.typeCode]).toEqual(['SALE', 'RECEIVE']);
  });

  it('un tipo desconocido, inactivo o de otra clase se rechaza sin crear el comando', async () => {
    const world = setup();
    await world.setActive.execute(new SetMovementTypeActiveCommand('GIFT', false));

    for (const [kind, code] of [
      ['WITHDRAW', 'NOPE'],
      ['WITHDRAW', 'GIFT'],
      ['RECEIVE', 'SHRINKAGE'],
    ]) {
      const failure = send(world, kind as string, code);
      await expect(failure).rejects.toBeInstanceOf(FieldValidationError);
      await expect(failure).rejects.toMatchObject({ issues: [{ field: 'typeCode' }] });
    }
    expect(world.store.commands.size).toBe(0);
  });
});

describe('idempotencia y desactivación con tipos', () => {
  it('la misma clave con otro tipo de la misma clase es conflicto', async () => {
    const world = setup();
    await send(world, 'WITHDRAW', 'SALE', 'clave-123456');

    await expect(send(world, 'WITHDRAW', 'GIFT', 'clave-123456')).rejects.toBeInstanceOf(
      IdempotencyConflictError
    );
  });

  it('un comando pendiente cuyo tipo se desactiva después se procesa con ese tipo', async () => {
    const world = setup();
    await send(world, 'RECEIVE');
    await send(world, 'WITHDRAW', 'GIFT');
    await world.setActive.execute(new SetMovementTypeActiveCommand('GIFT', false));

    while (await world.process.execute()) continue;

    expect(world.store.movements.map((movement) => movement.typeCode.value)).toEqual([
      'RECEIVE',
      'GIFT',
    ]);
  });
});
