import { StockCommand } from '../domain/entities/stock-command.entity.js';
import { IdempotencyConflictError } from '../domain/errors/inventory.errors.js';
import type { StockCommandsRepository } from '../domain/stock-commands.repository.port.js';
import type { CommandType } from '../domain/value-objects/command-values.js';
import { CommandId, type VariantId } from '../domain/value-objects/ids.vo.js';
import {
  IdempotencyKey,
  Operator,
  Quantity,
  Reason,
} from '../domain/value-objects/stock-values.vo.js';

export interface QueueWorld {
  commands: StockCommandsRepository;
  // Crea (o simula) una variante existente sobre la que se pueden encolar comandos.
  newVariant(): Promise<VariantId>;
}
type Factory = () => Promise<QueueWorld> | QueueWorld;

interface Options {
  type?: CommandType;
  units?: number;
  key?: string | null;
  reason?: string;
  at?: Date;
}

const command = (variantId: VariantId, options: Options = {}): StockCommand =>
  StockCommand.accept(
    {
      variantId,
      type: options.type ?? 'RECEIVE',
      quantity: Quantity.positive(options.units ?? 5),
      reason: Reason.of(options.reason ?? 'Compra proveedor'),
      operator: Operator.of('u-1'),
      idempotencyKey: options.key ? IdempotencyKey.of(options.key) : null,
    },
    options.at ?? new Date()
  );

function enqueueCases(make: Factory): void {
  it('acepta el comando PENDING, con orden de llegada y todos sus datos', async () => {
    const { commands, newVariant } = await make();
    const variantId = await newVariant();
    const { command: stored, created } = await commands.enqueue(command(variantId, { units: 7 }));

    expect([created, stored.status, stored.quantity.units]).toEqual([true, 'PENDING', 7]);
    expect(stored.seq).toBeGreaterThan(0);
    const found = await commands.findById(stored.id);
    expect([found?.type, found?.reason.value, found?.operator.value]).toEqual([
      'RECEIVE',
      'Compra proveedor',
      'u-1',
    ]);
  });

  it('findById devuelve null si el comando no existe', async () => {
    const { commands } = await make();

    expect(await commands.findById(CommandId.generate())).toBeNull();
  });
}

function orderCases(make: Factory): void {
  it('el número de orden crece con cada comando aceptado', async () => {
    const { commands, newVariant } = await make();
    const variantId = await newVariant();
    const first = await commands.enqueue(command(variantId));
    const second = await commands.enqueue(command(variantId));

    expect(second.command.seq).toBeGreaterThan(first.command.seq as number);
  });
}

function idempotencyCases(make: Factory): void {
  it('la misma clave y contenido devuelve el original sin crear otro', async () => {
    const { commands, newVariant } = await make();
    const variantId = await newVariant();
    const first = await commands.enqueue(command(variantId, { key: 'clave-uno-123' }));
    const again = await commands.enqueue(command(variantId, { key: 'clave-uno-123' }));

    expect([again.created, again.command.id.equals(first.command.id)]).toEqual([false, true]);
    expect((await commands.queueStats()).pending).toBe(1);
  });

  it('la misma clave con otro contenido es conflicto y no se guarda', async () => {
    const { commands, newVariant } = await make();
    const variantId = await newVariant();
    await commands.enqueue(command(variantId, { key: 'clave-uno-123', units: 5 }));

    await expect(
      commands.enqueue(command(variantId, { key: 'clave-uno-123', units: 6 }))
    ).rejects.toThrow(IdempotencyConflictError);
    expect((await commands.queueStats()).pending).toBe(1);
  });
}

function keylessCases(make: Factory): void {
  it('los comandos sin clave nunca se consideran repetidos', async () => {
    const { commands, newVariant } = await make();
    const variantId = await newVariant();
    await commands.enqueue(command(variantId));
    await commands.enqueue(command(variantId));

    expect((await commands.queueStats()).pending).toBe(2);
  });
}

function concurrencyCases(make: Factory): void {
  it('50 encolados simultáneos con la misma clave producen un solo comando', async () => {
    const { commands, newVariant } = await make();
    const variantId = await newVariant();
    const outcomes = await Promise.all(
      Array.from({ length: 50 }, () =>
        commands.enqueue(command(variantId, { key: 'misma-clave-12' }))
      )
    );

    expect(outcomes.filter((outcome) => outcome.created)).toHaveLength(1);
    expect(new Set(outcomes.map((outcome) => outcome.command.id.value)).size).toBe(1);
  });

  it('50 encolados simultáneos de una variante reciben números de orden únicos', async () => {
    const { commands, newVariant } = await make();
    const variantId = await newVariant();
    const outcomes = await Promise.all(
      Array.from({ length: 50 }, () => commands.enqueue(command(variantId)))
    );

    expect(new Set(outcomes.map((outcome) => outcome.command.seq)).size).toBe(50);
  });
}

function statsCases(make: Factory): void {
  it('sin comandos: cero pendientes y sin el más antiguo', async () => {
    const { commands } = await make();

    expect(await commands.queueStats()).toEqual({ pending: 0, oldestPendingAt: null });
  });

  it('cuenta los pendientes e informa la hora del más antiguo', async () => {
    const { commands, newVariant } = await make();
    const variantId = await newVariant();
    await commands.enqueue(command(variantId, { at: new Date('2026-11-10T10:00:00Z') }));
    await commands.enqueue(command(variantId, { at: new Date('2026-11-10T11:00:00Z') }));

    const stats = await commands.queueStats();
    expect(stats.pending).toBe(2);
    expect(stats.oldestPendingAt?.toISOString()).toBe('2026-11-10T10:00:00.000Z');
  });
}

// Suite de contrato: toda implementación del puerto (fake en memoria y TypeORM) debe pasarla.
export function stockCommandsRepositoryContract(label: string, make: Factory): void {
  describe(`StockCommandsRepository: ${label}`, () => {
    enqueueCases(make);
    orderCases(make);
    idempotencyCases(make);
    keylessCases(make);
    concurrencyCases(make);
    statsCases(make);
  });
}
