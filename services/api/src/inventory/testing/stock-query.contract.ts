import type { StockQueryPort } from '../application/ports/inventory.ports.js';
import type { CommandType } from '../domain/value-objects/command-values.js';
import type { VariantId } from '../domain/value-objects/ids.vo.js';

export interface VariantInfo {
  sku: string;
  productName: string;
  size?: string;
  color?: string | null;
  active?: boolean;
}

export interface QueryWorld {
  query: StockQueryPort;
  newVariant(info: VariantInfo): Promise<VariantId>;
  setLevel(
    variantId: VariantId,
    level: { onHand: number; reserved?: number; reorderLevel?: number; location?: string | null }
  ): Promise<void>;
  addMovement(
    variantId: VariantId,
    movement: { type: CommandType; delta: number; occurredAt: Date }
  ): Promise<void>;
}
type Factory = () => Promise<QueryWorld> | QueryWorld;

const paging = { page: 1, pageSize: 50 };

async function seed(world: QueryWorld) {
  const runner = await world.newVariant({
    sku: 'RUN-38',
    productName: 'Tenis Runner',
    size: '38',
    color: 'Negro',
  });
  const boot = await world.newVariant({ sku: 'BOT-40', productName: 'Bota', size: '40' });
  const old = await world.newVariant({ sku: 'OLD-41', productName: 'Tenis Viejo', active: false });
  await world.setLevel(runner, {
    onHand: 10,
    reserved: 3,
    reorderLevel: 7,
    location: 'Estante A-2',
  });
  await world.setLevel(boot, { onHand: 20, reorderLevel: 2 });
  await world.setLevel(old, { onHand: 0, reorderLevel: 5 });
  return { runner, boot, old };
}

function stockCases(make: Factory): void {
  it('une el stock con el producto: físico, reservado, disponible, ubicación y umbral', async () => {
    const world = await make();
    await seed(world);
    const page = await world.query.listStock(paging);
    const runner = page.items.find((row) => row.sku === 'RUN-38');

    expect(page.total).toBe(3);
    expect(runner).toMatchObject({
      productName: 'Tenis Runner',
      size: '38',
      color: 'Negro',
      onHand: 10,
      reserved: 3,
      available: 7,
      location: 'Estante A-2',
      reorderLevel: 7,
      active: true,
    });
  });
}

function stockCases2(make: Factory): void {
  it('una variante sin fila de stock aparece con ceros', async () => {
    const world = await make();
    await world.newVariant({ sku: 'NEW-1', productName: 'Nuevo' });
    const [row] = (await world.query.listStock(paging)).items;

    expect([row?.onHand, row?.reserved, row?.available, row?.location, row?.reorderLevel]).toEqual([
      0,
      0,
      0,
      null,
      0,
    ]);
  });
}

function stockCases3(make: Factory): void {
  it('busca por SKU o nombre sin distinguir mayúsculas y pagina con el total', async () => {
    const world = await make();
    await seed(world);

    expect((await world.query.listStock({ ...paging, text: 'tenis' })).items).toHaveLength(2);
    expect(
      (await world.query.listStock({ ...paging, text: 'bot-4' })).items.map((r) => r.sku)
    ).toEqual(['BOT-40']);
    const second = await world.query.listStock({ page: 2, pageSize: 2 });
    expect([second.total, second.items.length]).toEqual([3, 1]);
  });
}

function lowStockCases(make: Factory): void {
  it('lista las activas con disponible en el umbral o por debajo, de menos a más disponible', async () => {
    const world = await make();
    const { runner } = await seed(world);
    const extra = await world.newVariant({ sku: 'LOW-1', productName: 'Sandalia' });
    await world.setLevel(extra, { onHand: 1, reorderLevel: 1 });
    const low = await world.query.listLowStock(paging);

    expect(low.items.map((row) => row.sku)).toEqual(['LOW-1', 'RUN-38']);
    expect(low.items.every((row) => row.available <= row.reorderLevel)).toBe(true);
    expect(runner).toBeDefined();
  });

  it('excluye las variantes inactivas aunque estén por debajo del umbral', async () => {
    const world = await make();
    await seed(world);

    expect((await world.query.listLowStock(paging)).items.some((row) => row.sku === 'OLD-41')).toBe(
      false
    );
  });
}

function movementCases(make: Factory): void {
  it('lista los movimientos del más reciente al más antiguo y filtra por tipo y fechas', async () => {
    const world = await make();
    const { boot } = await seed(world);
    const at = (hour: number) => new Date(`2026-11-10T${hour}:00:00Z`);
    await world.addMovement(boot, { type: 'RECEIVE', delta: 20, occurredAt: at(10) });
    await world.addMovement(boot, { type: 'WITHDRAW', delta: -2, occurredAt: at(11) });
    await world.addMovement(boot, { type: 'ADJUST', delta: -1, occurredAt: at(12) });

    const all = await world.query.listMovements(boot, paging);
    expect(all.items.map((m) => m.delta)).toEqual([-1, -2, 20]);
    expect(
      (await world.query.listMovements(boot, { ...paging, type: 'WITHDRAW' })).items
    ).toHaveLength(1);
    expect(
      (await world.query.listMovements(boot, { ...paging, from: at(11), to: at(11) })).total
    ).toBe(1);
  });
}

function movementCases2(make: Factory): void {
  it('pagina el historial y no mezcla variantes', async () => {
    const world = await make();
    const { boot, runner } = await seed(world);
    for (const hour of [10, 11, 12]) {
      await world.addMovement(boot, {
        type: 'RECEIVE',
        delta: 1,
        occurredAt: new Date(`2026-11-10T${hour}:00:00Z`),
      });
    }
    await world.addMovement(runner, {
      type: 'RECEIVE',
      delta: 5,
      occurredAt: new Date('2026-11-10T09:00:00Z'),
    });

    const second = await world.query.listMovements(boot, { page: 2, pageSize: 2 });
    expect([second.total, second.items.length]).toEqual([3, 1]);
  });
}

// Suite de contrato: toda implementación del puerto (fake en memoria y SQL) debe pasarla.
export function stockQueryContract(label: string, make: Factory): void {
  describe(`StockQueryPort: ${label}`, () => {
    stockCases(make);
    stockCases2(make);
    stockCases3(make);
    lowStockCases(make);
    movementCases(make);
    movementCases2(make);
  });
}
