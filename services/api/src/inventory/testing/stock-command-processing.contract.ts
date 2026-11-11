import type {
  StockCommandProcessingPort,
  StockDecider,
} from '../application/ports/inventory.ports.js';
import { StockCommand } from '../domain/entities/stock-command.entity.js';
import type { StockMovement } from '../domain/entities/stock-movement.entity.js';
import type { StockCommandsRepository } from '../domain/stock-commands.repository.port.js';
import type { StockLevelsRepository } from '../domain/stock-levels.repository.port.js';
import { StockPolicy } from '../domain/stock-policy.js';
import type { CommandType } from '../domain/value-objects/command-values.js';
import type { VariantId } from '../domain/value-objects/ids.vo.js';
import { Operator, Quantity, Reason } from '../domain/value-objects/stock-values.vo.js';

export interface ProcessingWorld {
  commands: StockCommandsRepository;
  levels: StockLevelsRepository;
  processing: StockCommandProcessingPort;
  newVariant(): Promise<VariantId>;
  movementsOf(variantId: VariantId): Promise<StockMovement[]>;
}
type Factory = () => Promise<ProcessingWorld> | ProcessingWorld;

const T0 = new Date('2026-11-10T10:00:00Z');
const later = (ms: number): Date => new Date(T0.getTime() + ms);

const stockCommand = (variantId: VariantId, type: CommandType, units: number): StockCommand =>
  StockCommand.accept(
    {
      variantId,
      type,
      quantity: type === 'ADJUST' ? Quantity.count(units) : Quantity.positive(units),
      reason: Reason.of('Prueba de contrato'),
      operator: Operator.of('u-1'),
      idempotencyKey: null,
    },
    T0
  );

async function enqueue(
  world: ProcessingWorld,
  variantId: VariantId,
  type: CommandType,
  units: number
) {
  return (await world.commands.enqueue(stockCommand(variantId, type, units))).command;
}

const decide: StockDecider = StockPolicy.decide;
const boom: StockDecider = () => {
  throw new Error('fallo simulado');
};

// Procesa hasta vaciar la cola (con el reloj fijo); devuelve los resultados en orden.
async function drain(world: ProcessingWorld, now: Date = T0) {
  const results = [];
  for (;;) {
    const next = await world.processing.processNext(decide, now);
    if (!next) return results;
    results.push(next);
  }
}

function basicCases(make: Factory): void {
  it('devuelve null si no hay comandos', async () => {
    const world = await make();

    expect(await world.processing.processNext(decide, T0)).toBeNull();
  });

  it('un ingreso queda APPLIED con su movimiento y el stock sube', async () => {
    const world = await make();
    const variantId = await world.newVariant();
    const received = await enqueue(world, variantId, 'RECEIVE', 12);
    const result = await world.processing.processNext(decide, T0);

    expect(result?.outcome).toBe('APPLIED');
    expect([result?.command.status, result?.movement?.delta]).toEqual(['APPLIED', 12]);
    expect((await world.commands.findById(received.id))?.movementId).not.toBeNull();
    expect((await world.levels.findByVariantId(variantId))?.onHand).toBe(12);
  });

  it('un comando resuelto no se procesa dos veces', async () => {
    const world = await make();
    const variantId = await world.newVariant();
    await enqueue(world, variantId, 'RECEIVE', 5);
    await drain(world);

    expect(await world.processing.processNext(decide, T0)).toBeNull();
    expect(await world.movementsOf(variantId)).toHaveLength(1);
  });
}

function orderCases(make: Factory): void {
  it('procesa en orden de llegada dentro de una variante', async () => {
    const world = await make();
    const variantId = await world.newVariant();
    const first = await enqueue(world, variantId, 'RECEIVE', 5);
    const second = await enqueue(world, variantId, 'WITHDRAW', 3);
    const order = (await drain(world)).map((result) => result.command.id.value);

    expect(order).toEqual([first.id.value, second.id.value]);
    expect((await world.levels.findByVariantId(variantId))?.onHand).toBe(2);
  });

  it('una salida mayor al disponible queda REJECTED sin tocar el stock ni crear movimiento', async () => {
    const world = await make();
    const variantId = await world.newVariant();
    await enqueue(world, variantId, 'WITHDRAW', 5);
    const [result] = await drain(world);

    expect([result?.outcome, result?.command.rejectReason]).toEqual([
      'REJECTED',
      'INSUFFICIENT_STOCK',
    ]);
    expect(await world.movementsOf(variantId)).toHaveLength(0);
  });
}

function orderCases2(make: Factory): void {
  it('un ajuste por conteo calcula el cambio al procesar', async () => {
    const world = await make();
    const variantId = await world.newVariant();
    for (const [type, units] of [
      ['RECEIVE', 10],
      ['ADJUST', 8],
    ] as const) {
      await enqueue(world, variantId, type, units);
    }
    await drain(world);

    expect((await world.movementsOf(variantId)).map((m) => m.delta).sort()).toEqual([-2, 10]);
    expect((await world.levels.findByVariantId(variantId))?.onHand).toBe(8);
  });
}

