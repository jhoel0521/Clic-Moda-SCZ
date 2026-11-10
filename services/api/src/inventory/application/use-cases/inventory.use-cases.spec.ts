import { ValidationError } from '../../../shared/domain/errors/domain.error.js';
import {
  CommandNotFoundError,
  IdempotencyConflictError,
  VariantInactiveError,
  VariantUnavailableError,
} from '../../domain/errors/inventory.errors.js';
import { CommandId, VariantId } from '../../domain/value-objects/ids.vo.js';
import { FakeClock, InMemoryVariantLookup } from '../../testing/fakes.js';
import { InMemoryStockCommandsRepository } from '../../testing/in-memory-stock-commands.repository.js';
import { InMemoryStockLevelsRepository } from '../../testing/in-memory-stock-levels.repository.js';
import { InMemoryStockProcessing } from '../../testing/in-memory-stock-processing.js';
import { InMemoryStockQuery } from '../../testing/in-memory-stock-query.js';
import { InMemoryStockStore } from '../../testing/in-memory-stock-store.js';
import {
  EnqueueStockCommand,
  GetStockCommandQuery,
  UpdateStockSettingsCommand,
} from '../dtos/stock.dtos.js';
import { EnqueueStockCommandUseCase } from './enqueue-stock-command.use-case.js';
import { GetQueueStatusUseCase } from './get-queue-status.use-case.js';
import { GetStockCommandUseCase } from './get-stock-command.use-case.js';
import { ListLowStockUseCase } from './list-low-stock.use-case.js';
import { ListMovementsQuery, ListMovementsUseCase } from './list-movements.use-case.js';
import { ListStockUseCase } from './list-stock.use-case.js';
import { ProcessNextStockCommandUseCase } from './process-next-stock-command.use-case.js';
import { UpdateStockSettingsUseCase } from './update-stock-settings.use-case.js';

// Registra una variante activa tanto para validar el encolado como para el modelo de lectura.
function registerVariant(store: InMemoryStockStore, variants: InMemoryVariantLookup): string {
  const id = VariantId.generate();
  variants.add(id);
  store.variants.set(id.value, {
    sku: 'RUN-38',
    productName: 'Runner',
    size: '38',
    color: null,
    active: true,
  });
  return id.value;
}

function setup() {
  const store = new InMemoryStockStore();
  const commands = new InMemoryStockCommandsRepository(store);
  const levels = new InMemoryStockLevelsRepository(store);
  const variants = new InMemoryVariantLookup();
  const clock = new FakeClock();
  const variantId = registerVariant(store, variants);
  return {
    store,
    clock,
    variants,
    variantId,
    enqueue: new EnqueueStockCommandUseCase(commands, variants, clock),
    process: new ProcessNextStockCommandUseCase(new InMemoryStockProcessing(store), clock),
    get: new GetStockCommandUseCase(commands),
    queue: new GetQueueStatusUseCase(commands, clock),
    settings: new UpdateStockSettingsUseCase(levels, variants),
    list: new ListStockUseCase(new InMemoryStockQuery(store)),
    low: new ListLowStockUseCase(new InMemoryStockQuery(store)),
    movements: new ListMovementsUseCase(new InMemoryStockQuery(store)),
  };
}
type World = ReturnType<typeof setup>;

const receive = (world: World, units: number, key?: string) =>
  world.enqueue.execute(
    new EnqueueStockCommand(world.variantId, 'RECEIVE', units, 'Compra proveedor', 'u-1', key)
  );

const drain = async (world: World) => {
  const results = [];
  for (let next = await world.process.execute(); next; next = await world.process.execute())
    results.push(next);
  return results;
};

describe('EnqueueStockCommandUseCase', () => {
  it('acepta el comando PENDING sin cambiar el stock', async () => {
    const world = setup();
    const { command, created } = await receive(world, 12);

    expect([created, command.status, command.units, command.seq]).toEqual([true, 'PENDING', 12, 1]);
    expect(world.store.levels.size).toBe(0);
  });

  it('un reintento con la misma clave devuelve el original; con otro contenido es conflicto', async () => {
    const world = setup();
    const first = await receive(world, 5, 'clave-123456');
    const again = await receive(world, 5, 'clave-123456');

    expect([again.created, again.command.id]).toEqual([false, first.command.id]);
    await expect(receive(world, 6, 'clave-123456')).rejects.toThrow(IdempotencyConflictError);
  });
});

describe('EnqueueStockCommandUseCase (2)', () => {
  it('el ajuste por conteo acepta cero', async () => {
    const world = setup();
    const adjust = new EnqueueStockCommand(
      world.variantId,
      'ADJUST',
      0,
      'Conteo del sábado',
      'u-1'
    );

    expect((await world.enqueue.execute(adjust)).command.units).toBe(0);
  });
});

describe('EnqueueStockCommandUseCase: validaciones', () => {
  it('rechaza una variante inexistente o inactiva sin encolar nada', async () => {
    const world = setup();
    const inactive = VariantId.generate();
    world.variants.add(inactive, false);
    const to = (variantId: string) =>
      new EnqueueStockCommand(variantId, 'RECEIVE', 1, 'Motivo válido', 'u-1');

    await expect(world.enqueue.execute(to(VariantId.generate().value))).rejects.toThrow(
      VariantUnavailableError
    );
    await expect(world.enqueue.execute(to(inactive.value))).rejects.toThrow(VariantInactiveError);
    expect((await world.queue.execute()).pending).toBe(0);
  });
});