function firstComeCases(make: Factory): void {
  it('gana el primero: con 3 unidades y 10 salidas de 1, se aplican las 3 primeras y 7 se rechazan', async () => {
    const world = await make();
    const variantId = await world.newVariant();
    await enqueue(world, variantId, 'RECEIVE', 3);
    const withdrawals = [];
    for (let i = 0; i < 10; i++) withdrawals.push(await enqueue(world, variantId, 'WITHDRAW', 1));
    await drain(world);

    const finals = await Promise.all(withdrawals.map((c) => world.commands.findById(c.id)));
    expect(finals.map((c) => c?.status)).toEqual([
      ...Array(3).fill('APPLIED'),
      ...Array(7).fill('REJECTED'),
    ]);
    expect((await world.levels.findByVariantId(variantId))?.onHand).toBe(0);
  });
}

function firstComeCases2(make: Factory): void {
  it('el stock siempre coincide con la suma de los movimientos', async () => {
    const world = await make();
    const variantId = await world.newVariant();
    for (const [type, units] of [
      ['RECEIVE', 20],
      ['WITHDRAW', 7],
      ['ADJUST', 9],
      ['WITHDRAW', 50],
    ] as const) {
      await enqueue(world, variantId, type, units);
    }
    await drain(world);

    const sum = (await world.movementsOf(variantId)).reduce((total, m) => total + m.delta, 0);
    expect((await world.levels.findByVariantId(variantId))?.onHand).toBe(sum);
  });
}

function retryCases(make: Factory): void {
  it('un fallo no cambia nada: el comando sigue PENDING con un intento contado', async () => {
    const world = await make();
    const variantId = await world.newVariant();
    const received = await enqueue(world, variantId, 'RECEIVE', 5);
    const result = await world.processing.processNext(boom, T0);
    const after = await world.commands.findById(received.id);

    expect(result?.outcome).toBe('RETRY');
    expect([after?.status, after?.attempts]).toEqual(['PENDING', 1]);
    expect((await world.levels.findByVariantId(variantId))?.onHand ?? 0).toBe(0);
    expect(await world.movementsOf(variantId)).toHaveLength(0);
  });
}

function retryCases2(make: Factory): void {
  it('un comando en espera de reintento bloquea a los posteriores de su variante, no a las otras', async () => {
    const world = await make();
    const [blocked, other] = [await world.newVariant(), await world.newVariant()];
    const first = await enqueue(world, blocked, 'RECEIVE', 5);
    await enqueue(world, blocked, 'RECEIVE', 7);
    const unrelated = await enqueue(world, other, 'RECEIVE', 1);
    await world.processing.processNext(boom, T0);

    const processed = (await drain(world, T0)).map((result) => result.command.id.value);
    expect(processed).toEqual([unrelated.id.value]);
    expect((await world.commands.findById(first.id))?.status).toBe('PENDING');
  });

  it('pasada la espera, el comando se reintenta y luego sigue el siguiente', async () => {
    const world = await make();
    const variantId = await world.newVariant();
    const first = await enqueue(world, variantId, 'RECEIVE', 5);
    const second = await enqueue(world, variantId, 'RECEIVE', 7);
    await world.processing.processNext(boom, T0);

    const order = (await drain(world, later(60_000))).map((result) => result.command.id.value);
    expect(order).toEqual([first.id.value, second.id.value]);
  });
}

function retryCases3(make: Factory): void {
  it('agotados los 5 intentos queda REJECTED con PROCESSING_FAILED y la cola avanza', async () => {
    const world = await make();
    const variantId = await world.newVariant();
    const poison = await enqueue(world, variantId, 'RECEIVE', 5);
    const next = await enqueue(world, variantId, 'RECEIVE', 7);
    for (let attempt = 1; attempt <= 5; attempt++) {
      await world.processing.processNext(boom, later(attempt * 3_600_000));
    }

    const failed = await world.commands.findById(poison.id);
    expect([failed?.status, failed?.rejectReason, failed?.attempts]).toEqual([
      'REJECTED',
      'PROCESSING_FAILED',
      5,
    ]);
    await drain(world, later(10 * 3_600_000));
    expect((await world.commands.findById(next.id))?.status).toBe('APPLIED');
  });
}

// Suite de contrato: toda implementación del puerto (fake en memoria y TypeORM) debe pasarla.
export function stockCommandProcessingContract(label: string, make: Factory): void {
  describe(`StockCommandProcessingPort: ${label}`, () => {
    basicCases(make);
    orderCases(make);
    orderCases2(make);
    firstComeCases(make);
    firstComeCases2(make);
    retryCases(make);
    retryCases2(make);
    retryCases3(make);
  });
}