describe('EnqueueStockCommandUseCase: validaciones (2)', () => {
  it.each([
    ['cantidad cero en un ingreso', 'RECEIVE', 0, 'Motivo válido'],
    ['tipo desconocido', 'DELETE', 1, 'Motivo válido'],
    ['motivo muy corto', 'RECEIVE', 1, 'ab'],
    ['cantidad decimal', 'WITHDRAW', 1.5, 'Motivo válido'],
  ])('rechaza %s y no encola', async (_name, type, units, reason) => {
    const world = setup();

    await expect(
      world.enqueue.execute(new EnqueueStockCommand(world.variantId, type, units, reason, 'u-1'))
    ).rejects.toThrow(ValidationError);
    expect((await world.queue.execute()).pending).toBe(0);
  });
});

describe('ProcessNextStockCommandUseCase', () => {
  it('devuelve null si la cola está vacía y aplica un ingreso', async () => {
    const world = setup();
    expect(await world.process.execute()).toBeNull();
    await receive(world, 12);
    const processed = await world.process.execute();

    expect([processed?.outcome, processed?.command.status]).toEqual(['APPLIED', 'APPLIED']);
    expect(world.store.levels.get(world.variantId)?.onHand).toBe(12);
  });
});

describe('ProcessNextStockCommandUseCase (2)', () => {
  it('100 salidas sobre 3 unidades: gana el orden de llegada, 3 aplicadas y 97 rechazadas', async () => {
    const world = setup();
    await receive(world, 3);
    const withdrawals = [];
    for (let i = 0; i < 100; i++) {
      const out = new EnqueueStockCommand(world.variantId, 'WITHDRAW', 1, 'Venta del Live', 'u-1');
      withdrawals.push((await world.enqueue.execute(out)).command.id);
    }
    await drain(world);

    const states = await Promise.all(
      withdrawals.map(async (id) => (await world.get.execute(new GetStockCommandQuery(id))).status)
    );
    expect(states.filter((s) => s === 'APPLIED')).toHaveLength(3);
    expect(states.slice(0, 3)).toEqual(['APPLIED', 'APPLIED', 'APPLIED']);
    expect(world.store.levels.get(world.variantId)?.onHand).toBe(0);
  });
});

describe('GetStockCommandUseCase y GetQueueStatusUseCase', () => {
  it('consulta el comando hasta su estado final, con el motivo del rechazo', async () => {
    const world = setup();
    const out = new EnqueueStockCommand(world.variantId, 'WITHDRAW', 5, 'Venta del Live', 'u-1');
    const { command } = await world.enqueue.execute(out);
    expect((await world.get.execute(new GetStockCommandQuery(command.id))).status).toBe('PENDING');
    await drain(world);

    const done = await world.get.execute(new GetStockCommandQuery(command.id));
    expect([done.status, done.rejectReason]).toEqual(['REJECTED', 'INSUFFICIENT_STOCK']);
    await expect(
      world.get.execute(new GetStockCommandQuery(CommandId.generate().value))
    ).rejects.toThrow(CommandNotFoundError);
  });

  it('informa los pendientes y la antigüedad del más viejo', async () => {
    const world = setup();
    expect(await world.queue.execute()).toEqual({ pending: 0, oldestPendingAgeSeconds: null });
    await receive(world, 1);
    world.clock.advance(90_000);

    expect(await world.queue.execute()).toEqual({ pending: 1, oldestPendingAgeSeconds: 90 });
  });
});

describe('UpdateStockSettingsUseCase', () => {
  it('guarda ubicación y umbral sin tocar las unidades y sin pasar por la cola', async () => {
    const world = setup();
    await receive(world, 8);
    await drain(world);
    const saved = await world.settings.execute(
      new UpdateStockSettingsCommand(world.variantId, 'Estante A-2', 3)
    );

    expect(saved).toMatchObject({ location: 'Estante A-2', reorderLevel: 3 });
    expect(world.store.levels.get(world.variantId)?.onHand).toBe(8);
  });

  it('una ubicación en blanco se guarda como nula y una variante inexistente falla', async () => {
    const world = setup();
    expect(
      (await world.settings.execute(new UpdateStockSettingsCommand(world.variantId, '  ', 0)))
        .location
    ).toBeNull();
    await expect(
      world.settings.execute(new UpdateStockSettingsCommand(VariantId.generate().value, 'A', 0))
    ).rejects.toThrow(VariantUnavailableError);
    await expect(
      world.settings.execute(new UpdateStockSettingsCommand(world.variantId, 'A', -1))
    ).rejects.toThrow(ValidationError);
  });
});

describe('Lecturas del almacén', () => {
  it('valida la paginación en todas las lecturas', async () => {
    const world = setup();

    await expect(world.list.execute({ page: 0, pageSize: 10 })).rejects.toThrow(ValidationError);
    await expect(world.low.execute({ page: 1, pageSize: 101 })).rejects.toThrow(ValidationError);
    await expect(
      world.movements.execute(new ListMovementsQuery(world.variantId, 1, 0))
    ).rejects.toThrow(ValidationError);
  });
});

describe('Lecturas del almacén (2)', () => {
  it('lista el stock, el stock bajo y los movimientos tras procesar', async () => {
    const world = setup();
    await receive(world, 2);
    await drain(world);

    expect(
      (await world.list.execute({ page: 1, pageSize: 10, text: ' runner ' })).items[0]
    ).toMatchObject({ sku: 'RUN-38', onHand: 2 });
    expect((await world.low.execute({ page: 1, pageSize: 10 })).total).toBe(0);
    expect(
      (await world.movements.execute(new ListMovementsQuery(world.variantId, 1, 10, 'receive')))
        .total
    ).toBe(1);
    await expect(
      world.movements.execute(new ListMovementsQuery(world.variantId, 1, 10, 'borrar'))
    ).rejects.toThrow(ValidationError);
  });
});
